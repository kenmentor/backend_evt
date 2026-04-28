## ADDED Requirements

### Requirement: Dual-key projection documents
Projection handlers SHALL write documents with both `_id` and a typed entity ID field (e.g., `bookingId`, `resourceId`, `userId`) set to the aggregate ID.

#### Scenario: Booking created projection
- **WHEN** a `bookingCreated` event is handled for aggregate ID `"abc123"`
- **THEN** the `es_bookings` collection SHALL contain a document with `_id: "abc123"` AND `bookingId: "abc123"`

#### Scenario: Resource created projection
- **WHEN** a `resourceCreated` event is handled for aggregate ID `"xyz789"`
- **THEN** the `es_resources` collection SHALL contain a document with `_id: "xyz789"` AND `resourceId: "xyz789"`

### Requirement: Complete read-model fields
Projection handlers SHALL include all fields that the old event-repo event handlers write to their read models, plus `createdAt` and `updatedAt` timestamps.

#### Scenario: Booking projection includes expiredDate
- **WHEN** a `bookingCreated` event is handled
- **THEN** the projection document SHALL include an `expiredDate` field set to ISO timestamp 3 days from the event timestamp

#### Scenario: Resource projection includes all create fields
- **WHEN** a `resourceCreated` event is handled
- **THEN** the projection document SHALL include `host`, `title`, `description`, `houseType`, `category`, `price`, `address`, `state`, `lga`, `location`, `bedrooms`, `bathrooms`, `furnishing`, `amenities`, `images`, `video`, `thumbnail`, `views`, `avaliable`, `deleted`, `createdAt`, and `updatedAt`

### Requirement: Projection handlers subscribe to clean stream names
Projection handlers SHALL subscribe to clean aggregate stream names (`bookings`, `tours`, `users`, etc.) as registered in the domain, not the old mixed names (`booking-events`, `tour-events`).

#### Scenario: Booking projection handler subscription
- **WHEN** `createBookingProjection` is called with `createHandler`
- **THEN** the handler SHALL be created with stream list `['bookings']`

### Requirement: Idempotent upsert pattern
Create-event projection handlers SHALL use `replaceOne` with `{ upsert: true }` so replaying events does not produce duplicate documents.

#### Scenario: Replaying a create event
- **WHEN** a `userCreated` event is processed twice for the same aggregate ID
- **THEN** exactly one document SHALL exist in the projection collection with the correct fields
