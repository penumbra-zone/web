import { UserChoice } from '@penumbra-zone/types/user-choice';

export interface OriginRecord {
  origin: string;
  choice: string & UserChoice;
  date: number;
}

export const isOriginRecord = (rec: unknown): rec is OriginRecord =>
  rec != null &&
  typeof rec === 'object' &&
  'choice' in rec &&
  typeof rec.choice === 'string' &&
  rec.choice in UserChoice &&
  'date' in rec &&
  typeof rec.date === 'number' &&
  'origin' in rec &&
  typeof rec.origin === 'string' &&
  new URL(rec.origin).origin === rec.origin;
