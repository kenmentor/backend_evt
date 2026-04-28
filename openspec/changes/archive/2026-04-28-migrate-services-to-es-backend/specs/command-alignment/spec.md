## ADDED Requirements

### Requirement: Commands emit events matching old system shapes
Command handlers in `es/commands/` SHALL emit event objects whose fields match the shape emitted by the corresponding old event-repo command handlers.

#### Scenario: Booking create matches old event shape
- **WHEN** `bookingCmd.create` is called with `{ host, guest, house, amount, paymentId, checkIn, checkOut, platformFee }`
- **THEN** the emitted `bookingCreated` event SHALL contain `host`, `guest`, `house`, `amount`, `paymentId`, `checkIn`, `checkOut`, `platformFee` fields

#### Scenario: Payment initiation matches old event shape
- **WHEN** `paymentCmd.initiate` is called with `{ host, guest, house, amount, method, paymentRef }`
- **THEN** the emitted `paymentInitiated` event SHALL contain `host`, `guest`, `house`, `amount`, `method`, `paymentRef` fields

#### Scenario: Request creation matches old event shape
- **WHEN** `requestCmd.create` is called with `{ guest, host, house, checkIn, checkOut, guests, totalPrice, note }`
- **THEN** the emitted `requestCreated` event SHALL contain `guest`, `host`, `house`, `checkIn`, `checkOut`, `guests`, `totalPrice`, `note` fields

### Requirement: Commands retain `performedBy` audit field
All command handlers SHALL include `performedBy` as an optional field in emitted events, even where the old system omits it.

#### Scenario: Confirm booking with performedBy
- **WHEN** `bookingCmd.confirm(id, { performedBy: "admin" })` is called
- **THEN** the emitted event SHALL include `performedBy: "admin"`

#### Scenario: Confirm booking without payload
- **WHEN** `bookingCmd.confirm(id)` is called with no second argument
- **THEN** the emitted event SHALL include `performedBy: undefined` and the command SHALL NOT throw

### Requirement: Command validation matches old system
Command handlers SHALL validate aggregate state using the same rules as the old event-repo commands (e.g., `agg.version === 0` for creates, status checks for transitions).

#### Scenario: Cannot confirm non-pending booking
- **WHEN** `bookingCmd.confirm` is called on a booking with `status: "completed"`
- **THEN** the command SHALL throw with message "Booking cannot be confirmed"

#### Scenario: Cannot create duplicate aggregate
- **WHEN** `bookingCmd.create` is called on an existing booking (`agg.version > 0`)
- **THEN** the command SHALL throw with message "Booking already exists"

### Requirement: No-op updates emit no events
Command handlers SHALL return `undefined` (no event) when an update command would not change any field.

#### Scenario: Price unchanged
- **WHEN** `resourceCmd.updatePrice(id, { price: "5000" })` is called and the resource already has `price: "5000"`
- **THEN** the handler SHALL return `undefined` and no event SHALL be emitted

#### Scenario: Status already set
- **WHEN** `bookingCmd.expire(id)` is called on a booking already not in `"pending"` status
- **THEN** the handler SHALL return `undefined` and no event SHALL be emitted
