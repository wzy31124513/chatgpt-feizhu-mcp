import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { registerSearch } from './registerSearch.js';

const schema = z.object({ query: z.string().trim().min(1).max(500).describe('Travel search in natural language') });

export function registerTravel(server: McpServer): void {
  registerSearch(server, 'search_travel', 'Search FlyAI/Fliggy travel products by keyword, including tickets and tours.',
    'keyword-search', schema, { query: 'query' });
}
