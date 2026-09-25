import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { runFlyai } from '../flyai/runner.js';
import { toFlags } from '../flyai/commands.js';

export function registerSearch(
  server: McpServer,
  toolName: string,
  description: string,
  command: string,
  schema: z.ZodObject<z.ZodRawShape>,
  flags: Record<string, string>,
): void {
  server.registerTool(toolName, {
    description,
    inputSchema: schema.shape,
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async (args) => {
    try {
      const result = await runFlyai(command, toFlags(args as Record<string, unknown>, flags));
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        structuredContent: result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'FlyAI search failed';
      return { isError: true, content: [{ type: 'text', text: message }] };
    }
  });
}
