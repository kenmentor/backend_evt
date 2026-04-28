## 1. Align types and aggregates with old system event shapes

- [x] 1.1 Review and update `es/types/user.ts` — verify event shapes match old `user-event-repository.ts` commands
- [x] 1.2 Review and update `es/types/booking.ts` — verify event shapes, add `expiredDate` to `BookingAgg` if missing
- [x] 1.3 Review and update `es/types/resource.ts` — verify all 17 create fields + 9 update events match old shapes
- [x] 1.4 Review and update `es/types/payment.ts` — verify fields match old payment commands
- [x] 1.5 Review and update `es/types/chat.ts` — verify conversation + message event shapes
- [x] 1.6 Review and update `es/types/tour.ts` — verify fields match old tour commands
- [x] 1.7 Review and update `es/types/request.ts` — align `requestApproved` vs old `requestAccepted`
- [x] 1.8 Review and update `es/types/favorite.ts` — verify match
- [x] 1.9 Review and update `es/types/feedback.ts` — verify `feedbackCreated` matches old `feedbackSubmitted`
- [x] 1.10 Review and update `es/types/demand.ts` — verify fields match old demand commands (guest, description, state, price, type, category)
- [x] 1.11 Review and update `es/types/payout.ts` — align `payoutProcessed` vs old `payoutPaid`
- [x] 1.12 Review and update `es/types/analytics.ts` — expand to carry old fields (`action`, `sessionId`, `ipAddress`, `userAgent`, `referrer`) as optional
- [x] 1.13 Verify `es/aggregates/*.ts` fold functions produce correct state for all event types

## 2. Update projection handlers for dual-key + missing fields

- [x] 2.1 Add `expiredDate` to `BookingProjection` in `es/projection-shared.ts`
- [x] 2.2 Add any missing fields per aggregate to projection interfaces based on old event-repo handler analysis
- [x] 2.3 Update `createUserProjection` — dual-key (`_id` + `userId`), all 15 event handlers
- [x] 2.4 Update `createTourProjection` — dual-key (`_id` + `tourId`), all 6 event handlers
- [x] 2.5 Update `createBookingProjection` — dual-key (`_id` + `bookingId`), add `expiredDate`, all 7 event handlers
- [x] 2.6 Update `createResourceProjection` — dual-key (`_id` + `resourceId`), all 10 event handlers
- [x] 2.7 Update `createPaymentProjection` — dual-key (`_id` + `paymentId`), all 5 event handlers
- [x] 2.8 Update `createConversationProjection` — dual-key (`_id` + `conversationId`), all 5 event handlers
- [x] 2.9 Update `createMessageProjection` — dual-key (`_id` + `messageId`), all 3 event handlers
- [x] 2.10 Update `createRequestProjection` — dual-key (`_id` + `requestId`), all 4 event handlers
- [x] 2.11 Update `createFavoriteProjection` — dual-key (`_id` + `favoriteId`), both event handlers
- [x] 2.12 Update `createFeedbackProjection` — dual-key (`_id` + `feedbackId`), all 3 event handlers
- [x] 2.13 Update `createDemandProjection` — dual-key (`_id` + `demandId`), all 3 event handlers
- [x] 2.14 Update `createPayoutProjection` — dual-key (`_id` + `payoutId`), all 4 event handlers
- [x] 2.15 Update `createAnalyticsProjection` — dual-key (`_id` + `analyticsId`), expand fields

## 3. Update query modules for dual-key lookups

- [x] 3.1 Add `getByAggregateId` to each query module using `_id` lookup for backward compat
- [x] 3.2 Add `getByAggregateId` to `queryUsers`
- [x] 3.3 Add `getByAggregateId` to `queryTours`
- [x] 3.4 Add `getByAggregateId` to `queryBookings`
- [x] 3.5 Add `getByAggregateId` to `queryResources`
- [x] 3.6 Add `getByAggregateId` to `queryPayments`
- [x] 3.7 Add `getByAggregateId` to `queryConversations`
- [x] 3.8 Add `getByAggregateId` to `queryMessages`
- [x] 3.9 Add `getByAggregateId` to `queryRequests`
- [x] 3.10 Add `getByAggregateId` to `queryFavorites`
- [x] 3.11 Add `getByAggregateId` to `queryFeedbacks`
- [x] 3.12 Add `getByAggregateId` to `queryDemands`
- [x] 3.13 Add `getByAggregateId` to `queryPayouts`
- [x] 3.14 Add `getByAggregateId` to `queryAnalytics`
- [x] 3.15 Verify all `getById` methods use typed entity key (not `_id`)

