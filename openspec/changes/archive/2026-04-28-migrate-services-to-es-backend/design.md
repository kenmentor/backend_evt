## Context

The codebase runs two event-sourcing systems side by side:

| | Active System (`event-sourcing/`) | New System (`es/`) |
|---|---|---|
| Provider | Per-repo `createDomain` via `getProvider()` | Shared `createDomain` via `initProvider()` |
| Commands | `repo.commands.xxx(id, data?)` via `EventRepository` | `xxxCmd.xxx(id, payload)` via `createCommands` |
| Events | Same MongoDB collections (`events_store`/`events_bookmarks`) | Same collections (different provider instance) |
| Projections | Old `eventHandlers` writing to raw collections using `_id` as PK | New `createHandler` writing to `es_*` collections using typed PK |
| Queries | `repo.find/findOne/findById` on raw collections | `queryXxx.getById/find` on `es_*` collections |
| Stream names | Mixed (`booking-events`, `tour-events`, etc.) | Clean (`bookings`, `tours`, etc.) |
| Services | 16 files using `getRepos()` | Not yet adopted |

The new system's projections are now wired into `src/index.ts` and run alongside the old event handlers. Both write to separate collections (`es_` prefix avoids collision). The next step is aligning event shapes and migrating service call-sites.

## Goals / Non-Goals

**Goals:**
- Align `es/types`, `es/aggregates`, `es/commands` event shapes with the old system's actual event payloads
- Update projections to dual-key (`_id` + typed entity ID) for backward-compatible reads
- Add missing read-model fields to projection interfaces (e.g., `expiredDate`)
- Migrate all services from `getRepos()` to `es/commands` + `es/queries`
- Keep `performedBy` audit field on all events (even where old system omits it)
- Keep clean stream names (`bookings` not `booking-events`)

**Non-Goals:**
- Changing event payload shapes beyond what the old system already emits
- Rewriting business logic in services (only wiring changes)
- Dropping old read-model collections — they remain as read-only historical copies
- Introducing new aggregate types or commands beyond what exists

## Decisions

### D1: Dual-key projection documents

**Choice**: Every projection document stores both `_id` (set to aggregateId) and a typed key field (`userId`, `bookingId`, etc.) set to the same value.

**Rationale**: 
- Old services use `repo.findById(id)` which queries `_id`. Dual-key means query modules can offer both `getById(typedKey)` and `getByAggregateId(_id)` without breaking either path.
- Typed key improves readability: `{ userId: "abc" }` is clearer than `{ _id: "abc" }`.
- No migration overhead — both values are written atomically in the upsert.

**Alternatives considered**: 
- *Only `_id`*: Loses typed query readability. 
- *Only typed key*: Breaks all existing `_id`-based lookups. 
- *Prefix `_id`*: Rejected; simpler to mirror old system.

### D2: Stream names stay clean

**Choice**: Use clean names (`bookings`, `tours`, `users`) in aggregates and domain — not the old mixed names (`booking-events`, `tour-events`).

**Rationale**: The new system is the canonical owner going forward. Old events written to different stream names are historical; new commands emit to new streams. The projection handlers subscribe to the new streams. This avoids carrying forward inconsistent naming.

### D3: `performedBy` retained on all events

**Choice**: Include `performedBy` as an optional field on every event type, even where the old system never emits it.

**Rationale**: Provides audit trail for all mutations. Old services calling commands with no second argument will cause `cmd` to be `undefined`, making `performedBy` resolve to `undefined` in the event — which is fine since it's optional in the event union.

**Risk**: Events from old vs new flows will have inconsistent `performedBy` presence. Mitigation: This is acceptable — it's additive metadata.

### D4: Phase-based service migration

**Choice**: Migrate services aggregate by aggregate, starting with simplest (favorite, feedback, demand) and progressing to complex (booking, analytics).

**Rationale**: Reduces blast radius. Each migration can be tested independently. Booking's `populateBooking` cross-entity joins and analytics' divergent event shapes need extra care.

### D5: Direct `await handler.runOnce()` for read-after-write

**Choice**: Use direct `await handler.runOnce()` calls after commands where immediate read-back is needed, matching the existing old-system pattern. No debounce utility.

**Rationale**: The existing services already use `await repo.handler.runOnce()` directly — it's a proven, safe pattern. Debouncing adds complexity without clear benefit given the current call frequency. If needed later, it can be introduced as a separate optimization.

## Risks / Trade-offs

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Event shape mismatch causes incorrect aggregate state | Medium | High | Verify fold functions against old fold/event shapes per aggregate before migration |
| Old services calling new commands with wrong payload shape | Medium | High | Types already aligned; test each service after migration |
| `populateBooking` cross-entity joins break with typed-key queries | High | Medium | Rewrite population using typed query modules; test with real data |
| Analytics event shape divergence (old: `action, sessionId, ipAddress, userAgent, referrer` vs new: `eventType, metadata`) | High | Medium | Expand analytics event types to carry all old fields as optional; use `metadata` for extensible fields |
| Two providers reading same event store cause bookmark drift | Low | Low | Separate bookmark labels (`*-projection` vs `*-handler`); no conflict |
| `performedBy` always undefined for old call sites | Low | Low | Field is optional; acceptable to have null values during transition |

## Migration Plan

1. **Phase 1 — Align es/ types and projections** (non-breaking)
   - Update event types to match old system shapes where diverged
   - Update projection handlers for dual-key writes and missing fields
   - Update query modules for dual-key lookups

2. **Phase 2 — Migrate services** (one aggregate at a time)
   - Replace `getRepos() → getXxxRepo()` with direct imports from `es/commands` and `es/queries`
   - Replace `repo.commands.xxx(id, data)` with `xxxCmd.xxx(id, payload)`
   - Replace `repo.find/findOne/findById` with `queryXxx.getById/find`
   - Replace `repo.handler.runOnce()` with direct `await handler.runOnce()` where read-after-write needed
   - Test each migrated service

3. **Phase 3 — Cleanup** (after migration confirmed stable)
   - Remove `EventRepository.ts` and all factory files
   - Remove old event handler registrations from `event-sourcing/index.ts`
   - Remove duplicate index creation (old raw collections)
   - Remove `es_` prefix from projection collections; promote to canonical names
   - Keep old read-model collections (`users`, `bookings`, etc.) as read-only for historical queries

## Resolved Questions

- **Old read-model collections**: Kept as read-only for historical queries. Not dropped.
- **Old Mongoose `Analytics` model**: Removed once the new analytics projection is confirmed to adequately replace it.
- **Read-after-write pattern**: Direct `await handler.runOnce()` — no debounce utility.
