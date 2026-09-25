import { startHttpServer } from './server/http.js';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 8787);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port');
}
startHttpServer(host, port);
process.stderr.write(`Fliggy MCP listening on http://${host}:${port}/mcp\n`);
