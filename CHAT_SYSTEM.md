# Chat System Implementation Guide

## Overview

A simple, reliable chat system for Agent with Me platform enabling **User-to-Agent** communication for property inquiries.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│   │ Chat List   │    │ Conversation │    │   Messages  │  │
│   │   Page      │───▶│    View      │───▶│    Store   │  │
│   │ /chat       │    │ /chat/[id]  │    │  (Zustand) │  │
│   └─────────────┘    └─────────────┘    └──────┬──────┘  │
│                                                    │         │
└────────────────────────────────────────────────────┼─────────┘
                                                 │ API Calls
                                                 │ (5s polling)
                                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Existing API)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  Chat Endpoints                     │   │
│   │  POST /v1/chat/send    - Send message             │   │
│   │  GET  /v1/chat/:userId - Get conversations        │   │
│   │  GET  /v1/chat/:u1/:u2 - Get messages between 2   │   │
│   │  PUT  /v1/chat/read    - Mark as read            │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  Database (MongoDB)                  │   │
│   │  - conversations collection                         │   │
│   │  - messages sub-collection                         │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Conversations Collection

```javascript
{
  _id: ObjectId,
  participants: [ObjectId, ObjectId],  // user IDs involved
  participantNames: {
    [userId1]: "John Doe",
    [userId2]: "Agent Smith"
  },
  participantAvatars: {
    [userId1]: "avatar_url_1",
    [userId2]: "avatar_url_2"
  },
  propertyContext: {
    propertyId: ObjectId,  // Optional: which property
    propertyTitle: "3 Bedroom Apartment"
  },
  lastMessage: {
    content: "Is this still available?",
    senderId: ObjectId,
    timestamp: ISODate
  },
  unreadCount: {
    [userId1]: 0,
    [userId2]: 2
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Messages Collection (or sub-document)

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  receiverId: ObjectId,
  content: "Yes, it's still available!",
  read: false,
  createdAt: ISODate
}
```

---

## API Endpoints

### 1. Send Message
```
POST /v1/chat/send

Body:
{
  "senderId": "user_123",
  "receiverId": "agent_456",
  "content": "Hi, is this property still available?",
  "propertyId": "house_789"  // optional
}

Response:
{
  "success": true,
  "data": {
    "id": "msg_001",
    "conversationId": "conv_123",
    "content": "Hi, is this property still available?",
    "senderId": "user_123",
    "receiverId": "agent_456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get Conversations for User
```
GET /v1/chat/:userId

Response:
{
  "success": true,
  "data": [
    {
      "_id": "conv_123",
      "participantId": "agent_456",
      "participantName": "Agent Smith",
      "participantAvatar": "/avatars/agent.jpg",
      "lastMessage": "Yes, it's still available!",
      "lastMessageTime": "2024-01-15T10:30:00Z",
      "unreadCount": 2,
      "propertyContext": {
        "propertyId": "house_789",
        "propertyTitle": "3 Bedroom Apartment"
      }
    }
  ]
}
```

### 3. Get Messages Between Users
```
GET /v1/chat/:userId1/:userId2

Query params:
- limit: 50 (default)
- before: timestamp (for pagination)

Response:
{
  "success": true,
  "data": {
    "participant": {
      "_id": "agent_456",
      "userName": "Agent Smith",
      "avatar": "/avatars/agent.jpg"
    },
    "messages": [
      {
        "_id": "msg_001",
        "senderId": "user_123",
        "content": "Hi, is this property still available?",
        "timestamp": "2024-01-15T10:30:00Z",
        "read": true
      },
      {
        "_id": "msg_002",
        "senderId": "agent_456",
        "content": "Yes, it's still available!",
        "timestamp": "2024-01-15T10:32:00Z",
        "read": false
      }
    ]
  }
}
```

### 4. Mark as Read
```
PUT /v1/chat/read

Body:
{
  "conversationId": "conv_123",
  "userId": "user_123"
}
```

---

## Frontend Implementation

### Zustand Store Structure

```typescript
interface ChatStore {
  // State
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Record<string, Message[]>;
  
