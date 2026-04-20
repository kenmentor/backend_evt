const { createDomain } = require('evtstore');
const { getProvider } = require('./provider');
const { userAgg } = require('./aggregates/user');
const { tourAgg } = require('./aggregates/tour');
const { bookingAgg } = require('./aggregates/booking');
const { resourceAgg } = require('./aggregates/resource');
const { paymentAgg } = require('./aggregates/payment');
const { conversationAgg, messageAgg } = require('./aggregates/chat');
const { requestAgg } = require('./aggregates/request');
const { favoriteAgg } = require('./aggregates/favorite');
const { feedbackAgg } = require('./aggregates/feedback');
const { demandAgg } = require('./aggregates/demand');
const { payoutAgg } = require('./aggregates/payout');
const { analyticsAgg } = require('./aggregates/analytics');

let domain = null;
let createHandler = null;

function initDomain() {
  if (domain && createHandler) return { domain, createHandler };

  const provider = getProvider();

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

function getDomain() {
  if (!domain) {
    throw new Error('Domain not initialized. Call initDomain() first.');
  }
  return domain;
}

function getCreateHandler() {
  if (!createHandler) {
    throw new Error('Domain not initialized. Call initDomain() first.');
  }
  return createHandler;
}

module.exports = {
  initDomain,
  getDomain,
  getCreateHandler,
  domain: null,
  createHandler: null,
};