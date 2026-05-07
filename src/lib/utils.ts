// src/lib/utils.ts
import { CardState, Confidence } from "./types";

export function calcCardState(confidence: Confidence | string): CardState {
  if (confidence === 'S') return 'cyan';
  if (confidence === 'A') return 'gold';
  if (confidence === 'B') return 'yellow';
  return 'neutral';
}