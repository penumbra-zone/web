import { z } from 'zod';
import { SpendViewSchema } from './spend';
import { OutputViewSchema } from './output';

export const ActionViewSchema = z.union([SpendViewSchema, OutputViewSchema]);
