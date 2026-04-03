## 1. Install Socket.io

- [x] 1.1 Add socket.io to package.json dependencies
- [x] 1.2 Run npm install

## 2. Setup Socket.io Server

- [x] 2.1 Initialize Socket.io in src/index.js
- [x] 2.2 Configure CORS for Socket.io
- [x] 2.3 Create /chat namespace
- [x] 2.4 Create basic connection handler

## 3. Create Socket Handler Module

- [x] 3.1 Create src/socket/chatHandler.js
- [x] 3.2 Implement authentication middleware
- [x] 3.3 Implement connection event handler
- [x] 3.4 Implement disconnect event handler

## 4. Implement Chat Events

- [x] 4.1 Implement join_conversation event
- [x] 4.2 Implement leave_conversation event
- [x] 4.3 Implement send_message event (with MongoDB storage)
- [x] 4.4 Implement typing_start / typing_stop events
- [x] 4.5 Implement mark_read event

## 5. Implement Presence System

- [x] 5.1 Create presence tracking in-memory store
- [x] 5.2 Track user online/offline status
- [x] 5.3 Broadcast presence changes to relevant users

## 6. Update REST API

- [x] 6.1 Update send_message endpoint to also emit via Socket
- [x] 6.2 Update mark_read endpoint to emit via Socket

## 7. Cleanup

- [x] 7.1 Remove polling code references from codebase
- [x] 7.2 Add error handling for Socket events

## 8. Testing

- [ ] 8.1 Test WebSocket connection with authentication
- [ ] 8.2 Test send/receive message in real-time
- [ ] 8.3 Test typing indicators
- [ ] 8.4 Test read receipts
- [ ] 8.5 Test presence (online/offline)