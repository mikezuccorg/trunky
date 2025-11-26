# Trunky - Threaded Chat Application
## Technical Specification

---

## 1. Project Overview

**Trunky** is a Next.js-based chat application that enables users to have conversations with Anthropic's LLM API with a unique threading capability. Users can branch conversations at any point, creating parallel discussion threads that remain linked to their parent conversation.

### Core Innovation
Unlike traditional linear chat interfaces, Trunky allows users to:
- Highlight any portion of a conversation
- Create a new thread branching from that point
- View multiple threads simultaneously in a split-pane interface
- Maintain context and links between parent and child threads

---

## 2. Technical Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (monochromatic theme)
- **State Management**: React Context API + Local Storage
- **UI Components**: Custom components with Radix UI primitives (unstyled, accessible)

### Backend
- **API Routes**: Next.js API routes
- **LLM Integration**: Anthropic Claude API (streaming support)
- **Storage**: Browser Local Storage (no database initially)

### Key Libraries
- `@anthropic-ai/sdk` - Official Anthropic SDK
- `tailwindcss` - Styling
- `@radix-ui/react-*` - Accessible UI primitives
- `lucide-react` - Icons
- `zustand` (optional) - Lightweight state management alternative

---

## 3. Architecture

### 3.1 Application Structure
```
trunky/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main chat interface
│   │   ├── layout.tsx               # Root layout
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts         # Chat API endpoint
│   │   └── globals.css
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx    # Main chat container
│   │   │   ├── MessageList.tsx      # Message display
│   │   │   ├── Message.tsx          # Individual message
│   │   │   ├── InputArea.tsx        # Message input
│   │   │   └── ThreadSelector.tsx   # Text selection UI
│   │   ├── threading/
│   │   │   ├── ThreadPane.tsx       # Individual thread pane
│   │   │   ├── ThreadManager.tsx    # Multi-pane manager
│   │   │   └── ThreadBreadcrumb.tsx # Thread navigation
│   │   ├── settings/
│   │   │   └── ApiKeyInput.tsx      # API key configuration
│   │   └── ui/
│   │       └── ...                  # Reusable UI components
│   ├── lib/
│   │   ├── anthropic.ts             # Anthropic API client
│   │   ├── storage.ts               # Local storage utilities
│   │   └── utils.ts                 # Helper functions
│   ├── types/
│   │   └── index.ts                 # TypeScript definitions
│   └── hooks/
│       ├── useChat.ts               # Chat logic hook
│       ├── useThreads.ts            # Threading logic hook
│       └── useTextSelection.ts      # Text selection hook
├── public/
└── package.json
```

### 3.2 Data Flow
```
User Input → ChatInterface → API Route → Anthropic API → Streaming Response → UI Update → Local Storage
                ↓
          Text Selection → Create Thread → New ThreadPane → Independent Chat Session
```

---

## 4. Data Models

### 4.1 Message
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  threadId: string;
}
```

### 4.2 Thread
```typescript
interface Thread {
  id: string;
  parentThreadId: string | null;
  parentMessageId: string | null;
  selectedText?: string;              // Text that spawned this thread
  messages: Message[];
  createdAt: number;
  title?: string;                     // Auto-generated or user-defined
}
```

### 4.3 Conversation State
```typescript
interface ConversationState {
  threads: Record<string, Thread>;    // All threads by ID
  activeThreadIds: string[];          // Currently visible thread IDs (left to right)
  mainThreadId: string;               // Root conversation thread
  apiKey: string | null;
}
```

---

## 5. Core Features

### 5.1 Basic Chat Interface
- Clean, minimal UI with monochromatic color scheme
- Message input area at bottom
- Scrollable message history
- Streaming response support
- User and assistant message differentiation

### 5.2 Threading Mechanism

#### Text Selection
- User can highlight any text in any message
- Selection triggers a "Create Thread" button/tooltip
- Selected text is captured and stored

#### Thread Creation
- New thread pane opens to the right
- Selected text appears as context (quoted/highlighted)
- New thread starts with:
  - Link to parent thread and message
  - Copy of selected text for context
  - Fresh conversation continuing from that context

#### Thread Management
- Active threads displayed in horizontally split panes
- Maximum 3-4 visible panes (configurable)
- Breadcrumb navigation showing thread hierarchy
- Ability to close threads
- Ability to swap/reorder threads

### 5.3 Split Pane UI
- Responsive grid layout
- Each pane is a full chat interface
- Equal width distribution
- Smooth transitions when adding/removing panes
- Mobile: Stack vertically or tab-based navigation

### 5.4 API Key Management
- Settings modal/panel for API key input
- Store API key securely in browser (localStorage with encryption consideration)
- Validate API key on first use
- Clear indication if API key is missing

### 5.5 Data Persistence
- All conversations stored in localStorage
- Auto-save on every message
- Export/import functionality (future enhancement)
- Clear all data option

---

## 6. UI/UX Design

### 6.1 Design Principles
- **Minimal**: Clean interface, no clutter
- **Monochromatic**: Shades of gray, black, and white
- **Focus**: Center attention on conversation content
- **Responsive**: Adapt to different screen sizes
- **Smooth**: Fluid animations and transitions

### 6.2 Color Palette
```css
Background: #FFFFFF, #FAFAFA
Surface: #F5F5F5, #E5E5E5
Text Primary: #1A1A1A
Text Secondary: #666666
Borders: #E0E0E0
Accent: #000000
User Message: #F0F0F0
Assistant Message: #FFFFFF
```

### 6.3 Typography
- Font: System fonts (SF Pro, Segoe UI, Inter fallback)
- Message text: 15-16px
- Clear hierarchy for headers and labels

### 6.4 Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Header: Logo / Settings]                                    │
├─────────────┬─────────────┬─────────────────────────────────┤
│   Thread 1  │  Thread 2   │        Thread 3                 │
│ (Main)      │ (Child 1)   │      (Child 2)                  │
│             │             │                                 │
│ Messages    │ Messages    │       Messages                  │
│   ...       │   ...       │         ...                     │
│             │             │                                 │
│ [Input]     │ [Input]     │       [Input]                   │
└─────────────┴─────────────┴─────────────────────────────────┘
```

