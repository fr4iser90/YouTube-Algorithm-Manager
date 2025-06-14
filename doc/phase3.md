# Phase 3: Content Filtering (Days 5-7)

## Files to Modify
- [ ] `src/components/filtering/ContentFilter.tsx` - Add clickbait detection
- [ ] `extension/content/YouTubeFilter.ts` - Implement filtering logic
- [ ] `src/hooks/useContentFilter.ts` - Add clickbait patterns
- [ ] `src/types/filtering.ts` - Add clickbait types

## New Files to Create
- [ ] `src/components/filtering/ClickbaitDetector.tsx`
- [ ] `src/utils/clickbaitPatterns.ts`
- [ ] `extension/content/clickbaitDetector.ts`

## Tasks
1. **Keyword Matching (Day 5)**
   - [ ] Implement case-sensitive matching
   - [ ] Add whole word matching
   - [ ] Create regex support
   - [ ] Add keyword highlighting

2. **Clickbait Detection (Day 6)**
   - [ ] Create clickbait pattern database
   - [ ] Implement pattern matching
   - [ ] Add title analysis
   - [ ] Create thumbnail analysis

## Current Structure
```
src/
├── components/
│   └── filtering/
│       └── ContentFilter.tsx
├── hooks/
│   └── useContentFilter.ts
└── types/
    └── filtering.ts

extension/
└── content/
    └── YouTubeFilter.ts
```

## Target Structure
```
src/
├── components/
│   └── filtering/
│       ├── ContentFilter.tsx
│       └── ClickbaitDetector.tsx
├── hooks/
│   └── useContentFilter.ts
├── types/
│   └── filtering.ts
└── utils/
    └── clickbaitPatterns.ts

extension/
└── content/
    ├── YouTubeFilter.ts
    └── clickbaitDetector.ts
```

## Clickbait Patterns
```typescript
interface ClickbaitPattern {
  type: 'title' | 'thumbnail';
  pattern: string;
  weight: number;
  description: string;
}

interface ClickbaitResult {
  score: number;
  matches: {
    pattern: ClickbaitPattern;
    match: string;
  }[];
  isClickbait: boolean;
}
```
