export type TourEvt =
  | {
      type: 'tourRequested';
      propertyId: string;
      propertyTitle: string;
      propertyThumbnail?: string;
      propertyLocation?: string;
      guestId: string;
      guestName: string;
      guestEmail?: string;
      guestPhone: string;
      hostId: string;
      hostName: string;
      scheduledDate: string;
      scheduledTime?: string;
      notes?: string;
      performedBy?: string;
    }
  | {
      type: 'tourAgentAssigned';
      agentId: string;
      agentName: string;
      performedBy?: string;
    }
  | {
      type: 'tourRescheduled';
      scheduledDate: string;
      scheduledTime?: string;
      performedBy?: string;
    }
  | {
      type: 'tourCompleted';
      performedBy?: string;
    }
  | {
      type: 'tourCancelled';
      performedBy?: string;
    }
  | {
      type: 'tourNotesAdded';
      notes: string;
      performedBy?: string;
    };

export type TourAgg = {
  propertyId: string;
  propertyTitle: string;
  propertyThumbnail: string;
  propertyLocation: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  hostId: string;
  hostName: string;
  agentId: string;
  agentName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
};

export type TourCmd =
  | {
      type: 'request';
      propertyId: string;
      propertyTitle: string;
      propertyThumbnail?: string;
      propertyLocation?: string;
      guestId: string;
      guestName: string;
      guestEmail?: string;
      guestPhone: string;
      hostId: string;
      hostName: string;
      scheduledDate: string;
      scheduledTime?: string;
      notes?: string;
      performedBy?: string;
    }
  | {
      type: 'assignAgent';
      agentId: string;
      agentName: string;
      performedBy?: string;
    }
  | {
      type: 'reschedule';
      scheduledDate: string;
      scheduledTime?: string;
      performedBy?: string;
    }
  | {
      type: 'complete';
      performedBy?: string;
    }
  | {
      type: 'cancel';
      performedBy?: string;
    }
  | {
      type: 'addNotes';
      notes: string;
      performedBy?: string;
    };