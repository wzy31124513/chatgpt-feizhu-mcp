import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFlights } from '../tools/searchFlights.js';
import { registerHotels } from '../tools/searchHotels.js';
import { registerTrains } from '../tools/searchTrains.js';
import { registerPois } from '../tools/searchPois.js';
import { registerTravel } from '../tools/searchTravel.js';

export function createServer(): McpServer {
  const server = new McpServer({ name: 'fliggy-mcp-bridge', version: '0.2.0' });
  registerFlights(server);
  registerHotels(server);
  registerTrains(server);
  registerPois(server);
  registerTravel(server);
  return server;
}
