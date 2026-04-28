import { projCol } from './projection-shared';
import type {
  UserProjection,
  TourProjection,
  BookingProjection,
  ResourceProjection,
  PaymentProjection,
  ConversationProjection,
  MessageProjection,
  RequestProjection,
  FavoriteProjection,
  FeedbackProjection,
  DemandProjection,
  PayoutProjection,
  AnalyticsProjection,
} from './projection-shared';
import type { Document } from 'mongodb';

function cleanDoc<T>(doc: Document | null): T | null {
  if (!doc) return null;
  const { _id: _, ...rest } = doc as any;
  return rest as T;
}

function cleanDocs<T>(docs: Document[]): T[] {
  return docs.map((doc) => {
    const { _id: _, ...rest } = doc as any;
    return rest as T;
  });
}

const u = () => projCol<UserProjection>('users');
const t = () => projCol<TourProjection>('tours');
const b = () => projCol<BookingProjection>('bookings');
const r = () => projCol<ResourceProjection>('resources');
const p = () => projCol<PaymentProjection>('payments');
const cv = () => projCol<ConversationProjection>('conversations');
const msg = () => projCol<MessageProjection>('messages');
const req = () => projCol<RequestProjection>('requests');
const fav = () => projCol<FavoriteProjection>('favorites');
const fb = () => projCol<FeedbackProjection>('feedbacks');
const dm = () => projCol<DemandProjection>('demands');
const po = () => projCol<PayoutProjection>('payouts');
const an = () => projCol<AnalyticsProjection>('analytics');

export const queryUsers = {
  getById: async (id: string) => {
    const doc = await u().findOne({ userId: id });
    return cleanDoc<UserProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await u().findOne({ _id: id as any });
    return cleanDoc<UserProjection>(doc);
  },

  getByEmail: async (email: string) => {
    const doc = await u().findOne({ email, deleted: { $ne: true } });
    return cleanDoc<UserProjection>(doc);
  },

  getByPhone: async (phoneNumber: string) => {
    const doc = await u()
      .findOne({ phoneNumber, deleted: { $ne: true } });
    return cleanDoc<UserProjection>(doc);
  },

  getByRole: async (role: string, skip = 0, limit = 50) => {
    const docs = await u()
      .find({ role, deleted: { $ne: true }, disabled: { $ne: true } })
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<UserProjection>(docs);
  },

  getAdmins: async (skip = 0, limit = 50) => {
    const docs = await u()
      .find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] }, deleted: { $ne: true } })
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<UserProjection>(docs);
  },

  getVerifiedUsers: async (skip = 0, limit = 50) => {
    const docs = await u()
      .find({ adminVerified: true, deleted: { $ne: true } })
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<UserProjection>(docs);
  },

  getPioneers: async (skip = 0, limit = 50) => {
    const docs = await u()
      .find({ pioneer: true, deleted: { $ne: true } })
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<UserProjection>(docs);
  },

  searchByName: async (search: string, skip = 0, limit = 50) => {
    const docs = await u()
      .find({
        userName: { $regex: search, $options: 'i' },
        deleted: { $ne: true },
      })
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<UserProjection>(docs);
  },

  getAll: async (skip = 0, limit = 50) => {
    const docs = await u()
      .find({ deleted: { $ne: true } })
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<UserProjection>(docs);
  },
};

