## ADDED Requirements

### Requirement: Connect to Chat WebSocket
The system SHALL allow authenticated users to connect to the Socket.io chat namespace.

#### Scenario: Successful WebSocket connection
- **WHEN** user connects to `/chat` namespace with valid JWT token
- **THEN** system accepts connection and identifies user by userId from token

#### Scenario: WebSocket connection with invalid token
- **WHEN** user connects to `/chat` namespace with invalid or missing JWT
- **THEN** system rejects connection and disconnects user

### Requirement: Join Conversation Room
The system SHALL allow users to join a conversation room for real-time updates.

#### Scenario: User joins conversation room
- **WHEN** user sends `join_conversation` event with conversationId
- **THEN** system adds user to the Socket.io room for that conversation

#### Scenario: User leaves conversation room
- **WHEN** user sends `leave_conversation` event with conversationId
- **THEN** system removes user from the Socket.io room

### Requirement: Send Real-Time Message
The system SHALL deliver messages instantly to the recipient via WebSocket.

#### Scenario: Send message to online user
- **WHEN** user sends `send_message` event with receiverId and content
- **THEN** system delivers message to recipient via WebSocket and stores in MongoDB

#### Scenario: Send message to offline user
- **WHEN** user sends `send_message` event but recipient is offline
- **THEN** system stores message in MongoDB; recipient receives it when they next connect

### Requirement: Receive Real-Time Message
The system SHALL notify users instantly when they receive a new message.

#### Scenario: Receive new message
- **WHEN** a new message is sent to user's conversation
- **THEN** system emits `new_message` event to recipient's socket

### Requirement: Typing Indicator
The system SHALL show when another user is typing in a conversation.

#### Scenario: User starts typing
- **WHEN** user sends `typing_start` event with conversationId
- **THEN** system emits `typing` event to other participants in that conversation

#### Scenario: User stops typing
- **WHEN** user sends `typing_stop` event with conversationId
- **THEN** system stops typing indicator for other participants

### Requirement: Read Receipts
The system SHALL notify message senders when their messages are read.

#### Scenario: Mark messages as read
- **WHEN** user sends `mark_read` event with conversationId
- **THEN** system marks all unread messages as read and notifies the sender

#### Scenario: Receive read receipt
- **WHEN** recipient marks messages as read
- **THEN** system emits `messages_read` event to original sender

### Requirement: User Presence
The system SHALL track and broadcast user online/offline status.

#### Scenario: User comes online
- **WHEN** user establishes WebSocket connection
- **THEN** system emits `user_online` event to other users who have active conversations with this user

#### Scenario: User goes offline
- **WHEN** user disconnects from WebSocket
- **THEN** system emits `user_offline` event to relevant users

### Requirement: Message Persistence
The system SHALL store all messages in MongoDB for persistence.

#### Scenario: Message stored on send
- **WHEN** message is sent via WebSocket
- **THEN** system stores message in MongoDB with conversationId, senderId, receiverId, content, timestamp