# Video Progress Tracker

A video progress tracking system that tracks unique viewing time for online learning platforms.

## Problem

Most video players just track if a video was played to the end, but students might skip around or rewatch sections. This doesn't show real learning progress.

## Solution

This app tracks only the unique parts of a video that a user has actually watched:
- Only new content counts toward progress
- Skipping ahead doesn't inflate progress
- Rewatching the same section doesn't increase progress
- Progress is saved and resumes correctly

## Features

- Real-time progress tracking
- Visual progress bar showing watched segments
- Auto-save progress every few seconds
- Resume from last position
- Works on mobile and desktop

## Tech Stack

**Frontend:** React + Vite
**Backend:** Node.js + Express
**Storage:** JSON files

## Setup

1. Install dependencies:
```bash
npm install
cd backend && npm install
```

2. Start backend server:
```bash
cd backend
npm run dev
```

3. Start frontend (new terminal):
```bash
npm run dev
```

4. Open http://localhost:5173

## How It Works

The app tracks video watching in intervals (start time to end time). When you skip around, it creates separate intervals. Then it merges overlapping intervals to calculate unique viewing time.

Example:
- Watch 0-20 seconds, then 50-60 seconds, then 10-30 seconds
- Intervals: [0-20], [50-60], [10-30]
- After merging: [0-30], [50-60]
- Total unique time: 40 seconds

## API

- `GET /api/progress/:userId/:videoId` - Get progress
- `POST /api/progress/:userId/:videoId` - Save progress

## Testing

Try these scenarios:
1. Play video normally
2. Skip ahead and watch new parts
3. Rewatch the same section
4. Refresh page to test resume

Built for TuteDude SDE Assignment
