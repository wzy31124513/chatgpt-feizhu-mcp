import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { name } from '../schemas/common.js';
import { registerSearch } from './registerSearch.js';

const schema = z.object({
  keyword: name,
  hotelName: name.optional(),
  provinceOrCity: name.optional(),
  sortType: z.enum(['price_asc', 'price_desc']).optional(),
});

export function registerMarriottPackageSearch(server: McpServer): void {
  registerSearch(server, 'search_marriott_packages', 'Search Marriott Group hotel package products.',
    'search-marriott-package', schema, {
      keyword: 'keyword', hotelName: 'hotel-name', provinceOrCity: 'province-or-city', sortType: 'sort-type',
    });
}
