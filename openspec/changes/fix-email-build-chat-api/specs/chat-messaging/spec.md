## ADDED Requirements

### Requirement: Send Message
The system SHALL allow a user to send a message to another user (agent) and create a conversation if one doesn't exist.

#### Scenario: Send message creates new conversation
- **WHEN** user sends a message to another user they have no existing conversation with
- **THEN** system creates a new conversation with both participants and stores the message

#### Scenario: Send message to existing conversation
- **WHEN** user sends a message to another user they already have a conversation with
- **THEN** system adds the message to the existing conversation and updates last message

#### Scenario: Send message with property context
- **WHEN** user sends a message from a property detail page with propertyId
- **THEN** system associates the property context with the conversation

### Requirement: Get User Conversations
The system SHALL return all conversations for a specific user, sorted by most recent activity.

#### Scenario: Get conversations returns sorted list
- **WHEN** user requests their conversations
- **THEN** system returns all conversations containing that user, sorted by last message time (newest first)

#### Scenario: Get conversations returns participant details
- **WHEN** user requests their conversations
- **THEN** each conversation includes participant name, avatar, and unread count

#### Scenario: Get conversations with property context
- **WHEN** user requests their conversations
- **THEN** conversations that originated from a property include propertyId and propertyTitle

### Requirement: Get Messages Between Users
The system SHALL return all messages between two specific users.

#### Scenario: Get messages returns conversation history
- **WHEN** user requests messages with another user
- **THEN** system returns all messages in that conversation, oldest first

#### Scenario: Get messages with pagination
- **WHEN** user requests messages with limit parameter
- **THEN** system returns only the specified number of most recent messages

### Requirement: Mark Conversation as Read
The system SHALL allow marking a conversation as read for a specific user.

#### Scenario: Mark as read clears unread count
- **WHEN** user marks a conversation as read
- **THEN** system sets unread count to 0 for that user in the conversation

#### Scenario: Mark as read only affects requesting user
- **WHEN** user A marks conversation as read
- **THEN** user B's unread count remains unchanged