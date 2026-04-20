import { createAggregate } from 'evtstore';
import type { TourEvt, TourAgg } from '../types/tour';

export const tourAgg = createAggregate<TourEvt, TourAgg, 'tours'>({
  stream: 'tours',
  create: (): TourAgg => ({
    propertyId: '',
    propertyTitle: '',
    propertyThumbnail: '',
    propertyLocation: '',
    guestId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    hostId: '',
    hostName: '',
    agentId: '',
    agentName: '',
    scheduledDate: '',
    scheduledTime: '',
    status: 'scheduled',
    notes: '',
  }),
  fold: (evt, prev): TourAgg => {
    switch (evt.type) {
      case 'tourRequested':
        return {
          ...prev,
          propertyId: evt.propertyId,
          propertyTitle: evt.propertyTitle,
          propertyThumbnail: evt.propertyThumbnail || '',
          propertyLocation: evt.propertyLocation || '',
          guestId: evt.guestId,
          guestName: evt.guestName,
          guestEmail: evt.guestEmail || '',
          guestPhone: evt.guestPhone,
          hostId: evt.hostId,
          hostName: evt.hostName,
          agentId: '',
          agentName: '',
          scheduledDate: evt.scheduledDate,
          scheduledTime: evt.scheduledTime || '',
          status: 'scheduled',
          notes: evt.notes || '',
        };

      case 'tourAgentAssigned':
        return {
          ...prev,
          agentId: evt.agentId,
          agentName: evt.agentName,
        };

      case 'tourRescheduled':
        return {
          ...prev,
          scheduledDate: evt.scheduledDate,
          scheduledTime: evt.scheduledTime || prev.scheduledTime,
        };

      case 'tourCompleted':
        return {
          ...prev,
          status: 'completed',
        };

      case 'tourCancelled':
        return {
          ...prev,
          status: 'cancelled',
        };

      case 'tourNotesAdded':
        return {
          ...prev,
          notes: evt.notes,
        };

      default:
        return prev;
    }
  },
});