import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://localhost:5173',
    'https://video-progress-frontend.onrender.com',
    process.env.FRONTEND_URL,
    /\.onrender\.com$/
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'progress-data.json');

async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    await fs.writeFile(DATA_FILE, JSON.stringify({}));
  }
}

function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];

  intervals.sort((a, b) => a.start - b.start);

  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const lastMerged = merged[merged.length - 1];

    if (current.start <= lastMerged.end) {
      lastMerged.end = Math.max(lastMerged.end, current.end);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

function calculateUniqueSeconds(intervals) {
  const merged = mergeIntervals(intervals);
  return merged.reduce((total, interval) => total + (interval.end - interval.start), 0);
}

app.get('/api/progress/:userId/:videoId', async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));

    const userProgress = data[userId]?.[videoId] || {
      watchedIntervals: [],
      currentPosition: 0,
      totalDuration: 0,
      uniqueSecondsWatched: 0,
      progressPercentage: 0
    };

    res.json(userProgress);
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

app.post('/api/progress/:userId/:videoId', async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    const { watchedIntervals, currentPosition, totalDuration } = req.body;

    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));

    if (!data[userId]) {
      data[userId] = {};
    }

    const uniqueSecondsWatched = calculateUniqueSeconds(watchedIntervals);
    const progressPercentage = totalDuration > 0 ? (uniqueSecondsWatched / totalDuration) * 100 : 0;

    data[userId][videoId] = {
      watchedIntervals: mergeIntervals(watchedIntervals),
      currentPosition,
      totalDuration,
      uniqueSecondsWatched,
      progressPercentage: Math.min(progressPercentage, 100),
      lastUpdated: new Date().toISOString()
    };

    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));

    res.json(data[userId][videoId]);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, _, res, __) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.use('*', (_, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

async function startServer() {
  await initializeDataFile();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
