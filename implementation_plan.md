## Phase 4: Layout Layer Extraction

To make the system truly modular, we will extract the hardcoded `layout` object from [BaseCard.jsx](file:///c:/Users/sliba/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%88%E3%83%83%E3%83%97/TSK_Rank_Card/rank-card-generator/src/components/BaseCard.jsx) into a new layer category (`layouts`). This enables easy swapping between entirely different card geometries (e.g., Vertical Mobile, Square Avatar, different text positioning) instantly.

### Implementation Steps
1. **Create Layout Layer:** Create `src/layers/layouts/StandardLayout.js` and move the `layout` object from [BaseCard.jsx](file:///c:/Users/sliba/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%88%E3%83%83%E3%83%97/TSK_Rank_Card/rank-card-generator/src/components/BaseCard.jsx) into this file. Export it as `StandardLayout`.
2. **Update Registry:** Add the `layouts` category to the automated layer discovery in both [index.js](file:///c:/Users/sliba/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%88%E3%83%83%E3%83%97/TSK_Rank_Card/rank-card-generator/src/registry/index.js), [Studio.jsx](file:///c:/Users/sliba/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%88%E3%83%83%E3%83%97/TSK_Rank_Card/rank-card-generator/src/Studio.jsx), and [App.jsx](file:///c:/Users/sliba/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%88%E3%83%83%E3%83%97/TSK_Rank_Card/rank-card-generator/src/App.jsx).
3. **Update UI:** Add a 6th dropdown for "Layout" in the Motif Studio Sandbox and the App Sandbox modes.
4. **Update Configs:** Update [src/configs/rankConfigs.js](file:///c:/Users/sliba/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%88%E3%83%83%E3%83%97/TSK_Rank_Card/rank-card-generator/src/configs/rankConfigs.js) so that profiles (like `BlessedRankConfig`) specify a `layout: StandardLayout` property.
5. **Update BaseCard:** Modify [BaseCard.jsx](file:///c:/Users/sliba/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%88%E3%83%83%E3%83%97/TSK_Rank_Card/rank-card-generator/src/components/BaseCard.jsx) to use `config.layout` instead of declaring its own layout object.
