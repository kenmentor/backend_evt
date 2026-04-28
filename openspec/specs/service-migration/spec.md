## ADDED Requirements

### Requirement: Services use es/commands for writes
All service files SHALL import command modules from `es/commands/*` instead of accessing commands through `getRepos()` → `repo.commands`.

#### Scenario: User service uses new command module
- **WHEN** `user-service.ts` verifies a user's email
- **THEN** it SHALL call `userCmd.verifyEmail(id)` from `es/commands/user` instead of `getUserRepo().commands.verifyEmail(id)`

#### Scenario: Booking service uses new command module
- **WHEN** `booking-service.ts` creates a booking
- **THEN** it SHALL call `bookingCmd.create(bookingId, payload)` from `es/commands/booking` instead of `bookingRepo.create({ _id, ... })`

### Requirement: Services use es/queries for reads
All service files SHALL import query modules from `es/queries` instead of using `repo.find()` / `repo.findOne()` / `repo.findById()` through `getRepos()`.

#### Scenario: User service reads user by ID
- **WHEN** `user-service.ts` retrieves a user by ID
- **THEN** it SHALL call `queryUsers.getById(id)` from `es/queries` instead of `getUserRepo().findById(id)`

#### Scenario: Booking service filters by host
- **WHEN** `booking-service.ts` retrieves bookings for a host
- **THEN** it SHALL call `queryBookings.getByHost(hostId)` from `es/queries` instead of `bookingRepo.find({ host: hostId })`

### Requirement: Services use direct `await handler.runOnce()` for read-after-write
Services that need immediate read-back after a command SHALL call `await handler.runOnce()` directly to flush the relevant projection handler, matching the existing old-system pattern.

#### Scenario: Flush projection after creating a booking
- **WHEN** a booking is created via `bookingCmd.create` and the service needs the projection document immediately
- **THEN** the service SHALL call `await bookingProjection.runOnce()`

#### Scenario: Flush projection after verifying email
- **WHEN** `userCmd.verifyEmail(id)` is called and the service needs the updated user document
- **THEN** the service SHALL call `await userProjection.runOnce()`

### Requirement: `getRepos()` calls removed from services
After migration, service files SHALL NOT import `getRepos` from `../event-sourcing`.

#### Scenario: Migrated service has no getRepos import
- **WHEN** `user-service.ts` is fully migrated
- **THEN** it SHALL NOT contain `import { getRepos } from "../event-sourcing"`

### Requirement: Service function signatures unchanged
Migrated service functions SHALL retain the same exported signatures (function name, parameters, return type) as before migration.

#### Scenario: create_booking signature unchanged
- **WHEN** `booking-service.ts` is migrated
- **THEN** `create_booking(object)` SHALL accept the same parameter shape and return the same response shape as before
