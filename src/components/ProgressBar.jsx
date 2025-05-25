import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({
  progressPercentage,
  uniqueSecondsWatched,
  totalDuration,
  watchedIntervals = []
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3>Video Progress</h3>
        <div className="progress-stats">
          <span className="progress-percentage">
            {progressPercentage.toFixed(1)}% Complete
          </span>
          <span className="progress-time">
            {formatDuration(uniqueSecondsWatched)} / {formatDuration(totalDuration)} watched
          </span>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-background">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          />

          <div className="intervals-overlay">
            {watchedIntervals.map((interval, index) => {
              const startPercent = (interval.start / totalDuration) * 100;
              const widthPercent = ((interval.end - interval.start) / totalDuration) * 100;

              return (
                <div
                  key={index}
                  className="watched-interval"
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="progress-labels">
          <span>0:00</span>
          <span>{formatDuration(totalDuration)}</span>
        </div>
      </div>

      {watchedIntervals.length > 0 && (
        <div className="intervals-info">
          <details>
            <summary>Watched Segments ({watchedIntervals.length})</summary>
            <div className="intervals-list">
              {watchedIntervals.map((interval, index) => (
                <div key={index} className="interval-item">
                  {formatTime(interval.start)} - {formatTime(interval.end)}
                  <span className="interval-duration">
                    ({formatTime(interval.end - interval.start)})
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      <div className="progress-insights">
        <div className="insight-item">
          <span className="insight-label">Completion Rate:</span>
          <span className="insight-value">{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="insight-item">
          <span className="insight-label">Segments Watched:</span>
          <span className="insight-value">{watchedIntervals.length}</span>
        </div>
        <div className="insight-item">
          <span className="insight-label">Unique Time:</span>
          <span className="insight-value">{formatDuration(uniqueSecondsWatched)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
