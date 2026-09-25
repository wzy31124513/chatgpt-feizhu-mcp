# ChatGPT Feizhu MCP

[简体中文](README.zh-CN.md) · English

An open-source MCP bridge that lets a **ChatGPT web custom app** search Feizhu travel data through the official [FlyAI CLI](https://www.npmjs.com/package/@fly-ai/flyai-cli). ChatGPT connects to this server's `/mcp` endpoint; the server runs `flyai` locally and returns its JSON result. Codex is useful for development but is not needed at runtime.

This is an independent community project, not an official Feizhu, Alibaba, or OpenAI product. It does not implement FlyAI authentication or call undocumented Feizhu APIs.

## What it provides

Five read-only MCP tools: `search_flights`, `search_hotels`, `search_trains`, `search_pois`, and `search_travel`. Results retain the FlyAI CLI's structured data, including links, images, and `systemMessage` when present.

Requirements: Node.js 20+, the `@fly-ai/flyai-cli` executable, and a FlyAI API Key configured for the OS user running this server to receive full results. Connecting from ChatGPT web also requires a ChatGPT account or workspace that supports custom MCP apps and either a public HTTPS endpoint or a private Secure MCP Tunnel.

## Install and run locally

```bash
git clone https://github.com/wzy31124513/chatgpt-feizhu-mcp.git
cd chatgpt-feizhu-mcp
npm ci
npm install -g @fly-ai/flyai-cli
flyai --help
```

Configure the FlyAI API Key **outside this repository**, under the same OS account that will run the bridge:

```bash
umask 077
flyai config set FLYAI_API_KEY 'YOUR_FLYAI_KEY'
chmod 600 ~/.flyai/config.json
flyai keyword-search --query 'things to do in Tokyo'
```

Never commit the real key or put it in an MCP request. The CLI may return trial-mode results without a key; check the CLI's `systemMessage` to confirm your own account is using full results.

```bash
npm run typecheck
npm test
npm start
```

The server listens on `127.0.0.1:8787` by default. Check `http://127.0.0.1:8787/health`; MCP is at `http://127.0.0.1:8787/mcp`. Configure `HOST`, `PORT`, `FLYAI_BIN`, and `FLYAI_TIMEOUT_MS` through the environment if needed. `FLYAI_BIN` defaults to `flyai` on `PATH`; the timeout defaults to 30 seconds and may be set up to five minutes. The server limits CLI output to 8 MiB and returns generic errors to clients.

For a local MCP client, connect to `/mcp` with [MCP Inspector](https://github.com/modelcontextprotocol/inspector) or another Streamable HTTP MCP client. `npm test` checks tool registration, CLI argument mapping, JSON responses, and input validation using a fake CLI. It does not make a live FlyAI request.

## Connect ChatGPT web

Choose one connection method:

1. **Private:** Use [OpenAI Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) to connect ChatGPT to `http://127.0.0.1:8787/mcp` without opening an inbound port. Create a tunnel in your OpenAI Platform organization, install `tunnel-client`, and configure a local client profile using the [official onboarding guide](https://github.com/openai/tunnel-client/blob/master/docs/onboarding.md). Keep its OpenAI runtime key in a local, permission-restricted file such as the ignored `.env.local`, never in this repository. The FlyAI and OpenAI keys serve different purposes.
2. **Public HTTPS:** Point a domain with a valid TLS certificate to this server through a reverse proxy. [The Nginx example](deploy/nginx.conf.example) forwards `/mcp` to loopback and applies basic rate limiting. Do not expose port 8787 directly. This bridge does not authenticate incoming MCP users; put an access-controlled gateway or an MCP-compatible OAuth provider in front of it before sharing the endpoint. Otherwise, anyone with access can spend your FlyAI quota.

In ChatGPT web, if your plan or workspace provides custom MCP apps, create one in developer mode and connect it to the HTTPS `/mcp` URL or your tunnel, then scan the five tools. Follow [OpenAI's custom MCP app instructions](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt) for the current interface. A GitHub repository alone does not install the app in ChatGPT or host the server.

## Optional user services (Linux)

The included `fliggy-mcp.service` and `fliggy-tunnel.service` are **examples** for a checkout at `~/chatgpt-feizhu-mcp`. Edit their working directory, executable paths, and environment settings for your machine before installing them. In particular, make sure the systemd user's `flyai` and `tunnel-client` executables are on its `PATH`, and configure the FlyAI key for that same user. The tunnel unit expects your local `.env.local` and a `fliggy-local` profile; create those using the official tunnel-client guide.

```bash
install -m 644 fliggy-mcp.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now fliggy-mcp.service
systemctl --user status fliggy-mcp.service
```

Install and enable the tunnel unit only after its profile and key are configured. Keeping user services running after logout requires systemd user lingering on many Linux systems.

## License

[MIT](LICENSE). Package metadata sets `private: true` to prevent accidental npm publication; it does not restrict use of this GitHub repository under the MIT license.
