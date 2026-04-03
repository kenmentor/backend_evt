## 1. Fix Email System

- [x] 1.1 Uncomment sendEmail function in src/utility/mail-trap/emails.js (lines 9-21)
- [x] 1.2 Fix forgetPasswordEmail template URL (line 108) - replace hardcoded URL with dynamic resetURL
- [x] 1.3 Fix verificationEmail template (line 161) - ensure verification code is passed correctly
- [x] 1.4 Document EMAIL and EMAIL_PASS environment variables in .env setup

## 2. Create Chat Module (Schema)

- [x] 2.1 Create src/modules/chat.js with conversation schema
- [x] 2.2 Create src/modules/chat.js with message schema
- [x] 2.3 Add indexes for efficient querying (participants, createdAt)
- [x] 2.4 Export chat module in src/modules/index.js

## 3. Create Chat Repository

- [x] 3.1 Create src/repositories/chat-repository.js
- [x] 3.2 Implement findOrCreateConversation method
- [x] 3.3 Implement addMessageToConversation method
- [x] 3.4 Implement getUserConversations method
- [x] 3.5 Implement getConversationMessages method
- [x] 3.6 Implement markAsRead method

## 4. Create Chat Service

- [x] 4.1 Create src/service/chat-service.js
- [x] 4.2 Implement sendMessage function (creates conversation if needed)
- [x] 4.3 Implement getConversations function
- [x] 4.4 Implement getMessages function
- [x] 4.5 Implement markAsRead function

## 5. Create Chat Controller

- [x] 5.1 Create src/controllers/chat-controller.js
- [x] 5.2 Implement send_message controller (POST /v1/chat/send)
- [x] 5.3 Implement get_conversations controller (GET /v1/chat/:userId)
- [x] 5.4 Implement get_messages controller (GET /v1/chat/:userId1/:userId2)
- [x] 5.5 Implement mark_read controller (PUT /v1/chat/read)

## 6. Create Chat Route

- [x] 6.1 Create src/routes/v1/chat-route.js
- [x] 6.2 Define POST /send route
- [x] 6.3 Define GET /:userId route
- [x] 6.4 Define GET /:userId1/:userId2 route
- [x] 6.5 Define PUT /read route

## 7. Register Chat Route

- [x] 7.1 Add chat route to src/routes/v1/index.js
- [x] 7.2 Verify route is accessible at /v1/chat/*

## 8. Code Cleanup

- [x] 8.1 Remove debug console.log statements from src/routes/v1/index.js
- [x] 8.2 Review and fix any inconsistent error handling patterns
- [x] 8.3 Verify all exports are correct across modules, services, controllers

## 9. Testing

- [ ] 9.1 Test email sending manually (verification email)
- [ ] 9.2 Test POST /v1/chat/send endpoint
- [ ] 9.3 Test GET /v1/chat/:userId endpoint
- [ ] 9.4 Test GET /v1/chat/:userId1/:userId2 endpoint
- [ ] 9.5 Test PUT /v1/chat/read endpoint