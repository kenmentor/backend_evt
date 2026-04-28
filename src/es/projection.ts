import { getProjectionDb, projCol } from './projection-shared';
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

let handlers: Array<{ start: () => void; stop: () => void; runOnce: () => Promise<void> }> = [];

export const projectionHandlers: Record<string, { runOnce: () => Promise<void> }> = {};

function timestamp(meta: any): string {
  return meta.timestamp instanceof Date
    ? meta.timestamp.toISOString()
    : meta.timestamp
      ? new Date(meta.timestamp).toISOString()
      : new Date().toISOString();
}

export async function ensureProjectionIndexes() {
  const db = getProjectionDb();
  const ensure = async (collection: string, index: any, options: any = {}) => {
    try {
      await db.collection(collection).createIndex(index, { background: true, ...options });
    } catch (_) {}
  };

  await Promise.all([
    ensure('users', { email: 1 }, { unique: true, sparse: true }),
    ensure('users', { phoneNumber: 1 }, { unique: true, sparse: true }),
    ensure('users', { role: 1 }),
    ensure('users', { disabled: 1, deleted: 1 }),
    ensure('users', { pioneer: 1 }),
    ensure('users', { createdAt: -1 }),

    ensure('tours', { guestId: 1, status: 1 }),
    ensure('tours', { hostId: 1, status: 1 }),
    ensure('tours', { agentId: 1 }),
    ensure('tours', { propertyId: 1 }),
    ensure('tours', { scheduledDate: 1 }),
    ensure('tours', { status: 1 }),
    ensure('tours', { createdAt: -1 }),

    ensure('bookings', { host: 1, status: 1 }),
    ensure('bookings', { guest: 1, status: 1 }),
    ensure('bookings', { house: 1 }),
    ensure('bookings', { status: 1 }),
    ensure('bookings', { paymentId: 1 }),
    ensure('bookings', { checkIn: 1, checkOut: 1 }),
    ensure('bookings', { createdAt: -1 }),

    ensure('resources', { host: 1 }),
    ensure('resources', { avaliable: 1, state: 1 }),
    ensure('resources', { category: 1 }),
    ensure('resources', { price: 1 }),
    ensure('resources', { state: 1, lga: 1 }),
    ensure('resources', { bedrooms: 1 }),
    ensure('resources', { views: -1 }),
    ensure('resources', { createdAt: -1 }),
    ensure(
      'resources',
      { title: 'text', description: 'text', location: 'text' },
      { name: 'resources_text_search' }
    ),

    ensure('payments', { host: 1, status: 1 }),
    ensure('payments', { guest: 1 }),
    ensure('payments', { house: 1 }),
    ensure('payments', { status: 1 }),
    ensure('payments', { paymentRef: 1 }, { unique: true, sparse: true }),
    ensure('payments', { createdAt: -1 }),

    ensure('conversations', { participants: 1 }),
    ensure('conversations', { 'lastMessage.timestamp': -1 }),
    ensure('conversations', { updatedAt: -1 }),
    ensure('conversations', { propertyContext: 1 }),

    ensure('messages', { conversationId: 1, createdAt: -1 }),
    ensure('messages', { senderId: 1 }),
    ensure('messages', { receiverId: 1, read: 1 }),
    ensure('messages', { deleted: 1 }),

    ensure('requests', { host: 1, status: 1 }),
    ensure('requests', { guest: 1, status: 1 }),
    ensure('requests', { house: 1 }),
    ensure('requests', { status: 1 }),
    ensure('requests', { createdAt: -1 }),

    ensure('favorites', { userId: 1, houseId: 1 }, { unique: true }),
    ensure('favorites', { userId: 1 }),
    ensure('favorites', { houseId: 1 }),

    ensure('feedbacks', { userId: 1, houseId: 1 }, { unique: true, sparse: true }),
    ensure('feedbacks', { houseId: 1, deleted: 1 }),
    ensure('feedbacks', { userId: 1 }),
    ensure('feedbacks', { rating: 1 }),
    ensure('feedbacks', { createdAt: -1 }),

    ensure('demands', { guest: 1 }),
    ensure('demands', { category: 1 }),
    ensure('demands', { minPrice: 1, maxPrice: 1 }),
    ensure('demands', { location: 1 }),
    ensure('demands', { createdAt: -1 }),

    ensure('payouts', { host: 1 }),
    ensure('payouts', { agentId: 1 }),
    ensure('payouts', { status: 1 }),
    ensure('payouts', { createdAt: -1 }),

    ensure('analytics', { createdAt: -1 }),
    ensure('analytics', { eventType: 1, createdAt: -1 }),
    ensure('analytics', { userId: 1, createdAt: -1 }),
    ensure('analytics', { eventType: 1, userId: 1 }),
  ]);

  console.log('✅ Projection indexes ensured');
}

