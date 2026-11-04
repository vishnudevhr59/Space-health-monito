# SPACE HEALTH MONITO — Frontend Module
**Lead:** Web Developer 1  
**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Recharts, Lucide React, Motion.

## Overview
The frontend implements an aerospace mission-control console designed according to NASA-STD-3001 Human Integration Design standards.

### Key Components
- `src/components/DailyBriefing.tsx`: Structured sections A-H for daily clinical review.
- `src/components/ContextExplorer.tsx`: Multi-system physiological and environmental cross-examination.
- `src/components/MissionTimeline.tsx`: Unified multi-stream timeline with event categorization.
- `src/components/NetworkStatusIndicator.tsx`: Real-time DSN status badge with backoff countdown.
- `src/components/LivePhysiologicalTrends.tsx`: Interactive Recharts visualization with baseline reference bands.
- `src/services/offlineSyncService.ts`: Persistent queue with exponential backoff background synchronization.

### Running & Testing
```bash
npm run dev    # Starts on http://127.0.0.1:3000
npm run lint   # Runs TypeScript verification
npm run build  # Compiles production bundle
```
