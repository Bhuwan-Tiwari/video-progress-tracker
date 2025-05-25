import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { progressAPI } from '../services/api';
import './LecturePage.css';

const LecturePage = () => {
  const [serverStatus, setServerStatus] = useState('checking');
  const [userId] = useState('user1'); // In a real app, this would come from authentication
  const [videoId] = useState('lecture1');

  // Sample video URL - you can replace this with your own video
  const videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // Check server status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await progressAPI.healthCheck();
        setServerStatus('connected');
      } catch (error) {
        setServerStatus('disconnected');
        console.error('Server connection failed:', error);
      }
    };

    checkServerStatus();

    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'connected': return '#27ae60';
      case 'disconnected': return '#e74c3c';
      default: return '#f39c12';
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'connected': return 'Server Connected';
      case 'disconnected': return 'Server Disconnected';
      default: return 'Checking Connection...';
    }
  };

  return (
    <div className="lecture-page">
      <header className="lecture-header">
        <div className="header-content">
          <h1>Video Progress Tracker</h1>
          <p className="lecture-description">
            This system tracks your unique viewing progress. Only new content you watch
            will count towards your progress percentage.
          </p>

          <div className="server-status">
            <div
              className="status-indicator"
              style={{ backgroundColor: getStatusColor() }}
            />
            <span className="status-text">{getStatusText()}</span>
          </div>
        </div>
      </header>

      <main className="lecture-content">
        <div className="video-section">
          <h2>Sample Lecture Video</h2>
          <p className="video-description">
            Try watching different parts of the video, skipping around, or rewatching sections.
            Notice how the progress only increases when you watch new content!
          </p>

          {serverStatus === 'connected' ? (
            <VideoPlayer
              videoSrc={videoSrc}
              userId={userId}
              videoId={videoId}
              autoSave={true}
              saveInterval={3000} // Save every 3 seconds
            />
          ) : (
            <div className="server-error">
              <h3>Server Connection Required</h3>
              <p>
                Unable to connect to the backend server. Please check:
              </p>
              <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                <li>Backend server is running</li>
                <li>Network connection is stable</li>
                <li>API URL is configured correctly</li>
              </ul>
              <p><strong>Current API URL:</strong> <code>{import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}</code></p>
              {!import.meta.env.VITE_API_URL && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '6px' }}>
                  <strong>Local Development:</strong> Run <code>npm run dev</code> in the backend directory
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="info-section">
          <div className="info-card">
            <h3>How It Works</h3>
            <ul>
              <li><strong>Unique Tracking:</strong> Only counts new video content you haven't seen before</li>
              <li><strong>Skip Detection:</strong> Jumping ahead doesn't count as progress</li>
              <li><strong>Rewatch Handling:</strong> Rewatching sections doesn't increase progress</li>
              <li><strong>Auto-Save:</strong> Progress is automatically saved every few seconds</li>
              <li><strong>Resume:</strong> Video resumes from where you left off</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Features Demonstrated</h3>
            <ul>
              <li>Real-time progress calculation</li>
              <li>Visual progress bar with watched segments</li>
              <li>Interval merging algorithm</li>
              <li>Persistent storage</li>
              <li>Resume functionality</li>
              <li>Responsive design</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Technical Details</h3>
            <ul>
              <li><strong>Frontend:</strong> React with custom video player</li>
              <li><strong>Backend:</strong> Node.js/Express API</li>
              <li><strong>Storage:</strong> JSON file (easily upgradeable to database)</li>
              <li><strong>Algorithm:</strong> Interval merging for unique progress</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="lecture-footer">
        <p>
          Built for TuteDude SDE Assignment - Video Progress Tracking System
        </p>
        <p>
          <small>User ID: {userId} | Video ID: {videoId}</small>
        </p>
      </footer>
    </div>
  );
};

export default LecturePage;
