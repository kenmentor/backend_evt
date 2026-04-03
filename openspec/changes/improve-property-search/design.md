## Context

### Current State
- MongoDB text index on `location, type, category` only
- Basic `$text` search with AND logic
- Regex fallback for empty results
- Frontend has no debouncing on search input
- No autocomplete/suggestions

### Goal
Make property search fast, fuzzy (typo-tolerant), and provide autocomplete suggestions.

## Decisions

### 1. Text Index Scope

**Decision:** Expand text index to include more fields with weights

```javascript
resourceSchema.index(
  { title: "text", description: "text", address: "text", location: "text", type: "text", category: "text", amenities: "text" },
  { weights: { title: 10, address: 5, description: 1, location: 1, type: 1, category: 1 }, name: "propertySearchIndex" }
);
```

**Rationale:** Higher weights = higher relevance in results

### 2. Fuzzy Search Implementation

**Decision:** Use regex with word boundaries for fuzzy matching

**Rationale:** More flexible than Levenshtein distance, better performance

### 3. Frontend Debounce

**Decision:** Use 300ms debounce on search input

**Rationale:** Balances responsiveness with API call reduction

## Search Flow

```
User types "lekki apart"
        │
        ▼
┌───────────────────┐
│  Debounce 300ms  │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  1. Text Search  │ (with weights)
│  2. Regex fuzzy  │ (if text empty)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Return results  │
│  with scores     │
└───────────────────┘
```

## Migration Plan

1. Update resource schema with new text index
2. Improve house repository search logic
3. Add debounce hook to frontend
4. Add search suggestions component