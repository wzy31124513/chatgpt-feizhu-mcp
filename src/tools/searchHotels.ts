import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { hotelSchema } from '../schemas/hotel.js';
import { registerSearch } from './registerSearch.js';

const flags = {
  destName: 'dest-name', keyWords: 'key-words', poiName: 'poi-name', hotelTypes: 'hotel-types',
  sort: 'sort', checkInDate: 'check-in-date', checkOutDate: 'check-out-date',
  hotelStars: 'hotel-stars', hotelBedTypes: 'hotel-bed-types', maxPrice: 'max-price',
};

export function registerHotels(server: McpServer): void {
  registerSearch(server, 'search_hotels', 'Search current FlyAI/Fliggy hotel results. Prices and availability may change.',
    'search-hotel', hotelSchema, flags);
}
