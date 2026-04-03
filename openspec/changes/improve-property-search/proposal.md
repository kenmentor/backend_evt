## Why

The current property search has several issues:
1. Uses basic MongoDB text search with limited capabilities
2. Index only on `location, type, category` but not on `title, description, address`
3. No fuzzy matching - searches fail on typos
4. Fallback chain is inefficient - too many query attempts
5. No search-as-you-type (debounced) on frontend
6. No highlighting of matching terms

## What Changes

1. **Enhanced MongoDB text index** - Include title, description, address, amenities for comprehensive search
2. **Fuzzy search** - Use MongoDB regex with word boundary for typo tolerance
3. **Weighted scoring** - Prioritize title matches over description matches
4. **Debounced frontend search** - Add delay to reduce API calls while typing
5. **Search suggestions** - Show autocomplete suggestions as user types
6. **Filter optimizations** - Better compound indexes for common filter combinations

## Capabilities

### New Capabilities
- `fuzzy-property-search`:-tolerant search for typos and partial matches
- `search-autocomplete`: Real-time search suggestions as user types

### Modified Capabilities
- `property-search`: Enhanced with fuzzy matching and better scoring

## Impact

- **Backend**: Update `src/modules/resource.js` (indexes), `src/repositories/house-repository.js` (search logic)
- **Frontend**: Add debounced search hook, autocomplete component
- **Performance**: New indexes will speed up search queries significantly