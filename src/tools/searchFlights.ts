import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { routeFlags } from '../flyai/commands.js';
import { flightSchema } from '../schemas/flight.js';
import { registerSearch } from './registerSearch.js';

export function registerFlights(server: McpServer): void {
  registerSearch(server, 'search_flights', 'Search current FlyAI/Fliggy flight results. Prices and availability may change.',
    'search-flight', flightSchema, routeFlags);
}
