# Trunky 🌳

A threaded conversation interface for Claude AI that lets you branch conversations and explore multiple discussion paths simultaneously.

## Features

- **Threaded Conversations**: Select any text in a message to create a new conversation branch
- **Split-Pane Interface**: View multiple conversation threads side-by-side
- **Real-time Streaming**: See Claude's responses as they're generated
- **Local Storage**: All conversations are saved locally in your browser
- **Minimal Design**: Clean, monochromatic interface inspired by claude.ai

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trunky
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Time Setup

1. When you first open the app, you'll be prompted to enter your Anthropic API key
2. Your API key is stored locally in your browser and never sent to any server except Anthropic's API
3. Start chatting with Claude!

## How to Use

### Basic Chat

- Type your message in the input field at the bottom
- Press Enter to send (Shift+Enter for new line)
- Watch Claude's response stream in real-time

### Creating Threads

1. Select any text in any message (yours or Claude's)
2. Click the "Create Thread" button that appears
3. A new conversation pane opens to the right with the selected text as context
4. Continue the conversation in either thread independently

### Managing Threads

- **Close a thread**: Click the X button in the thread's header (main thread cannot be closed)
- **View multiple threads**: Up to 4 threads can be visible simultaneously
- Each thread maintains its own conversation history and context

## Technical Details

### Built With

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Anthropic SDK** - Claude AI integration
- **Zustand** - State management

### Architecture

- All conversations are stored in browser localStorage
- No backend database required
- API calls are proxied through Next.js API routes for security
- Streaming responses using Server-Sent Events

### Data Storage

All conversation data is stored locally in your browser:
- Conversations persist across sessions
- API key is stored separately
- You can clear all data from the browser's developer tools

## Development

### Project Structure

```
trunky/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── chat/        # Chat interface components
│   ├── threading/   # Thread management components
│   ├── settings/    # Settings components
│   └── ui/          # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── types/           # TypeScript type definitions
└── public/          # Static assets
```

### Building for Production

```bash
npm run build
npm start
```

## Roadmap

- [ ] Mobile-responsive threading (tabs/vertical stacking)
- [ ] Export/import conversations
- [ ] Dark mode
- [ ] Search within conversations
- [ ] Thread visualization/tree view
- [ ] Multiple AI model support
- [ ] Conversation sharing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Design inspired by [Claude.ai](https://claude.ai)
- Built with [Anthropic's Claude API](https://www.anthropic.com/api)
