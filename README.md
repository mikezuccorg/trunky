# Trunky

A threaded conversation interface for Claude AI. Branch any conversation by selecting text to create new discussion paths that run side-by-side.

## Quick Start

Requires Node.js 18+ and an Anthropic API key from [console.anthropic.com](https://console.anthropic.com/).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Enter your API key when prompted. Your key stays local and only communicates with Anthropic's API.

## Usage

Type messages and press Enter to chat. Select any text in any message to spawn a new thread pane to the right. Each thread maintains independent conversation history. Close threads with the X button (except the main thread).

## Technical Stack

Built with Next.js 15, TypeScript, Tailwind CSS, and the Anthropic SDK. All conversations persist in browser localStorage with no backend database. API calls proxy through Next.js routes for security. Responses stream using Server-Sent Events.

## License

MIT
