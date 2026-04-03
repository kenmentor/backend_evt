## Context

### Current State

**Email System:**
- Nodemailer transport configured in `src/utility/mail-trap/mailTrapConfig.js` using Gmail SMTP
- Email templates exist in `src/utility/mail-trap/emailTemplate.js`
- Email sending functions defined in `src/utility/mail-trap/emails.js` but the actual `sendEmail` function is completely commented out (lines 9-21)
- Email templates contain hardcoded URLs that don't use dynamic parameters properly (e.g., `forgetPasswordEmail` has hardcoded `https://AGENT WITH ME app.com/reset-password?token=123456`)

**Chat System:**
- No chat module exists in `src/modules/`
- No chat routes in `src/routes/v1/`
- No chat controller, service, or repository
- Frontend expects API endpoints per `CHAT_SYSTEM.md` design

### Architecture Pattern

The codebase uses clean architecture:
```
Route → Controller → Service → Repository → Module (Mongoose Schema)
```

### Constraints

- Use existing MongoDB connection via `src/utility/connectDb.js`
- Follow existing patterns for error handling (use `src/utility/response.js`)
- Maintain consistency with existing code style

## Goals / Non-Goals

**Goals:**
1. Enable email sending for verification, password reset, and welcome emails
2. Build complete chat API with all endpoints described in CHAT_SYSTEM.md
3. Ensure code follows existing architecture patterns

**Non-Goals:**
- Real-time WebSocket implementation (polling is acceptable per frontend spec)
- Push notifications
- Chat encryption
- Group messaging

## Decisions

### 1. Email: Uncomment Send Function

**Decision:** Uncomment the `sendEmail` function and fix template URLs

**Rationale:** The infrastructure already exists - it's just disabled. Uncommenting is the minimal change needed.

**Alternative:** Use a different email service (SendGrid, Mailgun) - Not needed since Gmail SMTP already configured

### 2. Chat Data Model: Two Collections vs Single

**Decision:** Use two collections - `conversations` and `messages`

**Rationale:** 
- Conversations are accessed frequently (list all for user)
- Messages can be large (history)
- Separating allows different indexing strategies
- Aligns with CHAT_SYSTEM.md design

**Alternative:** Single collection with sub-documents - Could work but less flexible for large message volumes

### 3. Chat API: Polling vs WebSocket

**Decision:** Implement polling-based API (endpoints only, no WebSocket)

**Rationale:** 
- Frontend already uses 5-second polling per CHAT_FRONTEND_COMPLETE.md
- Simpler to implement and maintain
- Works with existing Express setup

**Alternative:** WebSocket with Socket.io - Would require additional dependency and more complex setup

### 4. Service Pattern: Singleton vs Class

**Decision:** Use singleton functions (like existing services in `src/service/`)

**Rationale:** Existing codebase uses this pattern consistently. New chat service should match.

## Risks / Trade-offs

### Risk 1: Gmail App Password Not Configured
**Risk:** User may not have Gmail App Password set up
**Mitigation:** Document in README that `EMAIL` and `EMAIL_PASS` (App Password) must be set in `.env`

### Risk 2: Email Rate Limits
**Risk:** Gmail has sending limits (~500/day for regular accounts)
**Mitigation:** Consider switching to SendGrid for higher volume in production

### Risk 3: Chat Load Performance
**Risk:** Polling every 5s from multiple users could strain server
**Mitigation:** Add pagination to message retrieval, consider caching later

### Risk 4: Duplicate Conversation Creation
**Risk:** Race condition when two users message each other simultaneously
**Mitigation:** Use upsert with unique index on participant pair

## Migration Plan

### Phase 1: Fix Email (Quick Win)
1. Uncomment `sendEmail` function in `src/utility/mail-trap/emails.js`
2. Fix template URL placeholders
3. Add environment variable documentation

### Phase 2: Build Chat API
1. Create `src/modules/chat.js` (schemas)
2. Create `src/repositories/chat-repository.js`
3. Create `src/service/chat-service.js`
4. Create `src/controllers/chat-controller.js`
5. Create `src/routes/v1/chat-route.js`
6. Register route in `src/routes/v1/index.js`
7. Export module in `src/modules/index.js`

### Phase 3: Cleanup
1. Remove debug console.log statements from route files
2. Verify all endpoints work

## Open Questions

1. **Authentication:** Should chat endpoints require authentication middleware? (Currently no auth on many endpoints - following existing pattern)
2. **Message retention:** Should there be a message retention policy (auto-delete after X days)?
3. **Conversation title:** Should users be able to name conversations?