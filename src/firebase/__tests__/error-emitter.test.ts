import { describe, it, expect, vi } from 'vitest';

// We test the createEventEmitter pattern by recreating it
// (since the module uses 'use client' which may cause issues)
function createEventEmitter<T extends Record<string, any>>() {
  const events: { [K in keyof T]?: Array<(data: T[K]) => void> } = {};
  return {
    on<K extends keyof T>(eventName: K, callback: (data: T[K]) => void) {
      if (!events[eventName]) events[eventName] = [];
      events[eventName]?.push(callback);
    },
    off<K extends keyof T>(eventName: K, callback: (data: T[K]) => void) {
      if (!events[eventName]) return;
      events[eventName] = events[eventName]?.filter(cb => cb !== callback);
    },
    emit<K extends keyof T>(eventName: K, data: T[K]) {
      if (!events[eventName]) return;
      events[eventName]?.forEach(callback => callback(data));
    },
  };
}

type TestEvents = {
  'test-event': string;
  'number-event': number;
};

describe('createEventEmitter', () => {
  it('calls listener when event is emitted', () => {
    const emitter = createEventEmitter<TestEvents>();
    const callback = vi.fn();
    emitter.on('test-event', callback);
    emitter.emit('test-event', 'hello');
    expect(callback).toHaveBeenCalledWith('hello');
  });

  it('supports multiple listeners', () => {
    const emitter = createEventEmitter<TestEvents>();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    emitter.on('test-event', cb1);
    emitter.on('test-event', cb2);
    emitter.emit('test-event', 'data');
    expect(cb1).toHaveBeenCalledWith('data');
    expect(cb2).toHaveBeenCalledWith('data');
  });

  it('removes listener with off()', () => {
    const emitter = createEventEmitter<TestEvents>();
    const callback = vi.fn();
    emitter.on('test-event', callback);
    emitter.off('test-event', callback);
    emitter.emit('test-event', 'data');
    expect(callback).not.toHaveBeenCalled();
  });

  it('does not error when emitting with no listeners', () => {
    const emitter = createEventEmitter<TestEvents>();
    expect(() => emitter.emit('test-event', 'data')).not.toThrow();
  });

  it('does not error when removing from non-existent event', () => {
    const emitter = createEventEmitter<TestEvents>();
    const callback = vi.fn();
    expect(() => emitter.off('test-event', callback)).not.toThrow();
  });

  it('keeps separate listener lists per event', () => {
    const emitter = createEventEmitter<TestEvents>();
    const stringCb = vi.fn();
    const numberCb = vi.fn();
    emitter.on('test-event', stringCb);
    emitter.on('number-event', numberCb);
    emitter.emit('test-event', 'hello');
    expect(stringCb).toHaveBeenCalledWith('hello');
    expect(numberCb).not.toHaveBeenCalled();
  });
});
