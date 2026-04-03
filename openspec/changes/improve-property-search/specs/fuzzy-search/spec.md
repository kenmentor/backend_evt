## ADDED Requirements

### Requirement: Comprehensive Text Search
The system SHALL search across multiple property fields including title, description, address, location, type, category, and amenities.

#### Scenario: Search by title
- **WHEN** user searches "apartments" in Lekki
- **THEN** system returns properties with "apartment" in title, ranked highest

#### Scenario: Search by description keywords
- **WHEN** user searches "spacious"
- **THEN** system returns properties with "spacious" in description

### Requirement: Fuzzy Search (Typo Tolerance)
The system SHALL return results even when user makes minor typos.

#### Scenario: Typo in search query
- **WHEN** user searches "apartmet" (typo)
- **THEN** system returns apartments (fuzzy matched)

#### Scenario: Partial word match
- **WHEN** user searches "lek"
- **THEN** system returns properties in "Lekki", "Lekki Phase 1", etc.

### Requirement: Weighted Results
The system SHALL prioritize certain fields over others in search results.

#### Scenario: Title match ranks higher
- **WHEN** user searches "flat"
- **THEN** properties with "flat" in title appear before properties with "flat" only in description

### Requirement: Debounced Search Input
The system SHALL not trigger search on every keystroke, reducing server load.

#### Scenario: Typing doesn't trigger immediate search
- **WHEN** user types multiple characters quickly
- **THEN** search is only triggered after 300ms of no typing

### Requirement: Autocomplete Suggestions
The system SHALL provide search suggestions as user types.

#### Scenario: Show suggestions while typing
- **WHEN** user types "lek"
- **THEN** system shows suggestions like "Lekki", "Lekki Phase 1", "Lekki Peninsula"