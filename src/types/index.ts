import type { Request, Response, NextFunction } from 'express';
import type { Collection, Document, Filter, FindOptions, WithId } from 'mongodb';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

export type ApiResponse<T = any> = {
  data: T;
  error: Record<string, any>;
  status: number;
  message: string;
  ok: boolean;
};

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export type RepoCollection = Collection<Document>;

export interface RepoInterface {
  find(query?: Filter<Document>): Promise<WithId<Document>[]>;
  findOne(query: Filter<Document>): Promise<WithId<Document> | null>;
  findById(id: string): Promise<WithId<Document> | null>;
  findAll(): Promise<WithId<Document>[]>;
  create(data: any): Promise<WithId<Document> | null>;
  update(key: string, data: any): Promise<WithId<Document> | null>;
  delete(id: string): Promise<WithId<Document> | null>;
  commands?: Record<string, (id: string, data?: any) => Promise<any>>;
  handler?: { runOnce(): Promise<void> };
  getAggregate?(id: string): Promise<any>;
}

// Re-export domain types from es/
export type { UserEvt, UserAgg, UserCmd } from '../es/types/user';
export type { ResourceEvt, ResourceAgg, ResourceCmd } from '../es/types/resource';
export type { BookingEvt, BookingAgg, BookingCmd } from '../es/types/booking';
export type { PaymentEvt, PaymentAgg, PaymentCmd } from '../es/types/payment';
export type { ConversationEvt, ConversationAgg, ConversationCmd, MessageEvt, MessageAgg, MessageCmd } from '../es/types/chat';
export type { TourEvt, TourAgg, TourCmd } from '../es/types/tour';
