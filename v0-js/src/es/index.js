const { createAggregate } = require('evtstore');

const userAgg = createAggregate({
  stream: 'users',
  create: () => ({
    email: '', userName: '', phoneNumber: '', dateOfBirth: null, NIN: null, lastLogin: null,
    verifiedEmail: false, verifiedNIN: false, adminVerified: false, role: 'USER', rank: 1,
    verificationCompleted: false, socialMedia: [], profileImage: '', pioneer: false,
    forgottonPasswordToken: null, forgottonPasswordTokenExpireAt: null, verifyToken: null,
    verificationTokenExpireAt: null, disabled: false, deleted: false,
  }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'userCreated':
        return { ...prev, email: evt.email, userName: evt.userName, phoneNumber: evt.phoneNumber, dateOfBirth: evt.dateOfBirth || null };
      case 'userEmailVerified':
        return { ...prev, verifiedEmail: true };
      case 'userNINVerified':
        return { ...prev, verifiedNIN: true, verificationCompleted: true };
      case 'userAdminVerified':
        return { ...prev, adminVerified: true };
      case 'userProfileImageUpdated':
        return { ...prev, profileImage: evt.profileImage };
      case 'userNameChanged':
        return { ...prev, userName: evt.userName };
      case 'userPhoneNumberChanged':
        return { ...prev, phoneNumber: evt.phoneNumber };
      case 'userEmailChanged':
        return { ...prev, email: evt.email };
      case 'userRoleChanged':
        return { ...prev, role: evt.role };
      case 'userRankChanged':
        return { ...prev, rank: evt.rank };
      case 'userPioneerGranted':
        return { ...prev, pioneer: true };
      case 'userPasswordResetRequested':
        return { ...prev, forgottonPasswordToken: evt.token, forgottonPasswordTokenExpireAt: evt.expiresAt };
      case 'userPasswordReset':
        return { ...prev, forgottonPasswordToken: null, forgottonPasswordTokenExpireAt: null };
      case 'userDisabled':
        return { ...prev, disabled: true };
      case 'userDeleted':
        return { ...prev, disabled: true, deleted: true };
      case 'userLoggedIn':
        return { ...prev, lastLogin: new Date() };
      default:
        return prev;
    }
  },
});

const tourAgg = createAggregate({
  stream: 'tours',
  create: () => ({
    propertyId: '', propertyTitle: '', propertyThumbnail: '', propertyLocation: '',
    guestId: '', guestName: '', guestEmail: '', guestPhone: '',
    hostId: '', hostName: '', agentId: '', agentName: '',
    scheduledDate: '', scheduledTime: '', status: 'scheduled', notes: '',
  }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'tourRequested':
        return { ...prev, propertyId: evt.propertyId, propertyTitle: evt.propertyTitle,
          propertyThumbnail: evt.propertyThumbnail || '', propertyLocation: evt.propertyLocation || '',
          guestId: evt.guestId, guestName: evt.guestName, guestEmail: evt.guestEmail || '', guestPhone: evt.guestPhone,
          hostId: evt.hostId, hostName: evt.hostName, agentId: '', agentName: '',
          scheduledDate: evt.scheduledDate, scheduledTime: evt.scheduledTime || '', status: 'scheduled', notes: evt.notes || '' };
      case 'tourAgentAssigned':
        return { ...prev, agentId: evt.agentId, agentName: evt.agentName };
      case 'tourRescheduled':
        return { ...prev, scheduledDate: evt.scheduledDate, scheduledTime: evt.scheduledTime || prev.scheduledTime };
      case 'tourCompleted':
        return { ...prev, status: 'completed' };
      case 'tourCancelled':
        return { ...prev, status: 'cancelled' };
      case 'tourNotesAdded':
        return { ...prev, notes: evt.notes };
      default:
        return prev;
    }
  },
});

const bookingAgg = createAggregate({
  stream: 'bookings',
  create: () => ({
    host: '', guest: '', house: '', amount: 0, status: 'pending',
    paymentId: '', checkIn: '', checkOut: '', platformFee: 0, expiredDate: null,
  }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'bookingCreated':
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + 3);
        return { ...prev, host: evt.host, guest: evt.guest, house: evt.house, amount: evt.amount,
          paymentId: evt.paymentId || '', checkIn: evt.checkIn, checkOut: evt.checkOut, platformFee: evt.platformFee,
          status: 'pending', expiredDate };
      case 'bookingConfirmed':
        return { ...prev, status: 'confirmed' };
      case 'bookingCancelled':
        return { ...prev, status: 'cancelled' };
      case 'bookingCompleted':
        return { ...prev, status: 'completed' };
      case 'bookingExpired':
        return { ...prev, status: 'expired' };
      case 'bookingPaymentUpdated':
        return { ...prev, paymentId: evt.paymentId };
      case 'bookingDatesChanged':
        return { ...prev, checkIn: evt.checkIn, checkOut: evt.checkOut };
      default:
        return prev;
    }
  },
});

