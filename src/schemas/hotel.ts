import { z } from 'zod';
import { date, name, price } from './common.js';

export const hotelSchema = z.object({
  destName: name.describe('Destination country, province, city, or district'),
  keyWords: name.optional(), poiName: name.optional(),
  hotelTypes: z.enum(['酒店', '民宿', '客栈']).optional(),
  sort: z.enum(['distance_asc', 'rate_desc', 'price_asc', 'price_desc', 'no_rank']).optional(),
  checkInDate: date.optional(), checkOutDate: date.optional(),
  hotelStars: z.string().regex(/^[1-5](,[1-5])*$/).optional(),
  hotelBedTypes: name.optional(), maxPrice: price.optional(),
});
