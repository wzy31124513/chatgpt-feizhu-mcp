import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { registerSearch } from './registerSearch.js';

const schema = z.object({
  query: z.string().trim().min(1).max(2000).describe('Complete natural-language search request'),
});

export function registerAiSearch(server: McpServer): void {
  registerSearch(server, 'ai_search', 'Search FlyAI/Fliggy travel products by semantic intent.',
    'ai-search', schema, { query: 'query' });
}