export function createUserProjection(createHandler: any) {
  const handler = createHandler('users-projection', ['users']);

  handler.handle('users', 'userCreated', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    await projCol<UserProjection>('users').replaceOne(
      { userId: id },
      {
        _id: id,
        userId: id,
        email: evt.email,
        userName: evt.userName,
        phoneNumber: evt.phoneNumber,
        dateOfBirth: evt.dateOfBirth,
        verifiedEmail: false,
        verifiedNIN: false,
        adminVerified: false,
        role: 'USER',
        rank: 1,
        profileImage: '',
        pioneer: false,
        disabled: false,
        deleted: false,
        lastLogin: undefined,
        createdAt: ts,
        updatedAt: ts,
      } as any,
      { upsert: true }
    );
  });

  handler.handle('users', 'userEmailVerified', async (id: string, _evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { verifiedEmail: true, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userNINVerified', async (id: string, _evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { verifiedNIN: true, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userAdminVerified', async (id: string, _evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { adminVerified: true, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userProfileImageUpdated', async (id: string, evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { profileImage: evt.profileImage, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userNameChanged', async (id: string, evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { userName: evt.userName, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userPhoneNumberChanged', async (id: string, evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { phoneNumber: evt.phoneNumber, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userEmailChanged', async (id: string, evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { email: evt.email, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userRoleChanged', async (id: string, evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { role: evt.role, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userRankChanged', async (id: string, evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { rank: evt.rank, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userPioneerGranted', async (id: string, _evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { pioneer: true, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userDisabled', async (id: string, _evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { disabled: true, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userDeleted', async (id: string, _evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { disabled: true, deleted: true, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('users', 'userLoggedIn', async (id: string, _evt: any, meta: any) => {
    await projCol<UserProjection>('users').updateOne(
      { _id: id as any },
      { $set: { lastLogin: timestamp(meta), updatedAt: timestamp(meta) } }
    );
  });

  return handler;
}

export function createTourProjection(createHandler: any) {
  const handler = createHandler('tours-projection', ['tours']);

  handler.handle('tours', 'tourRequested', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    await projCol<TourProjection>('tours').replaceOne(
      { tourId: id },
      {
        _id: id as any,
        tourId: id,
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
        createdAt: ts,
        updatedAt: ts,
      },
      { upsert: true }
    );
  });

  handler.handle('tours', 'tourAgentAssigned', async (id: string, evt: any, meta: any) => {
    await projCol<TourProjection>('tours').updateOne(
      { _id: id as any },
      { $set: { agentId: evt.agentId, agentName: evt.agentName, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('tours', 'tourRescheduled', async (id: string, evt: any, meta: any) => {
    const set: any = { scheduledDate: evt.scheduledDate, updatedAt: timestamp(meta) };
    if (evt.scheduledTime !== undefined) set.scheduledTime = evt.scheduledTime;
    await projCol<TourProjection>('tours').updateOne({ _id: id as any }, { $set: set });
  });

  handler.handle('tours', 'tourCompleted', async (id: string, _evt: any, meta: any) => {
    await projCol<TourProjection>('tours').updateOne(
      { _id: id as any },
      { $set: { status: 'completed', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('tours', 'tourCancelled', async (id: string, _evt: any, meta: any) => {
    await projCol<TourProjection>('tours').updateOne(
      { _id: id as any },
      { $set: { status: 'cancelled', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('tours', 'tourNotesAdded', async (id: string, evt: any, meta: any) => {
    await projCol<TourProjection>('tours').updateOne(
      { _id: id as any },
      { $set: { notes: evt.notes, updatedAt: timestamp(meta) } }
    );
  });

  return handler;
}

export function createBookingProjection(createHandler: any) {
  const handler = createHandler('bookings-projection', ['bookings']);

  handler.handle('bookings', 'bookingCreated', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + 3);
    await projCol<BookingProjection>('bookings').replaceOne(
      { bookingId: id },
      {
        _id: id as any,
        bookingId: id,
        host: evt.host,
        guest: evt.guest,
        house: evt.house,
        amount: evt.amount,
        status: 'pending',
        paymentId: evt.paymentId || '',
        checkIn: evt.checkIn,
        checkOut: evt.checkOut,
        platformFee: evt.platformFee,
        expiredDate: expiredDate.toISOString(),
        createdAt: ts,
        updatedAt: ts,
      },
      { upsert: true }
    );
  });

  handler.handle('bookings', 'bookingConfirmed', async (id: string, _evt: any, meta: any) => {
    await projCol<BookingProjection>('bookings').updateOne(
      { _id: id as any },
      { $set: { status: 'confirmed', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('bookings', 'bookingCancelled', async (id: string, _evt: any, meta: any) => {
    await projCol<BookingProjection>('bookings').updateOne(
      { _id: id as any },
      { $set: { status: 'cancelled', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('bookings', 'bookingCompleted', async (id: string, _evt: any, meta: any) => {
    await projCol<BookingProjection>('bookings').updateOne(
      { _id: id as any },
      { $set: { status: 'completed', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('bookings', 'bookingExpired', async (id: string, _evt: any, meta: any) => {
    await projCol<BookingProjection>('bookings').updateOne(
      { _id: id as any },
      { $set: { status: 'expired', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('bookings', 'bookingPaymentUpdated', async (id: string, evt: any, meta: any) => {
    await projCol<BookingProjection>('bookings').updateOne(
      { _id: id as any },
      { $set: { paymentId: evt.paymentId, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('bookings', 'bookingDatesChanged', async (id: string, evt: any, meta: any) => {
    await projCol<BookingProjection>('bookings').updateOne(
      { _id: id as any },
      { $set: { checkIn: evt.checkIn, checkOut: evt.checkOut, updatedAt: timestamp(meta) } }
    );
  });

  return handler;
}

export function createResourceProjection(createHandler: any) {
  const handler = createHandler('resources-projection', ['resources']);

  handler.handle('resources', 'resourceCreated', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    await projCol<ResourceProjection>('resources').replaceOne(
      { resourceId: id },
      {
        _id: id as any,
        resourceId: id,
        host: evt.host,
        title: evt.title,
        description: evt.description || '',
        houseType: evt.houseType || '',
        category: evt.category || '',
        price: evt.price || '',
        address: evt.address || '',
        state: evt.state || '',
        lga: evt.lga || '',
        location: evt.location || '',
        bedrooms: evt.bedrooms || 1,
        bathrooms: evt.bathrooms || 1,
        furnishing: evt.furnishing || '',
        amenities: evt.amenities || [],
        images: evt.images || [],
        video: evt.video || '',
        thumbnail: evt.thumbnail || '',
        views: 0,
        avaliable: true,
        deleted: false,
        createdAt: ts,
        updatedAt: ts,
      },
      { upsert: true }
    );
  });

  handler.handle('resources', 'resourceLocationUpdated', async (id: string, evt: any, meta: any) => {
    const set: any = { updatedAt: timestamp(meta) };
    if (evt.address !== undefined) set.address = evt.address;
    if (evt.state !== undefined) set.state = evt.state;
    if (evt.lga !== undefined) set.lga = evt.lga;
    if (evt.location !== undefined) set.location = evt.location;
    await projCol<ResourceProjection>('resources').updateOne({ _id: id as any }, { $set: set });
  });

  handler.handle('resources', 'resourceDetailsUpdated', async (id: string, evt: any, meta: any) => {
    const set: any = { updatedAt: timestamp(meta) };
    if (evt.bedrooms !== undefined) set.bedrooms = evt.bedrooms;
    if (evt.bathrooms !== undefined) set.bathrooms = evt.bathrooms;
    if (evt.furnishing !== undefined) set.furnishing = evt.furnishing;
    await projCol<ResourceProjection>('resources').updateOne({ _id: id as any }, { $set: set });
  });

  handler.handle(
    'resources',
    'resourceAmenitiesUpdated',
    async (id: string, evt: any, meta: any) => {
      await projCol<ResourceProjection>('resources').updateOne(
        { _id: id as any },
        { $set: { amenities: evt.amenities, updatedAt: timestamp(meta) } }
      );
    }
  );

  handler.handle('resources', 'resourceMediaAdded', async (id: string, evt: any, meta: any) => {
    const set: any = { updatedAt: timestamp(meta) };
    if (evt.images && evt.images.length > 0) {
      const current = await projCol<ResourceProjection>('resources').findOne({ _id: id as any });
      set.images = [...(current?.images || []), ...evt.images];
    }
    if (evt.video !== undefined) set.video = evt.video;
    if (evt.thumbnail !== undefined) set.thumbnail = evt.thumbnail;
    await projCol<ResourceProjection>('resources').updateOne({ _id: id as any }, { $set: set });
  });

  handler.handle('resources', 'resourceMediaRemoved', async (id: string, evt: any, meta: any) => {
    const current = await projCol<ResourceProjection>('resources').findOne({ _id: id as any });
    if (!current) return;
    const filtered = current.images.filter((img) => !evt.imageUrls.includes(img.url));
    await projCol<ResourceProjection>('resources').updateOne(
      { _id: id as any },
      { $set: { images: filtered, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('resources', 'resourcePriceUpdated', async (id: string, evt: any, meta: any) => {
    await projCol<ResourceProjection>('resources').updateOne(
      { _id: id as any },
      { $set: { price: evt.price, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle(
    'resources',
    'resourceAvailabilityChanged',
    async (id: string, evt: any, meta: any) => {
      await projCol<ResourceProjection>('resources').updateOne(
        { _id: id as any },
        { $set: { avaliable: evt.avaliable, updatedAt: timestamp(meta) } }
      );
    }
  );

  handler.handle('resources', 'resourceViewed', async (id: string, _evt: any, meta: any) => {
    await projCol<ResourceProjection>('resources').updateOne(
      { _id: id as any },
      { $inc: { views: 1 }, $set: { updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('resources', 'resourceDeleted', async (id: string, _evt: any, meta: any) => {
    await projCol<ResourceProjection>('resources').updateOne(
      { _id: id as any },
      { $set: { avaliable: false, deleted: true, updatedAt: timestamp(meta) } }
    );
  });

  return handler;
}

export function createPaymentProjection(createHandler: any) {
  const handler = createHandler('payments-projection', ['payments']);

  handler.handle('payments', 'paymentInitiated', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    await projCol<PaymentProjection>('payments').replaceOne(
      { paymentId: id },
      {
        _id: id as any,
        paymentId: id,
        host: evt.host,
        guest: evt.guest,
        house: evt.house,
        note: evt.note || '',
        amount: evt.amount,
        method: evt.method || '',
        refund: 0,
        status: 'pending',
        paymentRef: evt.paymentRef,
        createdAt: ts,
        updatedAt: ts,
      },
      { upsert: true }
    );
  });

  handler.handle('payments', 'paymentCompleted', async (id: string, _evt: any, meta: any) => {
    await projCol<PaymentProjection>('payments').updateOne(
      { _id: id as any },
      { $set: { status: 'completed', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('payments', 'paymentFailed', async (id: string, _evt: any, meta: any) => {
    await projCol<PaymentProjection>('payments').updateOne(
      { _id: id as any },
      { $set: { status: 'failed', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('payments', 'paymentRefunded', async (id: string, evt: any, meta: any) => {
    await projCol<PaymentProjection>('payments').updateOne(
      { _id: id as any },
      { $set: { status: 'refunded', refund: evt.refundAmount, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('payments', 'paymentRefundRequested', async (id: string, _evt: any, meta: any) => {
    await projCol<PaymentProjection>('payments').updateOne(
      { _id: id as any },
      { $set: { status: 'refund_requested', updatedAt: timestamp(meta) } }
    );
  });

  return handler;
}

export function createConversationProjection(createHandler: any) {
  const handler = createHandler('conversations-projection', ['conversations']);

  handler.handle(
    'conversations',
    'conversationCreated',
    async (id: string, evt: any, meta: any) => {
      const ts = timestamp(meta);
      const unreadCount: Record<string, number> = {};
      evt.participants.forEach((p: string) => {
        unreadCount[p] = 0;
      });
      await projCol<ConversationProjection>('conversations').replaceOne(
        { conversationId: id },
        {
          _id: id as any,
          conversationId: id,
          participants: evt.participants,
          participantNames: evt.participantNames,
          participantAvatars: evt.participantAvatars,
          propertyContext: evt.propertyContext || '',
          lastMessage: null,
          unreadCount,
          createdAt: ts,
          updatedAt: ts,
        },
        { upsert: true }
      );
    }
  );

  handler.handle(
    'conversations',
    'conversationParticipantAdded',
    async (id: string, evt: any, meta: any) => {
      await projCol<ConversationProjection>('conversations').updateOne(
        { _id: id as any },
        {
          $addToSet: { participants: evt.participantId },
          $set: {
            [`participantNames.${evt.participantId}`]: evt.participantName,
            [`unreadCount.${evt.participantId}`]: 0,
            updatedAt: timestamp(meta),
          },
        }
      );
    }
  );

  handler.handle(
    'conversations',
    'conversationMessageSent',
    async (id: string, evt: any, meta: any) => {
      const convo = await projCol<ConversationProjection>('conversations').findOne({
        _id: id as any,
      });
      if (!convo) return;
      const newUnread: Record<string, number> = { ...convo.unreadCount };
      for (const p of convo.participants) {
        if (p !== evt.senderId) {
          newUnread[p] = (newUnread[p] || 0) + 1;
        }
      }
      await projCol<ConversationProjection>('conversations').updateOne(
        { _id: id as any },
        {
          $set: {
            lastMessage: {
              content: evt.content,
              senderId: evt.senderId,
              timestamp: timestamp(meta),
            },
            unreadCount: newUnread,
            updatedAt: timestamp(meta),
          },
        }
      );
    }
  );

  handler.handle(
    'conversations',
    'conversationMessageRead',
    async (id: string, evt: any, meta: any) => {
      await projCol<ConversationProjection>('conversations').updateOne(
        { _id: id as any },
        {
          $set: {
            [`unreadCount.${evt.userId}`]: 0,
            updatedAt: timestamp(meta),
          },
        }
      );
    }
  );

  handler.handle(
    'conversations',
    'conversationPropertyContextUpdated',
    async (id: string, evt: any, meta: any) => {
      await projCol<ConversationProjection>('conversations').updateOne(
        { _id: id as any },
        { $set: { propertyContext: evt.propertyContext, updatedAt: timestamp(meta) } }
      );
    }
  );

  return handler;
}

export function createMessageProjection(createHandler: any) {
  const handler = createHandler('messages-projection', ['messages']);

  handler.handle('messages', 'messageSent', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    await projCol<MessageProjection>('messages').replaceOne(
      { messageId: id },
      {
        _id: id as any,
        messageId: id,
        conversationId: evt.conversationId,
        senderId: evt.senderId,
        receiverId: evt.receiverId,
        content: evt.content,
        read: false,
        deleted: false,
        createdAt: ts,
        updatedAt: ts,
      },
      { upsert: true }
    );
  });

  handler.handle('messages', 'messageRead', async (id: string, _evt: any, meta: any) => {
    await projCol<MessageProjection>('messages').updateOne(
      { _id: id as any },
      { $set: { read: true, updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('messages', 'messageDeleted', async (id: string, _evt: any, meta: any) => {
    await projCol<MessageProjection>('messages').updateOne(
      { _id: id as any },
      { $set: { content: '[deleted]', deleted: true, updatedAt: timestamp(meta) } }
    );
  });

  return handler;
}

export function createRequestProjection(createHandler: any) {
  const handler = createHandler('requests-projection', ['requests']);

  handler.handle('requests', 'requestCreated', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    await projCol<RequestProjection>('requests').replaceOne(
      { requestId: id },
      {
        _id: id as any,
        requestId: id,
        guest: evt.guest,
        host: evt.host,
        house: evt.house,
        checkIn: evt.checkIn,
        checkOut: evt.checkOut,
        guests: evt.guests,
        totalPrice: evt.totalPrice,
        note: evt.note || '',
        status: 'pending',
        createdAt: ts,
        updatedAt: ts,
      },
      { upsert: true }
    );
  });

  handler.handle('requests', 'requestApproved', async (id: string, _evt: any, meta: any) => {
    await projCol<RequestProjection>('requests').updateOne(
      { _id: id as any },
      { $set: { status: 'approved', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('requests', 'requestRejected', async (id: string, _evt: any, meta: any) => {
    await projCol<RequestProjection>('requests').updateOne(
      { _id: id as any },
      { $set: { status: 'rejected', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('requests', 'requestCancelled', async (id: string, _evt: any, meta: any) => {
    await projCol<RequestProjection>('requests').updateOne(
      { _id: id as any },
      { $set: { status: 'cancelled', updatedAt: timestamp(meta) } }
    );
  });

  return handler;
}

export function createFavoriteProjection(createHandler: any) {
  const handler = createHandler('favorites-projection', ['favorites']);

  handler.handle('favorites', 'favoriteAdded', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    await projCol<FavoriteProjection>('favorites').replaceOne(
      { favoriteId: id },
      {
        _id: id as any,
        favoriteId: id,
        userId: evt.userId,
        houseId: evt.houseId,
        createdAt: ts,
        updatedAt: ts,
      },
      { upsert: true }
    );
  });

  handler.handle('favorites', 'favoriteRemoved', async (id: string, _evt: any, _meta: any) => {
    await projCol<FavoriteProjection>('favorites').deleteOne({ _id: id as any });
  });

  return handler;
}

export function createFeedbackProjection(createHandler: any) {
  const handler = createHandler('feedbacks-projection', ['feedbacks']);

  handler.handle('feedbacks', 'feedbackCreated', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    await projCol<FeedbackProjection>('feedbacks').replaceOne(
      { feedbackId: id },
      {
        _id: id as any,
        feedbackId: id,
        userId: evt.userId,
        houseId: evt.houseId,
        rating: evt.rating,
        comment: evt.comment,
        deleted: false,
        createdAt: ts,
        updatedAt: ts,
      },
      { upsert: true }
    );
  });

  handler.handle('feedbacks', 'feedbackUpdated', async (id: string, evt: any, meta: any) => {
    const set: any = { updatedAt: timestamp(meta) };
    if (evt.rating !== undefined) set.rating = evt.rating;
    if (evt.comment !== undefined) set.comment = evt.comment;
    await projCol<FeedbackProjection>('feedbacks').updateOne({ _id: id as any }, { $set: set });
  });

  handler.handle('feedbacks', 'feedbackDeleted', async (id: string, _evt: any, meta: any) => {
    await projCol<FeedbackProjection>('feedbacks').updateOne(
      { _id: id as any },
      { $set: { deleted: true, updatedAt: timestamp(meta) } }
    );
  });

  return handler;
}

export function createDemandProjection(createHandler: any) {
  const handler = createHandler('demands-projection', ['demands']);

  handler.handle('demands', 'demandCreated', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    await projCol<DemandProjection>('demands').replaceOne(
      { demandId: id },
      {
        _id: id as any,
        demandId: id,
        guest: evt.guest,
        category: evt.category,
        minPrice: evt.minPrice || 0,
        maxPrice: evt.maxPrice || 0,
        location: evt.location || '',
        description: evt.description || '',
        deleted: false,
        createdAt: ts,
        updatedAt: ts,
      },
      { upsert: true }
    );
  });

  handler.handle('demands', 'demandUpdated', async (id: string, evt: any, meta: any) => {
    const set: any = { updatedAt: timestamp(meta) };
    if (evt.category !== undefined) set.category = evt.category;
    if (evt.minPrice !== undefined) set.minPrice = evt.minPrice;
    if (evt.maxPrice !== undefined) set.maxPrice = evt.maxPrice;
    if (evt.location !== undefined) set.location = evt.location;
    if (evt.description !== undefined) set.description = evt.description;
    await projCol<DemandProjection>('demands').updateOne({ _id: id as any }, { $set: set });
  });

  handler.handle('demands', 'demandDeleted', async (id: string, _evt: any, meta: any) => {
    await projCol<DemandProjection>('demands').updateOne(
      { _id: id as any },
      { $set: { deleted: true, updatedAt: timestamp(meta) } }
    );
  });

  return handler;
}

export function createPayoutProjection(createHandler: any) {
  const handler = createHandler('payouts-projection', ['payouts']);

  handler.handle('payouts', 'payoutCreated', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    await projCol<PayoutProjection>('payouts').replaceOne(
      { payoutId: id },
      {
        _id: id as any,
        payoutId: id,
        host: evt.host,
        agentId: evt.agentId,
        amount: evt.amount,
        bankName: evt.bankName || '',
        accountNumber: evt.accountNumber || '',
        accountName: evt.accountName || '',
        status: 'pending',
        transactionRef: '',
        createdAt: ts,
        updatedAt: ts,
      },
      { upsert: true }
    );
  });

  handler.handle('payouts', 'payoutApproved', async (id: string, _evt: any, meta: any) => {
    await projCol<PayoutProjection>('payouts').updateOne(
      { _id: id as any },
      { $set: { status: 'approved', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('payouts', 'payoutRejected', async (id: string, _evt: any, meta: any) => {
    await projCol<PayoutProjection>('payouts').updateOne(
      { _id: id as any },
      { $set: { status: 'rejected', updatedAt: timestamp(meta) } }
    );
  });

  handler.handle('payouts', 'payoutProcessed', async (id: string, evt: any, meta: any) => {
    await projCol<PayoutProjection>('payouts').updateOne(
      { _id: id as any },
      {
        $set: {
          status: 'processed',
          transactionRef: evt.transactionRef || '',
          updatedAt: timestamp(meta),
        },
      }
    );
  });

  return handler;
}

export function createAnalyticsProjection(createHandler: any) {
  const handler = createHandler('analytics-projection', ['analytics']);

  handler.handle('analytics', 'analyticsRecorded', async (id: string, evt: any, meta: any) => {
    const ts = timestamp(meta);
    await projCol<AnalyticsProjection>('analytics').replaceOne(
      { analyticsId: id },
      {
        _id: id as any,
        analyticsId: id,
        userId: evt.userId,
        eventType: evt.eventType,
        metadata: evt.metadata || {},
        action: evt.action,
        sessionId: evt.sessionId,
        ipAddress: evt.ipAddress,
        userAgent: evt.userAgent,
        referrer: evt.referrer,
        createdAt: ts,
      },
      { upsert: true }
    );
  });

  return handler;
}

export function createAllProjections(createHandler: any) {
  const userH = createUserProjection(createHandler);
  const tourH = createTourProjection(createHandler);
  const bookingH = createBookingProjection(createHandler);
  const resourceH = createResourceProjection(createHandler);
  const paymentH = createPaymentProjection(createHandler);
  const conversationH = createConversationProjection(createHandler);
  const messageH = createMessageProjection(createHandler);
  const requestH = createRequestProjection(createHandler);
  const favoriteH = createFavoriteProjection(createHandler);
  const feedbackH = createFeedbackProjection(createHandler);
  const demandH = createDemandProjection(createHandler);
  const payoutH = createPayoutProjection(createHandler);
  const analyticsH = createAnalyticsProjection(createHandler);
  const all = [
    userH, tourH, bookingH, resourceH, paymentH,
    conversationH, messageH, requestH, favoriteH,
    feedbackH, demandH, payoutH, analyticsH,
  ];
  handlers = all;
  projectionHandlers.users = userH;
  projectionHandlers.tours = tourH;
  projectionHandlers.bookings = bookingH;
  projectionHandlers.resources = resourceH;
  projectionHandlers.payments = paymentH;
  projectionHandlers.conversations = conversationH;
  projectionHandlers.messages = messageH;
  projectionHandlers.requests = requestH;
  projectionHandlers.favorites = favoriteH;
  projectionHandlers.feedbacks = feedbackH;
  projectionHandlers.demands = demandH;
  projectionHandlers.payouts = payoutH;
  projectionHandlers.analytics = analyticsH;
  return all;
}

export function startProjections() {
  for (const h of handlers) {
    h.start();
  }
  console.log(`✅ Started ${handlers.length} projection handlers`);
}

export function stopProjections() {
  for (const h of handlers) {
    h.stop();
  }
  console.log('🛑 Stopped all projection handlers');
}