  // Actions
  setConversations: (convs: Conversation[]) => void;
  addMessage: (convId: string, msg: Message) => void;
  markAsRead: (convId: string) => void;
  setActiveConversation: (id: string | null) => void;
}
```

### Component Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      CHAT LIST PAGE                         │
│                         /chat                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Header: "Messages"                                        │
│   ───────────────────────────────────────                   │
│   ┌─────────────────────────────────────────┐               │
│   │ 🔔 Agent Smith                          │               │
│   │    Is this still available?              │               │
│   │    2 min ago                    (2)    │               │
│   └─────────────────────────────────────────┘               │
│   ┌─────────────────────────────────────────┐               │
│   │ 🔔 Jane Doe                             │               │
│   │    Can I schedule a tour?               │               │
│   │    1 hour ago                          │               │
│   └─────────────────────────────────────────┘               │
│                                                             │
│   [Tap conversation → Navigate to /chat/:id]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  CONVERSATION PAGE                          │
│                   /chat/[userId]                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Header: [← Back] Agent Smith    [📞] [⋮]                 │
│   Context: Re: 3 Bedroom Apartment (tap to view)           │
│   ─────────────────────────────────────────────────────── │
│                                                             │
│                    ┌──────────────────┐                    │
│                    │ Hi! Is this      │                    │
│                    │ still available? │  10:30 AM          │
│                    └──────────────────┘                    │
│                                                             │
│           ┌────────────────────────────┐                     │
│           │ Yes, it's available!    │                     │
│           │ When would you like     │  10:32 AM          │
│           │ to view it?             │                     │
│           └────────────────────────────┘                   │
│                                                             │
│                    ┌──────────────────┐                    │
│                    │ Tomorrow at 2pm │                    │
│                    │ if possible     │  10:35 AM          │
│                    └──────────────────┘                    │
│                                                             │
│   ─────────────────────────────────────────────────────── │
│   │ 📎  │ Type a message...                        │ send │ │
│   └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Polling Strategy

```typescript
// Poll every 5 seconds for new messages
useEffect(() => {
  const interval = setInterval(async () => {
    if (!userId || !otherUserId) return;
    
    const res = await fetch(`${API}/chat/${userId}/${otherUserId}`);
    const data = await res.json();
    
    // Only update if new messages
    if (data.messages.length > currentMessages.length) {
      setMessages(data.messages);
    }
  }, 5000);
  
  return () => clearInterval(interval);
}, [userId, otherUserId]);
```

---

## Starting Conversation Flow

### From Property Detail Page

```
┌─────────────────────────────────────────────────────────────┐
│                   PROPERTY DETAIL PAGE                       │
│                   /properties/[id]                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [Property Image Gallery]                                  │
│                                                             │
│   3 Bedroom Apartment in Lekki                    [💬 Chat]   │
│   ₦5,000,000/year                                          │
│                                                             │
│   [Description] [Features] [Location]                        │
│                                                             │
│   Agent Info                                                │
│   ┌─────────────────────────────────────────┐               │
│   │ 👤 Agent Smith                         │               │
│   │    Licensed Agent                      │               │
│   │    📞 0801...    📧 agent@...        │               │
│   │                                        │               │
│   │    [💬 Chat with Agent]                │               │
│   └─────────────────────────────────────────┘               │
│                                                             │
│   [Tapping "Chat with Agent" creates/opens conversation]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### From Feed (PropertyFeed)

```typescript
// In PropertyFeed.tsx - Chat button
<button onClick={() => {
  // Navigate to chat with agent
  router.push(`/chat/${agentId}`);
}}>
  <MessageCircleIcon />
</button>
```

---

## Implementation Checklist

### Backend (If Building New)

- [ ] Create chat collection schema
- [ ] Implement `POST /v1/chat/send`
- [ ] Implement `GET /v1/chat/:userId`
- [ ] Implement `GET /v1/chat/:userId1/:userId2`
- [ ] Implement `PUT /v1/chat/read`
- [ ] Add conversation creation on first message
- [ ] Test all endpoints

### Frontend

- [ ] Update Zustand chat store
- [ ] Create `/app/chat/page.tsx` (conversation list)
- [ ] Create `/app/chat/[userId]/page.tsx` (conversation view)
- [ ] Update property detail page to add chat button
- [ ] Update PropertyFeed to add chat button
- [ ] Add polling for real-time feel
- [ ] Style components to match app theme

---

## Simple Fallback (No Backend Changes)

If backend chat isn't ready, use **localStorage-only** chat:

```typescript
// Simple mock - messages stored in browser only
const useLocalChat = create<ChatState>((set, get) => ({
  messages: {},
  sendMessage: (to, content) => {
    const id = `local-${Date.now()}`;
    set(state => ({
      messages: {
        ...state.messages,
        [to]: [...(state.messages[to] || []), {
          id,
          content,
          fromMe: true,
          timestamp: new Date()
        }]
      }
    }));
    // TODO: Replace with real API call
  }
}));
```

⚠️ **Warning**: This won't sync between devices or persist after browser close.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `store/chatStore.ts` | Update with proper types |
| `app/chat/page.tsx` | Rewrite chat list |
| `app/chat/[userId]/page.tsx` | Rewrite conversation view |
| `components/PropertyFeed.tsx` | Add chat button |
| `app/properties/[id]/client.tsx` | Add chat button |
| `types/chat.ts` | Create shared types |

---

## Next Steps

1. **Decide**: Use existing backend or build standalone?
2. **If existing backend**: Add chat endpoints to the render.com backend
3. **If standalone**: Create simple Express/Node server
4. **Frontend**: Build chat pages with 5-second polling

---

## Questions Before Implementation

1. Should I build on the existing backend (agent-with-me-backend.onrender.com)?
2. Or create a separate simple chat server?
3. Do you want real-time (WebSocket) or polling (simpler)?
