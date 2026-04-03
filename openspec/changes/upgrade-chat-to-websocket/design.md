## Context

### Current State

- HTTP polling-based chat (5-second intervals)
- Endpoints: `/v1/chat/send`, `/v1/chat/:userId`, `/v1/chat/:userId1/:userId2`, `/v1/chat/read`
- MongoDB storage for conversations and messages

### Constraints

- Must integrate with existing Express server
- Should not break existing REST API endpoints
- Need to support authentication (JWT-based)
- Plan for horizontal scaling (Redis adapter)

## Goals / Non-Goals

**Goals:**
1. Real-time message delivery (< 100ms latency)
2. User presence (online/offline status)
3. Typing indicators
4. Read receipts
5. Room-based architecture for conversations

**Non-Goals:**
- Media/file sharing via WebSocket
- Push notifications
- Message encryption
- Group messaging (beyond 1-on-1)

## Decisions

### 1. Socket.io vs. Raw WebSocket

**Decision:** Use Socket.io

**Rationale:**
- Automatic reconnection
- Fallback to polling if WebSocket fails
- Room/namespacing support built-in
- Easier authentication handling
- Broadcast capabilities

**Alternative:** Raw WebSocket (ws library) - Would require more boilerplate

### 2. Namespace Structure

**Decision:** Use `/chat` namespace for all chat functionality

**Rationale:**
- Clean separation from other potential WebSocket uses
- Easier to secure/prefix
- Matches REST API structure

### 3. Authentication Strategy

**Decision:** JWT in Socket.io handshake query parameter

**Rationale:**
- Matches existing auth pattern
- Easy to validate on connection
- Can reject invalid connections before they connect

### 4. Room Strategy

**Decision:** One room per conversation ID

**Rationale:**
- Simple to implement
- Easy to broadcast to all participants
- Can add room metadata later if needed

### 5. Scalability

**Decision:** Design for Redis adapter, but start without it

**Rationale:**
- Single server is fine for MVP
- Redis adds complexity and cost
- Easy to migrate later with Socket.io's built-in adapter

## Risks / Trade-offs

### Risk 1: Connection Limits
**Risk:** Large number of concurrent connections could overwhelm server
**Mitigation:** Monitor connection count, consider Redis adapter when needed

### Risk 2: Authentication Complexity
**Risk:** Socket.io auth is different from REST auth
**Mitigation:** Create middleware for authentication, validate on every event

### Risk 3: Reconnection Race Conditions
**Risk:** User reconnects quickly, might receive duplicate messages
**Mitigation:** Use message IDs, deduplicate on client

### Risk 4: CORS for WebSocket
**Risk:** Socket.io needs specific CORS configuration
**Mitigation:** Update CORS settings in both Express and Socket.io

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Frontend)                      │
│                     Socket.io Client                        │
└─────────────────────────────────────────────────────────────┘
                              │
                    1. Connect to /chat
                    2. Authenticate with JWT
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Socket.io Server                       │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │    │
│  │  │ Connect │  │ Message │  │  Typing │  │  Read  │ │    │
│  │  │ Handler │  │ Handler │  │ Handler │  │Handler │ │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│                    ┌─────────┴─────────┐                     │
│                    ▼                   ▼                     │
│          ┌─────────────────┐  ┌───────────────┐            │
│          │  chat-service   │  │  Presence    │            │
│          │  (existing)     │  │  Manager     │            │
│          └─────────────────┘  └───────────────┘            │
│                    │                   │                     │
└────────────────────┼───────────────────┼─────────────────────┘
                     │                   │
                     ▼                   ▼
          ┌─────────────────┐  ┌───────────────┐
          │   MongoDB       │  │  In-Memory   │
          │                 │  │  (presence)  │
          └─────────────────┘  └───────────────┘
```

## Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_conversation` | `{ conversationId }` | Join a conversation room |
| `leave_conversation` | `{ conversationId }` | Leave a conversation room |
| `send_message` | `{ receiverId, content, conversationId? }` | Send a message |
| `typing_start` | `{ conversationId }` | User started typing |
| `typing_stop` | `{ conversationId }` | User stopped typing |
| `mark_read` | `{ conversationId, messageId? }` | Mark messages as read |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ message }` | Receive new message |
| `message_sent` | `{ message }` | Confirm message sent |
| `typing` | `{ userId, conversationId }` | User is typing |
| `user_online` | `{ userId }` | User came online |
| `user_offline` | `{ userId }` | User went offline |
| `messages_read` | `{ conversationId, userId }` | Messages marked as read |
| `error` | `{ message }` | Error occurred |

## Migration Plan

### Phase 1: Setup
1. Install socket.io
2. Initialize Socket.io in index.js
3. Create basic connection handler

### Phase 2: Core Features
1. Add authentication middleware
2. Implement message events
3. Add room management

### Phase 3: Enhanced Features
1. Add typing indicators
2. Add read receipts
3. Add presence tracking

### Phase 4: Cleanup
1. Update frontend to use WebSocket
2. Remove polling code
3. Test all flows

## Open Questions

1. **Max connections**: Should we limit concurrent Socket.io connections? If so, based on what?
2. **Message queue**: Should we queue messages if user is temporarily disconnected?
3. **Presence storage**: Store presence in MongoDB for persistence, or just in-memory for simplicity?