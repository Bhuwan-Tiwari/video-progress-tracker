export class IntervalTracker {
  constructor() {
    this.watchedIntervals = [];
    this.currentInterval = null;
    this.lastPosition = 0;
    this.isPlaying = false;
  }

  setWatchedIntervals(intervals) {
    this.watchedIntervals = intervals || [];
  }

  startTracking(position) {
    this.lastPosition = position;
    this.currentInterval = { start: position, end: position };
    this.isPlaying = true;
  }

  updatePosition(position) {
    if (!this.isPlaying || !this.currentInterval) return;

    const timeDiff = Math.abs(position - this.lastPosition);

    if (timeDiff > 2) {
      this.finishCurrentInterval();
      this.startTracking(position);
    } else {
      this.currentInterval.end = position;
      this.lastPosition = position;
    }
  }

  stopTracking() {
    this.finishCurrentInterval();
    this.isPlaying = false;
  }

  finishCurrentInterval() {
    if (this.currentInterval && this.currentInterval.end > this.currentInterval.start) {
      this.watchedIntervals.push({ ...this.currentInterval });
      this.watchedIntervals = this.mergeIntervals(this.watchedIntervals);
    }
    this.currentInterval = null;
  }

  mergeIntervals(intervals) {
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

  getUniqueSecondsWatched() {
    const merged = this.mergeIntervals(this.watchedIntervals);
    return merged.reduce((total, interval) => total + (interval.end - interval.start), 0);
  }

  getProgressPercentage(totalDuration) {
    if (totalDuration === 0) return 0;
    const uniqueSeconds = this.getUniqueSecondsWatched();
    return Math.min((uniqueSeconds / totalDuration) * 100, 100);
  }

  getWatchedIntervals() {
    return this.mergeIntervals(this.watchedIntervals);
  }

  hasWatchedRange(start, end) {
    const merged = this.mergeIntervals(this.watchedIntervals);
    return merged.some(interval =>
      interval.start <= start && interval.end >= end
    );
  }
}
