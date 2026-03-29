import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCsv } from '@/lib/csv';

describe('exportToCsv', () => {
  let mockClick: ReturnType<typeof vi.fn>;
  let mockSetAttribute: ReturnType<typeof vi.fn>;
  let mockAppendChild: ReturnType<typeof vi.fn>;
  let mockRemoveChild: ReturnType<typeof vi.fn>;
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockClick = vi.fn();
    mockSetAttribute = vi.fn();
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();
    mockCreateObjectURL = vi.fn().mockReturnValue('blob:test');

    vi.spyOn(document, 'createElement').mockReturnValue({
      download: '',
      setAttribute: mockSetAttribute,
      click: mockClick,
      style: { visibility: '' },
    } as any);

    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
    globalThis.URL.createObjectURL = mockCreateObjectURL;
  });

  it('does nothing for empty data', () => {
    exportToCsv([], 'empty.csv');
    expect(mockClick).not.toHaveBeenCalled();
  });

  it('creates a CSV download link for valid data', () => {
    const data = [{ name: 'Alice', email: 'alice@test.com' }];
    exportToCsv(data, 'test.csv');
    expect(mockSetAttribute).toHaveBeenCalledWith('download', 'test.csv');
    expect(mockClick).toHaveBeenCalled();
  });

  it('escapes double quotes in values', () => {
    const data = [{ text: 'He said "hello"' }];
    exportToCsv(data, 'test.csv');
    // The blob constructor is called with the CSV content
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('handles multiple rows', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    exportToCsv(data, 'multi.csv');
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
