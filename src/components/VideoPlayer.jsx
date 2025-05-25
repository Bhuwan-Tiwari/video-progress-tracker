import React, { useRef, useEffect, useState, useCallback } from 'react';
import { IntervalTracker } from '../utils/intervalTracker';
import { progressAPI } from '../services/api';
import ProgressBar from './ProgressBar';
import './VideoPlayer.css';

const VideoPlayer = ({
  videoSrc,
  userId = 'user1',
  videoId = 'video1',
  autoSave = true,
  saveInterval = 5000
}) => {
  const videoRef = useRef(null);
  const intervalTrackerRef = useRef(new IntervalTracker());
  const saveTimeoutRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({
    watchedIntervals: [],
    currentPosition: 0,
    totalDuration: 0,
    uniqueSecondsWatched: 0,
    progressPercentage: 0
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);

  const loadProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedProgress = await progressAPI.getProgress(userId, videoId);

      setProgress(savedProgress);
      intervalTrackerRef.current.setWatchedIntervals(savedProgress.watchedIntervals);

      if (videoRef.current && savedProgress.currentPosition > 0) {
        videoRef.current.currentTime = savedProgress.currentPosition;
        setCurrentTime(savedProgress.currentPosition);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      setError('Failed to load progress');
    } finally {
      setIsLoading(false);
    }
  }, [userId, videoId]);

  const saveProgress = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const tracker = intervalTrackerRef.current;
      const currentPosition = videoRef.current.currentTime;
      const totalDuration = videoRef.current.duration || 0;

      const progressData = {
        watchedIntervals: tracker.getWatchedIntervals(),
        currentPosition,
        totalDuration
      };

      const updatedProgress = await progressAPI.updateProgress(userId, videoId, progressData);
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [userId, videoId]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (autoSave) {
        saveProgress();
      }
    }, saveInterval);
  }, [saveProgress, autoSave, saveInterval]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setProgress(prev => ({ ...prev, totalDuration: duration }));
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      intervalTrackerRef.current.startTracking(videoRef.current.currentTime);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    intervalTrackerRef.current.stopTracking();
    debouncedSave();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    setCurrentTime(currentTime);

    if (isPlaying) {
      intervalTrackerRef.current.updatePosition(currentTime);

      const tracker = intervalTrackerRef.current;
      const totalDuration = videoRef.current.duration || 0;
      const uniqueSecondsWatched = tracker.getUniqueSecondsWatched();
      const progressPercentage = tracker.getProgressPercentage(totalDuration);

      setProgress(prev => ({
        ...prev,
        currentPosition: currentTime,
        uniqueSecondsWatched,
        progressPercentage,
        watchedIntervals: tracker.getWatchedIntervals()
      }));
    }
  };

  const handleSeeked = () => {
    if (videoRef.current && isPlaying) {
      intervalTrackerRef.current.stopTracking();
      intervalTrackerRef.current.startTracking(videoRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    intervalTrackerRef.current.stopTracking();
    saveProgress();
  };

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (autoSave) {
        saveProgress();
      }
    };
  }, [saveProgress, autoSave]);

  const handleManualSave = () => {
    saveProgress();
  };

  if (isLoading) {
    return (
      <div className="video-player-container">
        <div className="loading-spinner">Loading video progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-player-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onSeeked={handleSeeked}
          onEnded={handleEnded}
          className="video-element"
        >
          Your browser does not support the video tag.
        </video>

        <div className="video-controls-overlay">
          <div className="current-time">
            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <ProgressBar
        progressPercentage={progress.progressPercentage}
        uniqueSecondsWatched={progress.uniqueSecondsWatched}
        totalDuration={progress.totalDuration}
        watchedIntervals={progress.watchedIntervals}
      />

      <div className="video-actions">
        <button onClick={handleManualSave} className="save-button">
          Save Progress
        </button>
        <button onClick={loadProgress} className="refresh-button">
          Refresh Progress
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
