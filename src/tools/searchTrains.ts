import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { routeFlags } from '../flyai/commands.js';
import { trainSchema } from '../schemas/train.js';
import { registerSearch } from './registerSearch.js';

export function registerTrains(server: McpServer): void {
  registerSearch(server, 'search_trains', 'Search current FlyAI/Fliggy train results. Prices and availability may change.',
    'search-train', trainSchema, routeFlags);
}