const resourceAgg = createAggregate({
  stream: 'resources',
  create: () => ({
    host: '', title: '', description: '', houseType: '', category: '', price: '',
    address: '', state: '', lga: '', location: '',
    bedrooms: 1, bathrooms: 1, furnishing: '', amenities: [], images: [],
    video: '', thumbnail: '', views: 0, avaliable: true, deleted: false,
  }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'resourceCreated':
        return { ...prev, host: evt.host, title: evt.title, description: evt.description || '',
          houseType: evt.houseType || '', category: evt.category || '', price: evt.price || '',
          address: evt.address || '', state: evt.state || '', lga: evt.lga || '', location: evt.location || '',
          bedrooms: evt.bedrooms || 1, bathrooms: evt.bathrooms || 1, furnishing: evt.furnishing || '',
          amenities: evt.amenities || [], images: evt.images || [], video: evt.video || '', thumbnail: evt.thumbnail || '',
          views: 0, avaliable: true, deleted: false };
      case 'resourceLocationUpdated':
        return { ...prev, address: evt.address || prev.address, state: evt.state || prev.state, lga: evt.lga || prev.lga, location: evt.location || prev.location };
      case 'resourceDetailsUpdated':
        return { ...prev, bedrooms: evt.bedrooms || prev.bedrooms, bathrooms: evt.bathrooms || prev.bathrooms, furnishing: evt.furnishing || prev.furnishing };
      case 'resourceAmenitiesUpdated':
        return { ...prev, amenities: evt.amenities };
      case 'resourceMediaAdded':
        return { ...prev, images: [...prev.images, ...(evt.images || [])], video: evt.video || prev.video, thumbnail: evt.thumbnail || prev.thumbnail };
      case 'resourceMediaRemoved':
        return { ...prev, images: prev.images.filter(function(img) { return evt.imageUrls.indexOf(img.url) === -1; }) };
      case 'resourcePriceUpdated':
        return { ...prev, price: evt.price };
      case 'resourceAvailabilityChanged':
        return { ...prev, avaliable: evt.avaliable };
      case 'resourceViewed':
        return { ...prev, views: prev.views + 1 };
      case 'resourceDeleted':
        return { ...prev, avaliable: false, deleted: true };
      default:
        return prev;
    }
  },
});

const paymentAgg = createAggregate({
  stream: 'payments',
  create: () => ({
    host: '', guest: '', house: '', note: '', amount: 0, method: '', refund: 0,
    status: 'pending', paymentRef: '',
  }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'paymentInitiated':
        return { ...prev, host: evt.host, guest: evt.guest, house: evt.house, note: evt.note || '', amount: evt.amount,
          method: evt.method || '', refund: 0, status: 'pending', paymentRef: evt.paymentRef };
      case 'paymentCompleted':
        return { ...prev, status: 'completed' };
      case 'paymentFailed':
        return { ...prev, status: 'failed' };
      case 'paymentRefunded':
        return { ...prev, status: 'refunded', refund: evt.refundAmount };
      case 'paymentRefundRequested':
        return { ...prev, status: 'refund_requested' };
      default:
        return prev;
    }
  },
});

const conversationAgg = createAggregate({
  stream: 'conversations',
  create: () => ({ participants: [], participantNames: {}, participantAvatars: {}, propertyContext: '', lastMessage: null, unreadCount: {} }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'conversationCreated':
        const unreadCount = {};
        evt.participants.forEach(function(p) { unreadCount[p] = 0; });
        return { ...prev, participants: evt.participants, participantNames: evt.participantNames, participantAvatars: evt.participantAvatars,
          propertyContext: evt.propertyContext || '', lastMessage: null, unreadCount };
      case 'conversationParticipantAdded':
        return { ...prev, participants: prev.participants.concat([evt.participantId]),
          participantNames: (function(o) { o[evt.participantId] = evt.participantName; return o; })(Object.assign({}, prev.participantNames)),
          unreadCount: (function(o) { o[evt.participantId] = 0; return o; })(Object.assign({}, prev.unreadCount)) };
      case 'conversationMessageSent':
        return { ...prev, lastMessage: { content: evt.content, senderId: evt.senderId, timestamp: new Date() } };
      case 'conversationMessageRead':
        return { ...prev, unreadCount: (function(o) { o[evt.userId] = 0; return o; })(Object.assign({}, prev.unreadCount)) };
      case 'conversationPropertyContextUpdated':
        return { ...prev, propertyContext: evt.propertyContext };
      default:
        return prev;
    }
  },
});