export const queryTours = {
  getById: async (id: string) => {
    const doc = await t().findOne({ tourId: id });
    return cleanDoc<TourProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await t().findOne({ _id: id as any });
    return cleanDoc<TourProjection>(doc);
  },

  getByGuest: async (guestId: string, skip = 0, limit = 50) => {
    const docs = await t()
      .find({ guestId })
      .sort({ scheduledDate: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<TourProjection>(docs);
  },

  getByHost: async (hostId: string, skip = 0, limit = 50) => {
    const docs = await t()
      .find({ hostId })
      .sort({ scheduledDate: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<TourProjection>(docs);
  },

  getByAgent: async (agentId: string, skip = 0, limit = 50) => {
    const docs = await t()
      .find({ agentId })
      .sort({ scheduledDate: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<TourProjection>(docs);
  },

  getByProperty: async (propertyId: string, skip = 0, limit = 50) => {
    const docs = await t()
      .find({ propertyId })
      .sort({ scheduledDate: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<TourProjection>(docs);
  },

  getByStatus: async (status: string, skip = 0, limit = 50) => {
    const docs = await t()
      .find({ status: status as any })
      .sort({ scheduledDate: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<TourProjection>(docs);
  },

  getUpcoming: async (skip = 0, limit = 50) => {
    const docs = await t()
      .find({ status: 'scheduled' })
      .sort({ scheduledDate: 1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<TourProjection>(docs);
  },

  getAll: async (skip = 0, limit = 50) => {
    const docs = await t()
      .find({})
      .sort({ scheduledDate: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<TourProjection>(docs);
  },
};

export const queryBookings = {
  getById: async (id: string) => {
    const doc = await b().findOne({ bookingId: id });
    return cleanDoc<BookingProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await b().findOne({ _id: id as any });
    return cleanDoc<BookingProjection>(doc);
  },

  getByHost: async (host: string, skip = 0, limit = 50) => {
    const docs = await b()
      .find({ host })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<BookingProjection>(docs);
  },

  getByGuest: async (guest: string, skip = 0, limit = 50) => {
    const docs = await b()
      .find({ guest })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<BookingProjection>(docs);
  },

  getByHouse: async (house: string, skip = 0, limit = 50) => {
    const docs = await b()
      .find({ house })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<BookingProjection>(docs);
  },

  getByStatus: async (status: string, skip = 0, limit = 50) => {
    const docs = await b()
      .find({ status: status as any })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<BookingProjection>(docs);
  },

  getByPaymentId: async (paymentId: string) => {
    const doc = await b().findOne({ paymentId });
    return cleanDoc<BookingProjection>(doc);
  },

  getByDateRange: async (checkIn: string, checkOut: string, skip = 0, limit = 50) => {
    const docs = await b()
      .find({
        checkIn: { $lte: checkOut },
        checkOut: { $gte: checkIn },
        status: { $in: ['pending', 'confirmed'] },
      })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<BookingProjection>(docs);
  },

  getAll: async (skip = 0, limit = 50) => {
    const docs = await b()
      .find({})
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<BookingProjection>(docs);
  },
};

export const queryResources = {
  getById: async (id: string) => {
    const doc = await r().findOne({ resourceId: id });
    return cleanDoc<ResourceProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await r().findOne({ _id: id as any });
    return cleanDoc<ResourceProjection>(doc);
  },

  getByHost: async (host: string, skip = 0, limit = 50) => {
    const docs = await r()
      .find({ host, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ResourceProjection>(docs);
  },

  getByCategory: async (category: string, skip = 0, limit = 50) => {
    const docs = await r()
      .find({ category, avaliable: true, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ResourceProjection>(docs);
  },

  getByState: async (state: string, skip = 0, limit = 50) => {
    const docs = await r()
      .find({ state, avaliable: true, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ResourceProjection>(docs);
  },

  getByPriceRange: async (min: number, max: number, skip = 0, limit = 50) => {
    const docs = await r()
      .find({
        price: { $gte: String(min), $lte: String(max) },
        avaliable: true,
        deleted: { $ne: true },
      })
      .sort({ price: 1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ResourceProjection>(docs);
  },

  getAvailable: async (skip = 0, limit = 50) => {
    const docs = await r()
      .find({ avaliable: true, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ResourceProjection>(docs);
  },

  searchByText: async (search: string, skip = 0, limit = 50) => {
    const docs = await r()
      .find({
        $text: { $search: search },
        avaliable: true,
        deleted: { $ne: true },
      })
      .project({ score: { $meta: 'textScore' } } as any)
      .sort({ score: { $meta: 'textScore' } } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ResourceProjection>(docs);
  },

  getByAmenities: async (amenities: string[], skip = 0, limit = 50) => {
    const docs = await r()
      .find({
        amenities: { $all: amenities },
        avaliable: true,
        deleted: { $ne: true },
      })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ResourceProjection>(docs);
  },

  getPopular: async (skip = 0, limit = 20) => {
    const docs = await r()
      .find({ avaliable: true, deleted: { $ne: true } })
      .sort({ views: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ResourceProjection>(docs);
  },

  getAll: async (skip = 0, limit = 50) => {
    const docs = await r()
      .find({ deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ResourceProjection>(docs);
  },
};

export const queryPayments = {
  getById: async (id: string) => {
    const doc = await p().findOne({ paymentId: id });
    return cleanDoc<PaymentProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await p().findOne({ _id: id as any });
    return cleanDoc<PaymentProjection>(doc);
  },

  getByHost: async (host: string, skip = 0, limit = 50) => {
    const docs = await p()
      .find({ host })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<PaymentProjection>(docs);
  },

  getByGuest: async (guest: string, skip = 0, limit = 50) => {
    const docs = await p()
      .find({ guest })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<PaymentProjection>(docs);
  },

  getByHouse: async (house: string, skip = 0, limit = 50) => {
    const docs = await p()
      .find({ house })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<PaymentProjection>(docs);
  },

  getByStatus: async (status: string, skip = 0, limit = 50) => {
    const docs = await p()
      .find({ status: status as any })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<PaymentProjection>(docs);
  },

  getByPaymentRef: async (paymentRef: string) => {
    const doc = await p().findOne({ paymentRef });
    return cleanDoc<PaymentProjection>(doc);
  },

  getAll: async (skip = 0, limit = 50) => {
    const docs = await p()
      .find({})
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<PaymentProjection>(docs);
  },
};

export const queryConversations = {
  getById: async (id: string) => {
    const doc = await cv().findOne({ conversationId: id });
    return cleanDoc<ConversationProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await cv().findOne({ _id: id as any });
    return cleanDoc<ConversationProjection>(doc);
  },

  getByParticipant: async (participantId: string, skip = 0, limit = 50) => {
    const docs = await cv()
      .find({ participants: participantId })
      .sort({ updatedAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ConversationProjection>(docs);
  },

  getByProperty: async (propertyContext: string, skip = 0, limit = 50) => {
    const docs = await cv()
      .find({ propertyContext })
      .sort({ updatedAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ConversationProjection>(docs);
  },

  getRecentByParticipant: async (participantId: string, limit = 20) => {
    const docs = await cv()
      .find({ participants: participantId })
      .sort({ 'lastMessage.timestamp': -1, _id: -1 } as any)
      .limit(limit)
      .toArray();
    return cleanDocs<ConversationProjection>(docs);
  },

  getAll: async (skip = 0, limit = 50) => {
    const docs = await cv()
      .find({})
      .sort({ updatedAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<ConversationProjection>(docs);
  },
};

export const queryMessages = {
  getById: async (id: string) => {
    const doc = await msg().findOne({ messageId: id });
    return cleanDoc<MessageProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await msg().findOne({ _id: id as any });
    return cleanDoc<MessageProjection>(doc);
  },

  getByConversation: async (conversationId: string, skip = 0, limit = 100) => {
    const docs = await msg()
      .find({ conversationId })
      .sort({ createdAt: 1, _id: 1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<MessageProjection>(docs);
  },

  getUnreadByUser: async (userId: string, skip = 0, limit = 50) => {
    const docs = await msg()
      .find({ receiverId: userId, read: false, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<MessageProjection>(docs);
  },

  getRecentByConversation: async (conversationId: string, limit = 50) => {
    const docs = await msg()
      .find({ conversationId, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .limit(limit)
      .toArray();
    return cleanDocs<MessageProjection>(docs);
  },

  searchContent: async (conversationId: string, search: string, skip = 0, limit = 50) => {
    const docs = await msg()
      .find({
        conversationId,
        content: { $regex: search, $options: 'i' },
        deleted: { $ne: true },
      })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<MessageProjection>(docs);
  },

  getAll: async (skip = 0, limit = 100) => {
    const docs = await msg()
      .find({})
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<MessageProjection>(docs);
  },
};

export const queryRequests = {
  getById: async (id: string) => {
    const doc = await req().findOne({ requestId: id });
    return cleanDoc<RequestProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await req().findOne({ _id: id as any });
    return cleanDoc<RequestProjection>(doc);
  },

  getByGuest: async (guest: string, skip = 0, limit = 50) => {
    const docs = await req()
      .find({ guest })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<RequestProjection>(docs);
  },

  getByHost: async (host: string, skip = 0, limit = 50) => {
    const docs = await req()
      .find({ host })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<RequestProjection>(docs);
  },

  getByHouse: async (house: string, skip = 0, limit = 50) => {
    const docs = await req()
      .find({ house })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<RequestProjection>(docs);
  },

  getByStatus: async (status: string, skip = 0, limit = 50) => {
    const docs = await req()
      .find({ status: status as any })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<RequestProjection>(docs);
  },

  getAll: async (skip = 0, limit = 50) => {
    const docs = await req()
      .find({})
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<RequestProjection>(docs);
  },
};

export const queryFavorites = {
  getById: async (id: string) => {
    const doc = await fav().findOne({ favoriteId: id });
    return cleanDoc<FavoriteProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await fav().findOne({ _id: id as any });
    return cleanDoc<FavoriteProjection>(doc);
  },

  getByUser: async (userId: string, skip = 0, limit = 100) => {
    const docs = await fav()
      .find({ userId })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<FavoriteProjection>(docs);
  },

  getByHouse: async (houseId: string, skip = 0, limit = 100) => {
    const docs = await fav()
      .find({ houseId })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<FavoriteProjection>(docs);
  },

  isFavorited: async (userId: string, houseId: string) => {
    const doc = await fav().findOne({ userId, houseId });
    return doc !== null;
  },

  getAll: async (skip = 0, limit = 100) => {
    const docs = await fav()
      .find({})
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<FavoriteProjection>(docs);
  },
};

export const queryFeedbacks = {
  getById: async (id: string) => {
    const doc = await fb().findOne({ feedbackId: id });
    return cleanDoc<FeedbackProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await fb().findOne({ _id: id as any });
    return cleanDoc<FeedbackProjection>(doc);
  },

  getByUser: async (userId: string, skip = 0, limit = 50) => {
    const docs = await fb()
      .find({ userId, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<FeedbackProjection>(docs);
  },

  getByHouse: async (houseId: string, skip = 0, limit = 50) => {
    const docs = await fb()
      .find({ houseId, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<FeedbackProjection>(docs);
  },

  getByRating: async (rating: number, skip = 0, limit = 50) => {
    const docs = await fb()
      .find({ rating, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<FeedbackProjection>(docs);
  },

  getAverageRatingByHouse: async (houseId: string) => {
    const result = await fb()
      .aggregate([
        { $match: { houseId, deleted: { $ne: true } } },
        { $group: { _id: '$houseId', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      ])
      .toArray();
    if (result.length === 0) return null;
    return { houseId: result[0]._id, averageRating: result[0].averageRating, count: result[0].count };
  },

  getAll: async (skip = 0, limit = 50) => {
    const docs = await fb()
      .find({ deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<FeedbackProjection>(docs);
  },
};

export const queryDemands = {
  getById: async (id: string) => {
    const doc = await dm().findOne({ demandId: id });
    return cleanDoc<DemandProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await dm().findOne({ _id: id as any });
    return cleanDoc<DemandProjection>(doc);
  },

  getByGuest: async (guest: string, skip = 0, limit = 50) => {
    const docs = await dm()
      .find({ guest, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<DemandProjection>(docs);
  },

  getByCategory: async (category: string, skip = 0, limit = 50) => {
    const docs = await dm()
      .find({ category, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<DemandProjection>(docs);
  },

  getByPriceRange: async (min: number, max: number, skip = 0, limit = 50) => {
    const docs = await dm()
      .find({
        minPrice: { $gte: min },
        maxPrice: { $lte: max },
        deleted: { $ne: true },
      })
      .sort({ minPrice: 1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<DemandProjection>(docs);
  },

  getByLocation: async (location: string, skip = 0, limit = 50) => {
    const docs = await dm()
      .find({ location: { $regex: location, $options: 'i' }, deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<DemandProjection>(docs);
  },

  searchByText: async (search: string, skip = 0, limit = 50) => {
    const docs = await dm()
      .find({
        $or: [
          { category: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
        deleted: { $ne: true },
      })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<DemandProjection>(docs);
  },

  getAll: async (skip = 0, limit = 50) => {
    const docs = await dm()
      .find({ deleted: { $ne: true } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<DemandProjection>(docs);
  },
};

export const queryPayouts = {
  getById: async (id: string) => {
    const doc = await po().findOne({ payoutId: id });
    return cleanDoc<PayoutProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await po().findOne({ _id: id as any });
    return cleanDoc<PayoutProjection>(doc);
  },

  getByHost: async (host: string, skip = 0, limit = 50) => {
    const docs = await po()
      .find({ host })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<PayoutProjection>(docs);
  },

  getByAgent: async (agentId: string, skip = 0, limit = 50) => {
    const docs = await po()
      .find({ agentId })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<PayoutProjection>(docs);
  },

  getByStatus: async (status: string, skip = 0, limit = 50) => {
    const docs = await po()
      .find({ status: status as any })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<PayoutProjection>(docs);
  },

  getPendingForAgent: async (agentId: string, skip = 0, limit = 50) => {
    const docs = await po()
      .find({ agentId, status: { $in: ['pending', 'approved'] } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<PayoutProjection>(docs);
  },

  getAll: async (skip = 0, limit = 50) => {
    const docs = await po()
      .find({})
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<PayoutProjection>(docs);
  },
};

export const queryAnalytics = {
  getById: async (id: string) => {
    const doc = await an().findOne({ analyticsId: id });
    return cleanDoc<AnalyticsProjection>(doc);
  },

  getByAggregateId: async (id: string) => {
    const doc = await an().findOne({ _id: id as any });
    return cleanDoc<AnalyticsProjection>(doc);
  },

  getByUser: async (userId: string, skip = 0, limit = 100) => {
    const docs = await an()
      .find({ userId })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<AnalyticsProjection>(docs);
  },

  getByEventType: async (eventType: string, skip = 0, limit = 100) => {
    const docs = await an()
      .find({ eventType })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<AnalyticsProjection>(docs);
  },

  getByTimeRange: async (from: string, to: string, skip = 0, limit = 100) => {
    const docs = await an()
      .find({ createdAt: { $gte: from, $lte: to } })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<AnalyticsProjection>(docs);
  },

  getByUserAndType: async (userId: string, eventType: string, skip = 0, limit = 100) => {
    const docs = await an()
      .find({ userId, eventType })
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<AnalyticsProjection>(docs);
  },

  aggregateByType: async (from?: string, to?: string) => {
    const match: any = {};
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = from;
      if (to) match.createdAt.$lte = to;
    }
    const pipeline: any[] = [];
    if (Object.keys(match).length > 0) pipeline.push({ $match: match });
    pipeline.push({ $group: { _id: '$eventType', count: { $sum: 1 } } });
    pipeline.push({ $sort: { count: -1 } as any });
    return an().aggregate(pipeline).toArray();
  },

  countByEvent: async (eventType: string, from?: string, to?: string) => {
    const match: any = { eventType };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = from;
      if (to) match.createdAt.$lte = to;
    }
    return an().countDocuments(match);
  },

  getAll: async (skip = 0, limit = 100) => {
    const docs = await an()
      .find({})
      .sort({ createdAt: -1, _id: -1 } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
    return cleanDocs<AnalyticsProjection>(docs);
  },
};
