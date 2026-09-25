import { z } from 'zod';
import { routeShape } from './common.js';

export const trainSchema = z.object(routeShape);
