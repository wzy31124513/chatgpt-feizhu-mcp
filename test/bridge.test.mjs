import assert from 'node:assert/strict';
import { mkdtemp, writeFile, chmod, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { startHttpServer } from '../dist/server/http.js';

test('MCP tools pass validated arguments as CLI argv and return structured JSON', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fliggy-mcp-'));
  const bin = join(dir, 'flyai');
  await writeFile(bin, '#!/usr/bin/env node\nconsole.log(JSON.stringify({status:0,data:{argv:process.argv.slice(2)}}));\n');
  await chmod(bin, 0o700);
  const originalBin = process.env.FLYAI_BIN;
  process.env.FLYAI_BIN = bin;
  const http = startHttpServer('127.0.0.1', 0);
  await new Promise(resolve => http.once('listening', resolve));
  const port = http.address().port;
  const client = new Client({ name: 'bridge-test', version: '1' });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`)));
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map(tool => tool.name), [
      'search_flights', 'search_hotels', 'search_trains', 'search_pois', 'search_travel',
      'ai_search', 'search_marriott_packages', 'search_marriott_hotels',
    ]);
    const result = await client.callTool({ name: 'search_flights', arguments: {
      origin: 'Shanghai; touch /tmp/should-not-run', destination: 'Hong Kong', depDate: '2026-09-27',
    } });
    assert.equal(result.isError, undefined);
    assert.deepEqual(result.structuredContent.data.argv, [
      'search-flight', '--origin', 'Shanghai; touch /tmp/should-not-run',
      '--destination', 'Hong Kong', '--dep-date', '2026-09-27',
    ]);
    assert.equal(JSON.parse(result.content[0].text).status, 0);
    const hotel = await client.callTool({ name: 'search_hotels', arguments: { destName: 'Shanghai' } });
    assert.deepEqual(hotel.structuredContent.data.argv, ['search-hotel', '--dest-name', 'Shanghai']);
    const ai = await client.callTool({ name: 'ai_search', arguments: { query: 'Shanghai family hotels' } });
    assert.deepEqual(ai.structuredContent.data.argv, ['ai-search', '--query', 'Shanghai family hotels']);
    const packages = await client.callTool({ name: 'search_marriott_packages', arguments: {
      keyword: 'weekend', hotelName: 'Marriott', provinceOrCity: 'Shanghai', sortType: 'price_asc',
    } });
    assert.deepEqual(packages.structuredContent.data.argv, [
      'search-marriott-package', '--keyword', 'weekend', '--hotel-name', 'Marriott',
      '--province-or-city', 'Shanghai', '--sort-type', 'price_asc',
    ]);
    const marriottHotels = await client.callTool({ name: 'search_marriott_hotels', arguments: {
      destName: 'Shanghai', checkInDate: '2026-09-27', checkOutDate: '2026-09-28',
    } });
    assert.deepEqual(marriottHotels.structuredContent.data.argv, [
      'search-marriott-hotel', '--dest-name', 'Shanghai', '--check-in-date', '2026-09-27',
      '--check-out-date', '2026-09-28',
    ]);
    const invalid = await client.callTool({ name: 'search_flights', arguments: { origin: 'Shanghai', depDate: 'tomorrow' } });
    assert.equal(invalid.isError, true);
  } finally {
    await client.close();
    await new Promise(resolve => http.close(resolve));
    if (originalBin === undefined) delete process.env.FLYAI_BIN;
    else process.env.FLYAI_BIN = originalBin;
    await rm(dir, { recursive: true, force: true });
  }
});
