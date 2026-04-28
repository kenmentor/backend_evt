import type { Db, Collection } from 'mongodb';

const PROJ_PREFIX = '';

let db: Db | null = null;

export function setProjectionDb(database: Db) {
  db = database;
}

export function getProjectionDb(): Db {
  if (!db) throw new Error('Projection DB not set. Call setProjectionDb() first.');
  return db;
}

export function projCol<T extends object>(name: string): Collection<any> {
  return getProjectionDb().collection<any>(`${PROJ_PREFIX}${name}`);
}

export interface UserProjection {
  userId: string;
  email: string;
  userName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  verifiedEmail: boolean;
  verifiedNIN: boolean;
  adminVerified: boolean;
  role: string;
  rank: number;
  profileImage: string;
  pioneer: boolean;
  disabled: boolean;
  deleted: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TourProjection {
  tourId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface BookingProjection {
  bookingId: string;
  host: string;
  guest: string;
  house: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  paymentId: string;
  checkIn: string;
  checkOut: string;
  platformFee: number;
  expiredDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceProjection {
  resourceId: string;
  host: string;
  title: string;
  description: string;
  houseType: string;
  category: string;
  price: string;
  address: string;
  state: string;
  lga: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  furnishing: string;
  amenities: string[];
  images: Array<{ url: string; publicId: string }>;
  video: string;
  thumbnail: string;
  views: number;
  avaliable: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProjection {
  paymentId: string;
  host: string;
  guest: string;
  house: string;
  note: string;
  amount: number;
  method: string;
  refund: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'refund_requested';
  paymentRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationProjection {
  conversationId: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  propertyContext: string;
  lastMessage: { content: string; senderId: string; timestamp: string } | null;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface MessageProjection {
  messageId: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RequestProjection {
  requestId: string;
  guest: string;
  host: string;
  house: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  note: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteProjection {
  favoriteId: string;
  userId: string;
  houseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackProjection {
  feedbackId: string;
  userId: string;
  houseId: string;
  rating: number;
  comment: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DemandProjection {
  demandId: string;
  guest: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  description: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutProjection {
  payoutId: string;
  host: string;
  agentId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  transactionRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsProjection {
  analyticsId: string;
  userId: string;
  eventType: string;
  metadata: Record<string, unknown>;
  action?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: string;
}
