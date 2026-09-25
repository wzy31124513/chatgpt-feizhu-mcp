import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { poiSchema } from '../schemas/poi.js';
import { registerSearch } from './registerSearch.js';

const flags = { cityName: 'city-name', keyword: 'keyword', poiLevel: 'poi-level', category: 'category' };

export function registerPois(server: McpServer): void {
  registerSearch(server, 'search_pois', 'Search current FlyAI/Fliggy attractions and points of interest.',
    'search-poi', poiSchema, flags);
}
