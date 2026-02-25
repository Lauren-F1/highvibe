import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Ensure a single Genkit instance across module reloads in Next.js / dev servers.
declare global {
  // eslint-disable-next-line no-var
  var __genkit_ai: ReturnType<typeof genkit> | undefined;
}

export const ai =
  globalThis.__genkit_ai ??
  (globalThis.__genkit_ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.5-flash',
  }));
