## Why

The codebase has two parallel event-sourcing infrastructures: an older `EventRepository`-based system in `src/event-sourcing/` (wired and active) and a newer, cleaner evtstore-native system in `src/es/` (fully typed aggregates, commands, projections, and queries — wired but unused). Services currently use the old `getRepos()` pattern with `repo.commands.xxx()` + `repo.handler.runOnce()` + `repo.findById()`. This migration unifies the codebase on the well-structured `es/` system, eliminating the split-brain and reducing maintenance surface.

## What Changes

- Align `es/types/`, `es/aggregates/`, and `es/commands/` event/command shapes with what the old system actually emits and consumes
- Update `es/projection.ts` handlers to use dual-key documents (`_id` = `{entity}Id` = aggregateId) for backward-compatible reads, and include missing read-model fields (e.g., `expiredDate` on bookings)
- Update `es/queries.ts` to support both `_id`-based and typed-key lookups
- Migrate all 16 service files to import from `es/commands/*` for writes and `es/queries/*` for reads instead of `getRepos()`  
- Services use direct `await handler.runOnce()` for read-after-write (same pattern as old system)
- Stream names stay clean (e.g., `bookings`, not `booking-events`); the domain maps the correct stream per aggregate
- `performedBy` remains in event payloads for auditability across all aggregates
- **BREAKING**: Old `EventRepository` instances and their per-repo domains will be removed once all services are migrated

## Capabilities

### New Capabilities

- `projection-alignment`: Projection handlers that write dual-key documents (`_id` + typed entity ID) with complete read-model fields matching the old system's read models
- `command-alignment`: Command handlers aligned with old system event shapes, retaining `performedBy` audit field
- `query-modules`: Typed query modules per aggregate with both clean-key and `_id`-based lookup methods
- `service-migration`: All services migrated from `getRepos()` / `repo.commands` / `repo.find` to `es/commands` / `es/queries`

### Modified Capabilities

<!-- None — no existing specs to modify -->

## Impact

- **Affected code**: 16 service files, 12 type files, 12 aggregate files, 12 command files, `es/projection.ts`, `es/projection-shared.ts`, `es/queries.ts`, `es/domain.ts`, `es/index.ts`, `src/index.ts`
- **Removed**: `EventRepository.ts`, 12 event-repo factory files in `src/event-sourcing/`, old per-repo index setup
- **Dependencies**: No new packages required; uses existing `evtstore` v12, `mongodb` v7
- **Risk**: High for booking and analytics aggregates (cross-entity joins, divergent event shapes)