---

## 7. API Integration

### 7.1 Anthropic API
- Use Messages API with streaming
- Model: `claude-3-5-sonnet-20241022` (or latest)
- Max tokens: Configurable (default 4096)
- Temperature: Configurable (default 1.0)

### 7.2 API Route (`/api/chat`)
```typescript
POST /api/chat
Body: {
  messages: Message[],
  apiKey: string,
  model?: string,
  maxTokens?: number
}
Response: Server-Sent Events (streaming)
```

### 7.3 Error Handling
- Invalid API key → User-friendly error message
- Rate limits → Display error and retry option
- Network errors → Retry mechanism
- Token limits → Warning and truncation

---

## 8. Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Initialize Next.js project with TypeScript and Tailwind
- [ ] Set up basic project structure and folders
- [ ] Create data models and TypeScript types
- [ ] Implement local storage utilities
- [ ] Create API key input and storage

### Phase 2: Basic Chat
- [ ] Build main chat interface component
- [ ] Implement message list and individual message components
- [ ] Create input area with send functionality
- [ ] Set up API route for Anthropic integration
- [ ] Implement streaming response handling
- [ ] Add basic error handling

### Phase 3: Threading Core
- [ ] Implement text selection detection
- [ ] Create thread creation logic
- [ ] Build thread data structure and management
- [ ] Implement thread context passing

### Phase 4: Multi-Pane UI
- [ ] Create split-pane layout system
- [ ] Implement thread pane component
- [ ] Add thread opening/closing functionality
- [ ] Build thread navigation and breadcrumbs
- [ ] Handle responsive behavior

### Phase 5: Polish & Enhancement
- [ ] Refine styling to match claude.ai aesthetic
- [ ] Add smooth animations and transitions
- [ ] Implement keyboard shortcuts
- [ ] Add export/import functionality
- [ ] Performance optimization
- [ ] Comprehensive testing

### Phase 6: Future Enhancements
- [ ] Thread search and filtering
- [ ] Conversation titles and organization
- [ ] Multiple AI model support
- [ ] Conversation sharing (via export)
- [ ] Dark mode
- [ ] User accounts and cloud sync (optional)

---

## 9. Technical Considerations

### 9.1 Performance
- Virtualized message lists for long conversations
- Debounced text selection
- Efficient re-rendering with React.memo
- Lazy loading of thread panes

### 9.2 Security
- API key stored locally (consider encryption)
- No API key sent to server logs
- API key transmitted securely to backend
- Input sanitization

### 9.3 Accessibility
- Keyboard navigation
- ARIA labels and roles
- Focus management
- Screen reader support

### 9.4 Browser Compatibility
- Target: Modern browsers (Chrome, Firefox, Safari, Edge)
- Fallbacks for older browsers
- Progressive enhancement approach

---

## 10. Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Airbnb style guide
- Use ESLint and Prettier
- Meaningful variable and function names

### Component Design
- Small, focused components
- Props-based composition
- Custom hooks for complex logic
- Avoid prop drilling (use Context where appropriate)

### Testing Strategy
- Unit tests for utilities and hooks
- Integration tests for key user flows
- Manual testing for UI/UX
- E2E tests for critical paths (future)

---

## 11. Success Metrics

### MVP Success Criteria
1. User can chat with Claude API
2. User can select text and create a thread
3. Multiple threads can be viewed simultaneously
4. All conversations persist across sessions
5. Clean, minimal UI matches design vision

### Performance Targets
- Initial page load: < 2s
- Time to first message: < 1s
- Smooth 60fps animations
- Handle conversations with 100+ messages

---

## 12. Open Questions

1. **Thread Limits**: Maximum number of threads per conversation?
2. **Thread Depth**: Should we limit nesting depth?
3. **Mobile UX**: Tab-based or vertical stacking for threads?
4. **Conversation Org**: How to handle many threads? Sidebar tree view?
5. **Model Selection**: Allow user to choose different Claude models?

---

## 13. Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@anthropic-ai/sdk": "^0.27.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "lucide-react": "latest",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## Conclusion

This technical specification provides a comprehensive blueprint for building Trunky, a threaded chat application with a unique conversation branching feature. The implementation is designed to be iterative, starting with a solid MVP and progressively adding advanced features.

The architecture prioritizes simplicity, maintainability, and user experience while leveraging modern web technologies and best practices.
