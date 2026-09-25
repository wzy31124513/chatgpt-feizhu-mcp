import { z } from 'zod';
import { routeShape } from './common.js';

export const flightSchema = z.object(routeShape);
