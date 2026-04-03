## Why

The current chat implementation uses HTTP polling (5-second intervals) which is inefficient, creates unnecessary server load, and provides poor user experience with message delays. For a production-grade chat system supporting many users, real-time bidirectional communication is essential.

## What Changes

1. **Upgrade to Socket.io** - Replace polling with WebSocket for instant message delivery
2. **Add Socket.io server** - Initialize Socket.io with the Express server
3. **Create Socket handler** - Build event-based communication (connection, disconnect, message, read receipt)
4. **Room-based messaging** - Use Socket.io rooms for conversation-based communication
5. **User presence** - Track online/offline status of users
6. **Scalability prep** - Design for future Redis adapter for multiple server instances

## Capabilities

### New Capabilities
- `real-time-messaging`: Instant message delivery via WebSocket
- `user-presence`: Track online/offline status in real-time
- `typing-indicators`: Show when user is typing
- `read-receipts`: Real-time read status updates

### Modified Capabilities
- `chat-messaging`: Updated from polling to WebSocket

## Impact

- **New dependencies**: socket.io, socket.io-client (frontend)
- **Modified files**: `src/index.js` (add Socket.io), new `src/socket/` directory
- **Frontend changes**: Update chat components to use Socket.io instead of polling
- **CORS**: Update CORS config to allow Socket.io connections