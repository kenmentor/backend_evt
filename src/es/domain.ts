import { createDomain } from 'evtstore';
import { getESProvider } from './provider';
import { userAgg } from './aggregates/user';
import { tourAgg } from './aggregates/tour';
import { bookingAgg } from './aggregates/booking';
import { resourceAgg } from './aggregates/resource';
import { paymentAgg } from './aggregates/payment';
import { conversationAgg, messageAgg } from './aggregates/chat';
import { requestAgg } from './aggregates/request';
import { favoriteAgg } from './aggregates/favorite';
import { feedbackAgg } from './aggregates/feedback';
import { demandAgg } from './aggregates/demand';
import { payoutAgg } from './aggregates/payout';
import { analyticsAgg } from './aggregates/analytics';

export let domain: any = null;
export let createHandler: any = null;

export function initDomain() {
  if (domain && createHandler) return { domain, createHandler };

  const provider = getESProvider();

  const result = createDomain(
    { provider },
    {
      users: userAgg,
      tours: tourAgg,
      bookings: bookingAgg,
      resources: resourceAgg,
      payments: paymentAgg,
      conversations: conversationAgg,
      messages: messageAgg,
      requests: requestAgg,
      favorites: favoriteAgg,
      feedbacks: feedbackAgg,
      demands: demandAgg,
      payouts: payoutAgg,
      analytics: analyticsAgg,
    }
  );

  domain = result.domain;
  createHandler = result.createHandler;

  console.log('✅ ES Domain initialized with all aggregates');
  return { domain, createHandler };
}

export function getDomain() {
  if (!domain) {
    throw new Error('Domain not initialized. Call initDomain() first.');
  }
  return domain;
}

export function getCreateHandler() {
  if (!createHandler) {
    throw new Error('Domain not initialized. Call initDomain() first.');
  }
  return createHandler;
}