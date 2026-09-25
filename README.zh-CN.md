# ChatGPT 飞猪 MCP

简体中文 · [English](README.md)

这是一个开源 MCP 桥接服务，让 **ChatGPT 网页版的自定义应用** 通过官方 [FlyAI CLI](https://www.npmjs.com/package/@fly-ai/flyai-cli) 查询飞猪旅行数据。ChatGPT 连接本服务的 `/mcp` 端点；服务在本机运行 `flyai`，再把 JSON 结果返回给 ChatGPT。Codex 可用于开发，但运行时不依赖 Codex。

本项目是独立的社区项目，并非飞猪、阿里巴巴或 OpenAI 的官方产品。项目不实现 FlyAI 身份验证，也不调用未公开的飞猪接口。

## 功能与要求

提供五个只读 MCP 工具：`search_flights`（机票）、`search_hotels`（酒店）、`search_trains`（火车票）、`search_pois`（景点与目的地）和 `search_travel`（旅行关键词搜索）。结果保留 FlyAI CLI 的结构化数据，以及其中的链接、图片和 `systemMessage`。

需要 Node.js 20+、`@fly-ai/flyai-cli` 可执行程序，以及为**运行本服务的同一个系统用户**配置的 FlyAI API Key，才能获取完整结果。若要连接 ChatGPT 网页版，还需要支持自定义 MCP 应用的 ChatGPT 账号或工作区，以及公网 HTTPS 端点或私有 Secure MCP Tunnel。

## 本地安装与运行

```bash
git clone https://github.com/wzy31124513/chatgpt-feizhu-mcp.git
cd chatgpt-feizhu-mcp
npm ci
npm install -g @fly-ai/flyai-cli
flyai --help
```

在**仓库外**为运行桥接服务的系统用户配置 FlyAI API Key：

```bash
umask 077
flyai config set FLYAI_API_KEY 'YOUR_FLYAI_KEY'
chmod 600 ~/.flyai/config.json
flyai keyword-search --query 'things to do in Tokyo'
```

不要提交真实密钥，也不要把密钥放进 MCP 请求。未配置密钥时，CLI 可能返回体验模式结果；可检查其 `systemMessage`，确认自己的账号是否获取完整结果。

```bash
npm run typecheck
npm test
npm start
```

服务默认监听 `127.0.0.1:8787`。健康检查地址为 `http://127.0.0.1:8787/health`；MCP 地址为 `http://127.0.0.1:8787/mcp`。可以通过环境变量设置 `HOST`、`PORT`、`FLYAI_BIN` 和 `FLYAI_TIMEOUT_MS`。`FLYAI_BIN` 默认是在 `PATH` 中查找 `flyai`；超时默认 30 秒，最长可设为五分钟。CLI 输出上限为 8 MiB，向客户端返回的错误信息不会包含原始密钥或 CLI 错误输出。

本地可使用 [MCP Inspector](https://github.com/modelcontextprotocol/inspector) 或其他 Streamable HTTP MCP 客户端连接 `/mcp`。`npm test` 使用模拟 CLI 检查工具注册、命令行参数映射、JSON 结果与输入校验；不会发起真实的 FlyAI 请求。

## 连接 ChatGPT 网页版

选择一种连接方式：

1. **私有连接：** 使用 [OpenAI Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels)，让 ChatGPT 访问 `http://127.0.0.1:8787/mcp`，无需开放入站端口。在 OpenAI Platform 组织中创建隧道，安装 `tunnel-client`，并按[官方接入指南](https://github.com/openai/tunnel-client/blob/master/docs/onboarding.md)配置本地 profile。OpenAI 运行密钥应保存在本地且限制读取权限，例如被忽略的 `.env.local`，不要提交到仓库。FlyAI 密钥与 OpenAI 密钥用途不同。
2. **公网 HTTPS：** 为域名配置有效 TLS 证书，通过反向代理把 `/mcp` 转发到本地服务。[Nginx 示例](deploy/nginx.conf.example)包含基本限流。不要直接开放 8787 端口。本桥接服务不验证 MCP 调用者身份；向他人开放前，需要在前面加访问控制网关或兼容 MCP 的 OAuth 服务，否则能够访问端点的人就能消耗你的 FlyAI 配额。

如果你的 ChatGPT 账号或工作区支持自定义 MCP 应用，可在 ChatGPT 网页版的开发者模式中创建应用，填入 HTTPS `/mcp` 地址或选择隧道，再扫描五个工具。界面入口以 [OpenAI 的自定义 MCP 应用说明](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt)为准。公开 GitHub 仓库本身不会把应用安装到 ChatGPT，也不会替你托管服务。

## 可选：Linux 用户服务

仓库中的 `fliggy-mcp.service` 和 `fliggy-tunnel.service` 是以 `~/chatgpt-feizhu-mcp` 为目录的**示例配置**。安装前请按自己的机器修改工作目录、可执行程序路径和环境设置。特别要确认 systemd 用户的 `PATH` 中能找到 `flyai` 和 `tunnel-client`，并为该用户配置 FlyAI 密钥。隧道单元需要本地 `.env.local` 和 `fliggy-local` profile；请按 tunnel-client 官方指南创建。

```bash
install -m 644 fliggy-mcp.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now fliggy-mcp.service
systemctl --user status fliggy-mcp.service
```

隧道 profile 和密钥配置完成后，再安装并启用隧道单元。很多 Linux 系统需要开启 systemd 用户 lingering，用户退出登录后服务才能继续运行。

## 许可证

采用 [MIT 许可证](LICENSE)。`package.json` 中的 `private: true` 只是防止误发 npm 包，不影响此 GitHub 仓库按 MIT 许可使用。
