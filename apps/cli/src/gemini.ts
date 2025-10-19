import { GoogleGenAI } from '@google/genai';

import { generateTextCompletion as sharedGenerateTextCompletion } from '../../../packages/shared/gemini.js';

export async function generateTextCompletion(
  currentText: string,
  mode: 'word' | 'sentence' | 'paragraph' = 'sentence',
  style: 'casual' | 'formal' | 'creative' | 'technical' = 'casual'
): Promise<string> {
  return sharedGenerateTextCompletion(
    currentText,
    mode,
    style,
    'gemini-2.0-flash-exp'
  );
}
