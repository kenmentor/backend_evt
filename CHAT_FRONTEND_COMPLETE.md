# Chat System Frontend - Complete Implementation Guide

## Overview

This document describes the complete frontend implementation for the Agent with Me chat system.

---

## File Structure

```
app/
├── chat/
│   ├── page.tsx                 # Chat list - all conversations
│   └── [userId]/
│       └── page.tsx            # Individual conversation view
├── properties/
│   └── [id]/
│       └── client.tsx           # Property detail with chat button
└── components/
    ├── PropertyFeed.tsx        # TikTok-style feed with chat
    └── ui/
        └── button.tsx          # Already exists

store/
└── chatStore.ts                # Zustand store for chat state

lib/
└── api.ts                      # API utilities (already exists)
```

---

## 1. Zustand Store (`store/chatStore.ts`)

### Purpose
Central state management for all chat data with localStorage persistence.

### Interface

```typescript
interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date | string;
  read: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date | string;
  unreadCount: number;
  propertyContext?: {
    propertyId: string;
    propertyTitle: string;
  };
}

interface ChatState {
  // State
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversation: string | null;
  isLoading: boolean;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  setActiveConversation: (id: string | null) => void;
  markAsRead: (conversationId: string) => void;
  setLoading: (loading: boolean) => void;
  getTotalUnread: () => number;
}
```

