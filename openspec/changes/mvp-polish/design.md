## Context

### Current State
- Core features work but UX is inconsistent
- Missing error boundaries (pages crash on errors)
- Basic loading states exist but inconsistent
- Forms lack proper validation feedback
- Mobile experience is hit-or-miss

### Goal
Make the app feel production-ready with consistent error handling, loading states, and improved responsiveness.

## Decisions

### 1. Error Boundary Strategy

**Decision:** Create React error boundary at app level and per-page

```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <Page />
</ErrorBoundary>
```

**Rationale:** Prevents full app crashes, shows user-friendly error page

### 2. Loading States

**Decision:** Use skeleton loaders for content, spinners for actions

| Action | Loading State |
|--------|--------------|
| Page load | Skeleton cards |
| Button click | Spinner + disabled |
| Form submit | Full button loading |
| API retry | Toast with retry button |

### 3. Toast Notifications

**Decision:** Use existing Sonner library for all feedback

| Action | Toast Type |
|--------|------------|
| Success | Success toast (green) |
| Error | Error toast (red) |
| Info | Info toast (blue) |
| Action needed | Action toast with button |

### 4. Form Validation

**Decision:** Use Zod with react-hook-form (already installed)

- Validate on blur + on submit
- Show inline errors below fields
- Disable submit until valid

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      APP LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  Error Boundary (catches crashes)                         │
│  ├── Header                                                 │
│  ├── Page Content                                           │
│  │   ├── Loading Skeleton                                   │
│  │   ├── Content                                            │
│  │   └── Error State                                        │
│  └── Toast Container                                        │
└─────────────────────────────────────────────────────────────┘
```

## Components to Create

1. `components/ui/error-boundary.tsx` - Reusable error boundary
2. `components/ui/skeleton.tsx` - Enhanced skeleton loader
3. `components/loading-states.tsx` - Common loading patterns
4. `components/empty-state.tsx` - Empty state component
5. `app/global-error.tsx` - Root error boundary