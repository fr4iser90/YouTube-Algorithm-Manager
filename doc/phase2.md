# Phase 2: Preset System (Days 3-4)

## Files to Modify
- [ ] `src/components/presets/PresetCard.tsx` - Update UI for keyword lists
- [ ] `src/components/presets/PresetEditor.tsx` - Add keyword management interface
- [ ] `src/hooks/usePresetManagement.ts` - Update for keyword list handling
- [ ] `src/types/preset.ts` - Update preset structure for keywords
- [ ] `src/components/layout/PresetGrid.tsx` - Update grid layout for keyword presets

## New Files to Create
- [ ] `src/components/presets/KeywordListEditor.tsx`
- [ ] `src/components/presets/PresetImportExport.tsx`
- [ ] `src/hooks/useKeywordManagement.ts`
- [ ] `src/utils/presetStorage.ts`
- [ ] `src/types/keyword.ts`

## Tasks
1. **Preset System Redesign (Day 3 Morning)**
   - [ ] Update preset data structure for keywords
   - [ ] Create keyword list management interface
   - [ ] Implement keyword validation
   - [ ] Add keyword categories/tags

2. **Storage Implementation (Day 3 Afternoon)**
   - [ ] Set up localStorage structure
   - [ ] Implement preset saving
   - [ ] Add preset loading
   - [ ] Create preset backup system

3. **Import/Export (Day 4)**
   - [ ] Create preset export functionality
   - [ ] Implement preset import
   - [ ] Add preset validation
   - [ ] Create preset sharing system

## Current Structure
```
src/
├── components/
│   ├── presets/
│   │   ├── PresetCard.tsx
│   │   └── PresetEditor.tsx
│   └── layout/
│       └── PresetGrid.tsx
├── hooks/
│   └── usePresetManagement.ts
└── types/
    └── preset.ts
```

## Target Structure
```
src/
├── components/
│   ├── presets/
│   │   ├── PresetCard.tsx
│   │   ├── PresetEditor.tsx
│   │   ├── KeywordListEditor.tsx
│   │   └── PresetImportExport.tsx
│   └── layout/
│       └── PresetGrid.tsx
├── hooks/
│   ├── usePresetManagement.ts
│   └── useKeywordManagement.ts
├── types/
│   ├── preset.ts
│   └── keyword.ts
└── utils/
    └── presetStorage.ts
```

## Preset Structure
```typescript
interface KeywordPreset {
  id: string;
  name: string;
  description: string;
  keywords: {
    text: string;
    category?: string;
    isRegex?: boolean;
  }[];
  settings: {
    caseSensitive: boolean;
    matchWholeWord: boolean;
  };
}
```
