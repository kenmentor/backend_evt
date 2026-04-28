## ADDED Requirements

### Requirement: Typed query modules per aggregate
The system SHALL provide a query module for each aggregate (`queryUsers`, `queryBookings`, `queryResources`, `queryPayments`, `queryTours`, `queryConversations`, `queryMessages`, `queryRequests`, `queryFavorites`, `queryFeedbacks`, `queryDemands`, `queryPayouts`, `queryAnalytics`) reading from the `es_` prefixed projection collections.

#### Scenario: Query user by email
- **WHEN** `queryUsers.getByEmail("bob@example.com")` is called
- **THEN** the system SHALL return a `UserProjection` document matching that email, or `null` if not found

#### Scenario: Query bookings by host with pagination
- **WHEN** `queryBookings.getByHost("host123", 10, 20)` is called
- **THEN** the system SHALL return up to 20 `BookingProjection` documents for that host, sorted by `createdAt` descending, skipping the first 10

### Requirement: Clean-key and _id-based lookups
Each query module SHALL provide both `getById` (using the typed entity key) and `getByAggregateId` (using `_id`) for backward compatibility.

#### Scenario: Lookup by typed key
- **WHEN** `queryBookings.getById("abc123")` is called
- **THEN** the system SHALL query `{ bookingId: "abc123" }` and return the matching document

#### Scenario: Lookup by _id
- **WHEN** `queryBookings.getByAggregateId("abc123")` is called
- **THEN** the system SHALL query `{ _id: "abc123" }` and return the matching document

### Requirement: Document cleaning strips MongoDB `_id`
All query methods SHALL strip the MongoDB `_id` field from returned documents so callers receive clean projection types.

#### Scenario: Returned document has no _id
- **WHEN** `queryUsers.getById("user-1")` returns a document
- **THEN** the returned object SHALL NOT have an `_id` property, but SHALL have the typed key (`userId`)

### Requirement: Common query patterns per aggregate
Each query module SHALL support the standard query patterns for its aggregate: get-by-id, get-by-owner, get-by-status (where applicable), and paginated list-all.

#### Scenario: Get resources by category
- **WHEN** `queryResources.getByCategory("Apartment")` is called
- **THEN** the system SHALL return available, non-deleted `ResourceProjection` documents matching category "Apartment"

#### Scenario: Get payments by status
- **WHEN** `queryPayments.getByStatus("completed")` is called
- **THEN** the system SHALL return `PaymentProjection` documents where `status` is `"completed"`

### Requirement: Text search for resources
`queryResources` SHALL support `searchByText` using MongoDB text indices on title, description, and location fields.

#### Scenario: Full-text search on resources
- **WHEN** `queryResources.searchByText("luxury apartment")` is called
- **THEN** the system SHALL use a `$text` query against the `es_resources` collection and return results sorted by text match score
