/**
 * Tour Event Repository - MongoDB Version (Updated)
 * 
 * Event naming: tourRequested, tourAgentAssigned, etc. (aggregate prefix + past tense)
 */

const EventRepository = require('./EventRepository');

const initialState = {
  propertyId: null, propertyTitle: '', propertyThumbnail: '', propertyLocation: '',
  guestId: null, guestName: '', guestEmail: '', guestPhone: '',
  hostId: null, hostName: '', agentId: null, agentName: '',
  scheduledDate: '', scheduledTime: '', status: 'scheduled', notes: '',
};

const fold = (evt, state) => {
  switch (evt.type) {
    case 'tourRequested':
      return { propertyId: evt.propertyId, propertyTitle: evt.propertyTitle, propertyThumbnail: evt.propertyThumbnail, propertyLocation: evt.propertyLocation, guestId: evt.guestId, guestName: evt.guestName, guestEmail: evt.guestEmail, guestPhone: evt.guestPhone, hostId: evt.hostId, hostName: evt.hostName };
    case 'tourAgentAssigned':
      return { agentId: evt.agentId, agentName: evt.agentName };
    case 'tourRescheduled':
      return { scheduledDate: evt.scheduledDate, scheduledTime: evt.scheduledTime };
    case 'tourCompleted':
      return { status: 'completed' };
    case 'tourCancelled':
      return { status: 'cancelled' };
    case 'tourNotesAdded':
      return { notes: evt.notes };
    default:
      return {};
  }
};

const eventHandlers = {
  tourRequested: async (id, evt, repo) => {
    await repo._addToReadModel(id, {
      propertyId: evt.propertyId, propertyTitle: evt.propertyTitle, propertyThumbnail: evt.propertyThumbnail || '',
      propertyLocation: evt.propertyLocation || '', guestId: evt.guestId, guestName: evt.guestName, guestEmail: evt.guestEmail || '', guestPhone: evt.guestPhone, hostId: evt.hostId, hostName: evt.hostName, agentId: null, agentName: '',
      scheduledDate: evt.scheduledDate, scheduledTime: evt.scheduledTime || '', status: 'scheduled', notes: '',
    });
  },
  tourAgentAssigned: async (id, evt, repo) => repo._updateInReadModel(id, { agentId: evt.agentId, agentName: evt.agentName }),
  tourRescheduled: async (id, evt, repo) => repo._updateInReadModel(id, { scheduledDate: evt.scheduledDate, scheduledTime: evt.scheduledTime }),
  tourCompleted: async (id, _, repo) => repo._updateInReadModel(id, { status: 'completed' }),
  tourCancelled: async (id, _, repo) => repo._updateInReadModel(id, { status: 'cancelled' }),
  tourNotesAdded: async (id, evt, repo) => repo._updateInReadModel(id, { notes: evt.notes }),
};

const commands = {
  request: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('Tour already requested');
    return { type: 'tourRequested', propertyId: cmd.propertyId, propertyTitle: cmd.propertyTitle, propertyThumbnail: cmd.propertyThumbnail, propertyLocation: cmd.propertyLocation, guestId: cmd.guestId, guestName: cmd.guestName, guestEmail: cmd.guestEmail, guestPhone: cmd.guestPhone, hostId: cmd.hostId, hostName: cmd.hostName };
  },
  assignAgent: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Tour not found');
    if (agg.agentId) throw new Error('Agent already assigned');
    return { type: 'tourAgentAssigned', agentId: cmd.agentId, agentName: cmd.agentName };
  },
  reschedule: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Tour not found');
    if (agg.status !== 'scheduled') throw new Error('Cannot reschedule');
    return { type: 'tourRescheduled', scheduledDate: cmd.scheduledDate, scheduledTime: cmd.scheduledTime };
  },
  complete: async (_, agg) => {
    if (agg.version === 0) throw new Error('Tour not found');
    if (agg.status !== 'scheduled') throw new Error('Tour already completed or cancelled');
    return { type: 'tourCompleted' };
  },
  cancel: async (_, agg) => {
    if (agg.version === 0) throw new Error('Tour not found');
    if (['completed', 'cancelled'].includes(agg.status)) throw new Error('Tour already completed or cancelled');
    return { type: 'tourCancelled' };
  },
  addNotes: async (cmd, agg) => {
    if (agg.version === 0) throw new Error('Tour not found');
    return { type: 'tourNotesAdded', notes: cmd.notes };
  },
};

let tourEventRepo = null;

function createTourEventRepo(readModelCollection) {
  if (tourEventRepo) return tourEventRepo;
  tourEventRepo = new EventRepository('tour', 'tour-events', { initialState, fold, commands, eventHandlers }, readModelCollection);
  tourEventRepo._initEventSourcing();
  return tourEventRepo;
}

module.exports = { createTourEventRepo };