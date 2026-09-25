import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { date, name, price } from '../schemas/common.js';
import { registerSearch } from './registerSearch.js';

const schema = z.object({
  destName: name,
  keyWords: name.optional(),
  poiName: name.optional(),
  hotelBedTypes: name.optional(),
  maxPrice: price.optional(),
  sort: z.enum(['distance_asc', 'rate_desc', 'price_asc', 'price_desc', 'no_rank']).optional(),
  checkInDate: date.optional(),
  checkOutDate: date.optional(),
});

export function registerMarriottHotelSearch(server: McpServer): void {
  registerSearch(server, 'search_marriott_hotels', 'Search Marriott Group hotels. Prices and availability may change.',
    'search-marriott-hotel', schema, {
      destName: 'dest-name', keyWords: 'key-words', poiName: 'poi-name',
      hotelBedTypes: 'hotel-bed-types', maxPrice: 'max-price', sort: 'sort',
      checkInDate: 'check-in-date', checkOutDate: 'check-out-date',
    });
}
