import { createCommands } from 'evtstore';
import type { TourEvt, TourAgg, TourCmd } from '../types/tour';
import { domain } from '../domain';

export const tourCmd = createCommands<TourEvt, TourAgg, TourCmd>(domain.tours, {
  async request(cmd, agg) {
    if (agg.version > 0) throw new Error('Tour already requested');
    return {
      type: 'tourRequested',
      propertyId: cmd.propertyId,
      propertyTitle: cmd.propertyTitle,
      propertyThumbnail: cmd.propertyThumbnail,
      propertyLocation: cmd.propertyLocation,
      guestId: cmd.guestId,
      guestName: cmd.guestName,
      guestEmail: cmd.guestEmail,
      guestPhone: cmd.guestPhone,
      hostId: cmd.hostId,
      hostName: cmd.hostName,
      scheduledDate: cmd.scheduledDate,
      scheduledTime: cmd.scheduledTime,
      notes: cmd.notes,
      performedBy: cmd.performedBy,
    };
  },

  async assignAgent(cmd, agg) {
    if (agg.version === 0) throw new Error('Tour not found');
    if (agg.agentId) throw new Error('Agent already assigned');
    return {
      type: 'tourAgentAssigned',
      agentId: cmd.agentId,
      agentName: cmd.agentName,
      performedBy: cmd.performedBy,
    };
  },

  async reschedule(cmd, agg) {
    if (agg.version === 0) throw new Error('Tour not found');
    if (agg.status !== 'scheduled') throw new Error('Cannot reschedule');
    return {
      type: 'tourRescheduled',
      scheduledDate: cmd.scheduledDate,
      scheduledTime: cmd.scheduledTime,
      performedBy: cmd.performedBy,
    };
  },

  async complete(cmd, agg) {
    if (agg.version === 0) throw new Error('Tour not found');
    if (agg.status !== 'scheduled') throw new Error('Tour already completed or cancelled');
    return {
      type: 'tourCompleted',
      performedBy: cmd.performedBy,
    };
  },

  async cancel(cmd, agg) {
    if (agg.version === 0) throw new Error('Tour not found');
    if (agg.status !== 'scheduled') throw new Error('Tour already completed or cancelled');
    return {
      type: 'tourCancelled',
      performedBy: cmd.performedBy,
    };
  },

  async addNotes(cmd, agg) {
    if (agg.version === 0) throw new Error('Tour not found');
    return {
      type: 'tourNotesAdded',
      notes: cmd.notes,
      performedBy: cmd.performedBy,
    };
  },
});