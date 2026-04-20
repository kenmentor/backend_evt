export type ConversationEvt =
  | {
      type: 'conversationCreated';
      participants: string[];
      participantNames: Record<string, string>;
      participantAvatars: Record<string, string>;
      propertyContext?: string;
      performedBy?: string;
    }
  | {
      type: 'conversationParticipantAdded';
      participantId: string;
      participantName: string;
      performedBy?: string;
    }
  | {
      type: 'conversationMessageSent';
      content: string;
      senderId: string;
      performedBy?: string;
    }
  | {
      type: 'conversationMessageRead';
      userId: string;
      performedBy?: string;
    }
  | {
      type: 'conversationPropertyContextUpdated';
      propertyContext: string;
      performedBy?: string;
    };

export type ConversationAgg = {
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  propertyContext: string;
  lastMessage: { content: string; senderId: string; timestamp: Date } | null;
  unreadCount: Record<string, number>;
};

export type ConversationCmd =
  | {
      type: 'create';
      participants: string[];
      participantNames: Record<string, string>;
      participantAvatars: Record<string, string>;
      propertyContext?: string;
      performedBy?: string;
    }
  | {
      type: 'addParticipant';
      participantId: string;
      participantName: string;
      performedBy?: string;
    }
  | {
      type: 'sendMessage';
      content: string;
      senderId: string;
      performedBy?: string;
    }
  | {
      type: 'markAsRead';
      userId: string;
      performedBy?: string;
    }
  | {
      type: 'updatePropertyContext';
      propertyContext: string;
      performedBy?: string;
    };

export type MessageEvt =
  | {
      type: 'messageSent';
      conversationId: string;
      senderId: string;
      receiverId: string;
      content: string;
      performedBy?: string;
    }
  | {
      type: 'messageRead';
      performedBy?: string;
    }
  | {
      type: 'messageDeleted';
      performedBy?: string;
    };

export type MessageAgg = {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  deleted: boolean;
};

export type MessageCmd =
  | {
      type: 'send';
      conversationId: string;
      senderId: string;
      receiverId: string;
      content: string;
      performedBy?: string;
    }
  | {
      type: 'markAsRead';
      performedBy?: string;
    }
  | {
      type: 'delete';
      performedBy?: string;
    };