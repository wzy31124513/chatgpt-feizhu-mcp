import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFlights } from '../tools/searchFlights.js';
import { registerHotels } from '../tools/searchHotels.js';
import { registerTrains } from '../tools/searchTrains.js';
import { registerPois } from '../tools/searchPois.js';
import { registerTravel } from '../tools/searchTravel.js';
import { registerAiSearch } from '../tools/searchAi.js';
import { registerMarriottPackageSearch } from '../tools/searchMarriottPackage.js';
import { registerMarriottHotelSearch } from '../tools/searchMarriottHotel.js';

export function createServer(): McpServer {
  const server = new McpServer({ name: 'fliggy-mcp-bridge', version: '0.3.0' });
  registerFlights(server);
  registerHotels(server);
  registerTrains(server);
  registerPois(server);
  registerTravel(server);
  registerAiSearch(server);
  registerMarriottPackageSearch(server);
  registerMarriottHotelSearch(server);
  return server;
}