## 4. Migrate services (simplest aggregates first)

- [x] 4.1 Migrate `src/service/favorite-service.ts` — replace `getRepos()` with `es/commands/favorite` + `es/queries`; use `await handler.runOnce()` for read-after-write
- [x] 4.2 Migrate `src/service/feedback-service.ts` — replace `getRepos()` with `es/commands/feedback` + `es/queries`
- [x] 4.3 Migrate `src/service/demand-service.ts` — replace `getRepos()` with `es/commands/demand` + `es/queries`
- [x] 4.4 Migrate `src/service/request-service.ts` — replace `getRepos()` with `es/commands/request` + `es/queries`; use `await handler.runOnce()`
- [x] 4.5 Migrate `src/service/payout-service.ts` — replace `getRepos()` with `es/commands/payout` + `es/queries`; use `await handler.runOnce()`
- [x] 4.6 Migrate `src/service/tour-service.ts` — replace `getRepos()` with `es/commands/tour` + `es/queries`; use `await handler.runOnce()`
- [x] 4.7 Migrate `src/service/payment-service.ts` — replace `getRepos()` with `es/commands/payment` + `es/queries`; use `await handler.runOnce()`
- [x] 4.8 Migrate `src/service/house-service.ts` — replace `getRepos()` with `es/commands/resource` + `es/queries`; use `await handler.runOnce()`
- [x] 4.9 Migrate `src/service/user-service.ts` — replace `getRepos()` with `es/commands/user` + `es/queries`; use `await handler.runOnce()`
- [x] 4.10 Migrate `src/service/booking-service.ts` — replace `getRepos()` with `es/commands/booking` + `es/queries`; rewrite `populateBooking` cross-entity joins; use `await handler.runOnce()`
- [x] 4.11 Migrate `src/service/analytics-service.ts` — replace `getRepos()` with `es/commands/analytics` + `es/queries`; keep Mongoose `Analytics` model as fallback until projection confirmed adequate

## 5. Migrate remaining consumers of getRepos()

- [x] 5.1 Migrate `src/service/complete-verification-service.ts` — uses userEventRepo across methods
- [x] 5.2 Migrate `src/service/auth-service.ts` — if it uses getRepos
- [x] 5.3 Migrate `src/service/chat-service.ts` — if it uses getRepos
- [x] 5.4 Migrate `src/service/matcher-service.ts` — if it uses getRepos
- [x] 5.5 Migrate `src/repositories/user-repository.ts` — wrapper class using getRepos
- [x] 5.6 Migrate `src/repositories/payment_repo.ts` — wrapper class using getRepos

## 6. Cleanup old infrastructure (after migration confirmed stable)

- [x] 6.1 Keep old read-model collections (`users`, `bookings`, etc.) as read-only for historical queries
- [x] 6.2 Remove `src/event-sourcing/EventRepository.ts`
- [x] 6.3 Remove all event-repo factory files (12 files in `event-sourcing/`)
- [x] 6.4 Remove old `Repos` interface and `getRepos` from `event-sourcing/index.ts`
- [x] 6.5 Remove old read-model collection index creation from `event-sourcing/index.ts` (indices now in `ensureProjectionIndexes`)
- [x] 6.6 Remove `es_` prefix from projection collections; promote to canonical names
- [x] 6.7 Update `src/index.ts` imports if any stale references remain
- [x] 6.8 Remove old Mongoose `Analytics` model once new projection confirmed adequate
- [x] 6.9 Verify `npx tsc --noEmit` passes cleanly