const messageAgg = createAggregate({
  stream: 'messages',
  create: () => ({ conversationId: '', senderId: '', receiverId: '', content: '', read: false, deleted: false }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'messageSent':
        return { ...prev, conversationId: evt.conversationId, senderId: evt.senderId, receiverId: evt.receiverId, content: evt.content };
      case 'messageRead':
        return { ...prev, read: true };
      case 'messageDeleted':
        return { ...prev, content: '[deleted]', deleted: true };
      default:
        return prev;
    }
  },
});

const requestAgg = createAggregate({
  stream: 'requests',
  create: () => ({ guest: '', host: '', house: '', checkIn: '', checkOut: '', guests: 0, totalPrice: 0, note: '', status: 'pending' }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'requestCreated':
        return { ...prev, guest: evt.guest, host: evt.host, house: evt.house, checkIn: evt.checkIn, checkOut: evt.checkOut, guests: evt.guests, totalPrice: evt.totalPrice, note: evt.note || '', status: 'pending' };
      case 'requestApproved':
        return { ...prev, status: 'approved' };
      case 'requestRejected':
        return { ...prev, status: 'rejected' };
      case 'requestCancelled':
        return { ...prev, status: 'cancelled' };
      default:
        return prev;
    }
  },
});

const favoriteAgg = createAggregate({
  stream: 'favorites',
  create: () => ({ userId: '', houseId: '' }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'favoriteAdded':
        return { ...prev, userId: evt.userId, houseId: evt.houseId };
      case 'favoriteRemoved':
        return { ...prev, userId: '', houseId: '' };
      default:
        return prev;
    }
  },
});

const feedbackAgg = createAggregate({
  stream: 'feedbacks',
  create: () => ({ userId: '', houseId: '', rating: 0, comment: '', deleted: false }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'feedbackCreated':
        return { ...prev, userId: evt.userId, houseId: evt.houseId, rating: evt.rating, comment: evt.comment };
      case 'feedbackUpdated':
        return { ...prev, rating: evt.rating || prev.rating, comment: evt.comment || prev.comment };
      case 'feedbackDeleted':
        return { ...prev, deleted: true };
      default:
        return prev;
    }
  },
});

const demandAgg = createAggregate({
  stream: 'demands',
  create: () => ({ guest: '', category: '', minPrice: 0, maxPrice: 0, location: '', description: '', deleted: false }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'demandCreated':
        return { ...prev, guest: evt.guest, category: evt.category, minPrice: evt.minPrice || 0, maxPrice: evt.maxPrice || 0, location: evt.location || '', description: evt.description || '' };
      case 'demandUpdated':
        return { ...prev, category: evt.category || prev.category, minPrice: evt.minPrice || prev.minPrice, maxPrice: evt.maxPrice || prev.maxPrice, location: evt.location || prev.location, description: evt.description || prev.description };
      case 'demandDeleted':
        return { ...prev, deleted: true };
      default:
        return prev;
    }
  },
});

const payoutAgg = createAggregate({
  stream: 'payouts',
  create: () => ({ host: '', agentId: '', amount: 0, bankName: '', accountNumber: '', accountName: '', status: 'pending', transactionRef: '' }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'payoutCreated':
        return { ...prev, host: evt.host, agentId: evt.agentId, amount: evt.amount, bankName: evt.bankName || '', accountNumber: evt.accountNumber || '', accountName: evt.accountName || '' };
      case 'payoutApproved':
        return { ...prev, status: 'approved' };
      case 'payoutRejected':
        return { ...prev, status: 'rejected' };
      case 'payoutProcessed':
        return { ...prev, status: 'processed', transactionRef: evt.transactionRef || '' };
      default:
        return prev;
    }
  },
});

const analyticsAgg = createAggregate({
  stream: 'analytics',
  create: () => ({ userId: '', eventType: '', timestamp: null, metadata: {} }),
  fold: (evt, prev) => {
    switch (evt.type) {
      case 'analyticsRecorded':
        return { ...prev, userId: evt.userId, eventType: evt.eventType, timestamp: new Date(), metadata: evt.metadata || {} };
      default:
        return prev;
    }
  },
});

module.exports = {
  userAgg, tourAgg, bookingAgg, resourceAgg, paymentAgg,
  conversationAgg, messageAgg, requestAgg, favoriteAgg,
  feedbackAgg, demandAgg, payoutAgg, analyticsAgg,
};