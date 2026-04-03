## Why

The backend has two critical issues:
1. **Email sending is disabled** - The `sendEmail` function in `src/utility/mail-trap/emails.js` is completely commented out, so no verification or password reset emails are sent
2. **Chat API is missing** - The chat system described in `CHAT_SYSTEM.md` and `CHAT_FRONTEND_COMPLETE.md` has no backend implementation, so the frontend cannot communicate

## What Changes

1. **Fix email sending** - Uncomment and enable the `sendEmail` function, fix broken template URLs, ensure Gmail App Password is properly configured
2. **Build complete chat API** - Create module, repository, service, controller, and routes for User-to-Agent messaging
3. **Clean up code** - Remove debug console.log statements from routes files, ensure consistent file structure across all features

## Capabilities

### New Capabilities
- `email-notifications`: Enable transactional emails (verification, password reset, welcome)
- `chat-messaging`: Real-time messaging between users and agents for property inquiries
- `conversation-management`: Manage chat conversations with property context

### Modified Capabilities
- None - this is purely backend implementation work

## Impact

- **New files**: `src/modules/chat.js`, `src/repositories/chat-repository.js`, `src/service/chat-service.js`, `src/controllers/chat-controller.js`, `src/routes/v1/chat-route.js`
- **Modified files**: `src/utility/mail-trap/emails.js` (uncomment sendEmail), `src/routes/v1/index.js` (register chat route), `src/modules/index.js` (export chat module)
- **Environment**: Requires `EMAIL` and `EMAIL_PASS` in `.env` (Gmail App Password)
- **Frontend dependency**: Chat API endpoints needed by `/chat` pages and property detail chat buttons