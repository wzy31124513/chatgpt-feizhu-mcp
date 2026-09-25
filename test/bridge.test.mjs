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