### Implementation

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversation: null,
      isLoading: false,

      setConversations: (conversations) => set({ conversations }),

      setMessages: (conversationId, messages) => set((state) => ({
        messages: { ...state.messages, [conversationId]: messages },
      })),

      addMessage: (conversationId, message) => set((state) => {
        const existing = state.messages[conversationId] || [];
        const exists = existing.some(m => m.id === message.id);
        if (exists) return state;

        return {
          messages: {
            ...state.messages,
            [conversationId]: [...existing, message],
          },
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  lastMessage: message.content,
                  lastMessageTime: message.timestamp,
                  unreadCount: message.senderId !== conv.participantId
                    ? conv.unreadCount + 1
                    : conv.unreadCount,
                }
              : conv
          ).sort((a, b) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
          }),
        };
      }),

      setActiveConversation: (id) => set({ activeConversation: id }),

      markAsRead: (conversationId) => set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ),
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      getTotalUnread: () => {
        return get().conversations.reduce((total, conv) => total + conv.unreadCount, 0);
      },
    }),
    {
      name: "agent-with-me-chat",
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
      }),
    }
  )
);
```

---

## 2. Chat List Page (`app/chat/page.tsx`)

### Purpose
Display all conversations for the logged-in user with search functionality.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back              Messages                    [Search]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Avatar]  Agent Smith                           │   │
│  │           Re: 3 Bedroom Apartment                 │   │
│  │           Is this still available?     2m ago (2)│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Avatar]  Jane Doe                             │   │
│  │           Can I schedule a tour?    1h ago     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Avatar]  Mike Johnson                           │   │
│  │           Thanks for the info!         3h ago     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axois";

export default function ChatListPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    if (!user?._id) return;

    try {
      const res = await app.get(`${base}/v1/chat/${user._id}`);
      const data = res.data?.data || [];
      
      // Transform API response to match our interface
      const formatted = data.map((conv: any) => ({
        _id: conv._id || conv.conversationId,
        participantId: conv.participantId,
        participantName: conv.participantName || "User",
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.unreadCount || 0,
        propertyContext: conv.propertyContext,
      }));
      
      setConversations(formatted);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }
    fetchConversations();
  }, [_hasHydrated, isAuthenticated, user, router, fetchConversations]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Filter by search query
  const filtered = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format relative time
  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header color="black" />
      
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </h3>
              <Link href="/properties">
                <Button>Browse Properties</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Conversations List */
          <div className="space-y-2">
            {filtered.map((conv) => (
              <Link key={conv._id} href={`/chat/${conv.participantId}`}>
                <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-black text-white">
                          {conv.participantName?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">
                            {conv.participantName}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>

                        {conv.propertyContext && (
                          <p className="text-xs text-gray-500 truncate mb-1">
                            Re: {conv.propertyContext.propertyTitle}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage || "Start chatting"}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-black rounded-full">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 3. Conversation View (`app/chat/[userId]/page.tsx`)

### Purpose
Display messages with a specific user and allow sending new messages.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back        Agent Smith              [Property Card]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌────────────────────────┐              │
│                    │ Hi! Is this still     │              │
│                    │ available?             │  10:30 AM    │
│                    └────────────────────────┘              │
│                                                             │
│         ┌──────────────────────────────────────┐           │
│         │ Yes, it's available! When would    │           │
│         │ you like to view it?               │  10:32 AM  │
│         └──────────────────────────────────────┘           │
│                                                             │
│                    ┌────────────────────────┐              │
│                    │ Tomorrow at 2pm if    │              │
│                    │ possible              │  10:35 AM    │
│                    └────────────────────────┘              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📎  │ Type a message...                        │ Send   │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

```tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, Loader2, MapPin } from "lucide-react";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import Req from "@/app/utility/axois";
import { toast } from "sonner";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { setActiveConversation, markAsRead } = useChatStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [participant, setParticipant] = useState({
    _id: userId,
    userName: "Agent",
    avatar: "",
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!user?._id || !userId) return;

    try {
      setLoading(true);
      const res = await app.get(`${base}/v1/chat/${user._id}/${userId}`);
      const data = res.data?.data;
      
      if (data) {
        setMessages(data.messages || []);
        if (data.participant) {
          setParticipant(data.participant);
        }
        markAsRead(userId);
        setActiveConversation(userId);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [user?._id, userId, markAsRead, setActiveConversation]);

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }
    fetchMessages();
  }, [_hasHydrated, isAuthenticated, user, router, fetchMessages]);

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user?._id || !userId) return;
      
      try {
        const res = await app.get(`${base}/v1/chat/${user._id}/${userId}`);
        const newMessages = res.data?.data?.messages || [];
        
        if (newMessages.length > messages.length) {
          setMessages(newMessages);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user?._id, userId, messages.length]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !user?._id || !userId) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      senderId: user._id,
      receiverId: userId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    try {
      setSending(true);
      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");

      const res = await app.post(`${base}/v1/chat/send`, {
        senderId: user._id,
        receiverId: userId,
        content: newMessage,
      });

      if (res.data?.data) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempMessage.id ? res.data.data : m
          )
        );
      }
      
      toast.success("Message sent");
    } catch (err) {
      console.error("Send error:", err);
      toast.error("Failed to send message");
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    return date.toLocaleDateString();
  };

  // Check if should show date divider
  const shouldShowDateDivider = (index: number) => {
    if (index === 0) return true;
    const current = new Date(messages[index].timestamp).toDateString();
    const previous = new Date(messages[index - 1].timestamp).toDateString();
    return current !== previous;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header color="black" />
      
      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pt-16">
        
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center gap-3 sticky top-16 z-10">
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-black text-white">
              {participant.userName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="font-semibold">{participant.userName}</h2>
            <p className="text-xs text-gray-500">Tap to view profile</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div key={msg.id}>
                  {/* Date Divider */}
                  {shouldShowDateDivider(index) && (
                    <div className="flex justify-center my-4">
                      <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`flex ${
                      msg.senderId === user?._id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        msg.senderId === user?._id
                          ? "bg-black text-white rounded-br-md"
                          : "bg-white text-gray-900 rounded-bl-md shadow-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderId === user?._id
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="bg-black hover:bg-gray-800"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Property Detail Page (`app/properties/[id]/client.tsx`)

### Purpose
Add "Chat with Agent" button to property detail page.

### Modification

Add this button to the Agent Info section:

```tsx
// In the agent info card, add:
<Link href={`/chat/${property.host._id}/${property._id}`}>
  <Button className="w-full bg-black hover:bg-gray-800">
    <MessageCircle className="h-4 w-4 mr-2" />
    Chat with Agent
  </Button>
</Link>
```

### Complete Agent Section Replacement

```tsx
<div className="rounded-lg border bg-card p-6 shadow-sm">
  <div className="mb-4 flex items-center gap-4">
    <Avatar className="h-16 w-16">
      <AvatarFallback className="bg-black text-white text-xl">
        {property.host.userName?.charAt(0)?.toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <div>
      <h3 className="font-semibold text-lg">{property.host.userName}</h3>
      <p className="text-sm text-gray-500">Property Agent</p>
      {property.host.adminVerified && (
        <Badge className="bg-green-500 mt-1">Verified</Badge>
      )}
    </div>
  </div>

  <div className="mb-6 space-y-2">
    <div className="flex items-center gap-2 text-sm">
      <Phone className="h-4 w-4 text-gray-400" />
      <span>{property.host.phoneNumber}</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <Mail className="h-4 w-4 text-gray-400" />
      <span>{property.host.email}</span>
    </div>
  </div>

  <div className="space-y-2">
    <Link href={`/chat/${property.host._id}/${property._id}`}>
      <Button className="w-full bg-black hover:bg-gray-800">
        <MessageCircle className="h-4 w-4 mr-2" />
        Chat with Agent
      </Button>
    </Link>
    
    <Button variant="outline" className="w-full">
      <Calendar className="h-4 w-4 mr-2" />
      Schedule Tour
    </Button>
  </div>
</div>
```

---

## 5. Property Feed (`components/PropertyFeed.tsx`)

### Purpose
Add chat button to TikTok-style property feed.

### Modification

Update the action buttons section:

```tsx
{/* Right Side Actions */}
<div className="absolute right-4 bottom-48 z-30 flex flex-col gap-4">
  
  {/* Like Button */}
  <button
    onClick={(e) => handleLike(e, property._id)}
    className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md"
  >
    <Heart className={`w-5 h-5 ${likedProperties.has(property._id) ? "text-pink-500 fill-pink-500" : "text-white"}`} />
  </button>

  {/* Chat Button - NEW */}
  {agentInfo.id && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/chat/${agentInfo.id}`);
      }}
      className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
    >
      <MessageCircle className="w-5 h-5 text-white" />
    </button>
  )}

  {/* Share Button */}
  <button
    onClick={(e) => handleShare(e, property)}
    className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
  >
    <Share2 className="w-5 h-5 text-white" />
  </button>
</div>
```

---

## 6. Starting a Conversation from Property

### Flow

```
User browses properties
        │
        ▼
Views property detail OR taps chat in feed
        │
        ▼
Navigates to /chat/{agentId}/{propertyId}
        │
        ▼
System checks if conversation exists
        │
        ├── If exists: Open existing conversation
        │
        └── If new: Create new conversation
                    with property context
```

### API Call to Start Conversation

```typescript
// When navigating to chat from property
const startConversation = async (agentId: string, propertyId: string) => {
  // Send first message to create conversation
  const res = await app.post(`${base}/v1/chat/send`, {
    senderId: user._id,
    receiverId: agentId,
    content: `Hi, I'm interested in this property.`,
    propertyId: propertyId,
  });
  
  if (res.data?.data) {
    // Navigate to the conversation
    router.push(`/chat/${agentId}`);
  }
};
```

---

## 7. Chat with Property Context

### When viewing a conversation about a property:

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back        Agent Smith                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🏠 3 Bedroom Apartment in Lekki                      │ │
│  │    ₦5,000,000/year     [View Property]            │ │
│  └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌────────────────────────┐              │
│                    │ Hi! Is this still     │              │
│                    │ available?             │  10:30 AM    │
│                    └────────────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Property Card Component

```tsx
{conversation.propertyContext && (
  <Link href={`/properties/${conversation.propertyContext.propertyId}`}>
    <Card className="mx-4 mb-4 bg-gray-100 hover:bg-gray-200 transition-colors">
      <CardContent className="p-3 flex items-center gap-3">
        <Home className="h-8 w-8 text-gray-500" />
        <div className="flex-1">
          <p className="font-medium text-sm line-clamp-1">
            {conversation.propertyContext.propertyTitle}
          </p>
          <p className="text-xs text-gray-500">Tap to view property</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </CardContent>
    </Card>
  </Link>
)}
```

---

## 8. Responsive Design

### Mobile (Primary)

- Full-width chat bubbles
- Sticky header with back button
- Sticky input at bottom
- Date dividers for message grouping

### Desktop (Optional Enhancement)

```tsx
// Add to conversation page container
className={`
  hidden md:flex
  max-w-3xl mx-auto
  bg-white rounded-lg shadow-lg
  mt-16 mb-8
`}
```

---

## 9. State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTIONS                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User opens chat page                                        │
│         │                                                   │
│         ▼                                                   │
│  Fetch conversations from API ────► Update Zustand store    │
│         │                                                   │
│         ▼                                                   │
│  User taps conversation ────► Fetch messages from API     │
│         │                                                   │
│         ▼                                                   │
│  User sends message ────► POST to API ────► Update store   │
│         │                                                   │
│         ▼                                                   │
│  Poll every 5s ────► Check for new messages ────► Update   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Error Handling

### Network Errors

```tsx
const fetchConversations = async () => {
  try {
    const res = await app.get(`${base}/v1/chat/${user._id}`);
    // Handle success
  } catch (err) {
    console.error("Failed to fetch:", err);
    toast.error("Failed to load conversations. Please try again.");
  }
};
```

### Send Message Errors

```tsx
const handleSend = async () => {
  try {
    // Send message
  } catch (err) {
    toast.error("Failed to send message. Tap to retry.");
    // Keep message in input for retry
  }
};
```

### Empty States

```tsx
{/* No conversations */}
{conversations.length === 0 && (
  <div className="text-center py-12">
    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-semibold">No messages yet</h3>
    <p className="text-gray-500">Browse properties to start chatting</p>
  </div>
)}

{/* No messages in conversation */}
{messages.length === 0 && (
  <div className="text-center py-12 text-gray-500">
    <p>Say hello! 👋</p>
  </div>
)}
```

---

## 11. Accessibility

- All buttons have proper labels
- Keyboard navigation for input
- Focus states on interactive elements
- Screen reader announcements for new messages
- Touch targets minimum 44x44px

---

## 12. Performance

### Optimizations

1. **Virtual scrolling** for long message lists (future enhancement)
2. **Pagination** for conversation list
3. **Lazy loading** of message history
4. **Debounced** search input
5. **Memoized** components

### Current Implementation

```tsx
// Already implemented:
- 5-second polling (not real-time, but efficient)
- localStorage caching via Zustand persist
- Optimistic UI updates (message appears immediately)
```

---

## Summary Checklist

- [ ] Create/update `store/chatStore.ts`
- [ ] Rewrite `app/chat/page.tsx` (list)
- [ ] Rewrite `app/chat/[userId]/page.tsx` (conversation)
- [ ] Update `app/properties/[id]/client.tsx` (add chat button)
- [ ] Update `components/PropertyFeed.tsx` (add chat button)
- [ ] Test full flow: browse → property → chat
- [ ] Test sending/receiving messages
- [ ] Test notification badge counts
- [ ] Test on mobile devices

---

## API Endpoints Expected

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/chat/:userId` | GET | Get all conversations |
| `/v1/chat/:userId1/:userId2` | GET | Get messages between users |
| `/v1/chat/send` | POST | Send a message |
| `/v1/chat/read` | PUT | Mark conversation as read |
