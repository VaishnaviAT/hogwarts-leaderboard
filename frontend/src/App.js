import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import Header from './components/Header';
import Leaderboard from './components/Leaderboard';
import ActivityFeed from './components/ActivityFeed';
import AdminControls from './components/AdminControls';
import ConnectionStatus from './components/ConnectionStatus';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
  color: #f0f6fc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLiveUpdatesEnabled, setIsLiveUpdatesEnabled] = useState(true);
  const [currentTimeWindow, setCurrentTimeWindow] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [generatorStatus, setGeneratorStatus] = useState({ isRunning: false });
  const [lastUpdated, setLastUpdated] = useState(null);

  // ADD THIS REF
  const isLiveUpdatesEnabledRef = useRef(isLiveUpdatesEnabled);

  // Keep the ref up-to-date with state
  useEffect(() => {
    isLiveUpdatesEnabledRef.current = isLiveUpdatesEnabled;
  }, [isLiveUpdatesEnabled]);

  useEffect(() => {
    // Initialize ONCE
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      upgrade: false
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from server');
    });

    newSocket.on('leaderboard-update', (data) => {
      if (isLiveUpdatesEnabledRef.current) {
        setLeaderboardData(data.data);
        setLastUpdated(new Date());
      }
    });

    newSocket.on('new-entry', (data) => {
      setActivityData(prev => [data, ...prev.slice(0, 19)]);
      if (isLiveUpdatesEnabledRef.current) {
        toast(`${data.house} ${data.points > 0 ? '+' : ''}${data.points} points`, {
          icon: data.points > 0 ? '✨' : '💔',
          style: {
            background: getHouseColor(data.house),
            color: 'white',
          }
        });
      }
    });

    newSocket.on('generator-status', (status) => {
      setGeneratorStatus(status);
    });

    newSocket.on('error', (error) => {
      toast.error(error.message || 'An error occurred');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []); // Only initialize on mount

  // Load initial activity data
  useEffect(() => {
    if (isConnected) {
      fetchActivityData();
    }
  }, [isConnected]);

  const fetchActivityData = async () => {
    try {
      const response = await fetch('/api/activity?limit=15');
      const data = await response.json();

      if (data.success) {
        setActivityData(data.data);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast.error('Failed to load activity data');
    }
  };

  const handleTimeWindowChange = (timeWindow) => {
    setCurrentTimeWindow(timeWindow);

    if (socket && socket.connected) {
      socket.emit('request-leaderboard', { timeWindow });
    }
  };

  const toggleLiveUpdates = () => {
    setIsLiveUpdatesEnabled(prev => !prev);
    toast(isLiveUpdatesEnabled ? 'Live updates disabled' : 'Live updates enabled', {
      icon: isLiveUpdatesEnabled ? '⏸️' : '▶️'
    });
    // The ref will auto-update due to the useEffect above
  };

  const handleAddEntry = (entryData) => {
    if (socket && socket.connected) {
      socket.emit('add-entry', entryData);
      toast.success('Entry submitted');
    } else {
      toast.error('Not connected to server');
    }
  };

  const handleControlGenerator = (action, options = {}) => {
    if (socket && socket.connected) {
      socket.emit('control-generator', { action, ...options });

      const messages = {
        start: 'Data generator started',
        stop: 'Data generator stopped',
        generate: 'Generated new entry'
      };

      toast.success(messages[action] || 'Generator action completed');
    } else {
      toast.error('Not connected to server');
    }
  };

  const getHouseColor = (house) => {
    const colors = {
      'Gryffindor': '#740001',
      'Slytherin': '#1a472a',
      'Ravenclaw': '#0e1a40',
      'Hufflepuff': '#ecb939'
    };
    return colors[house] || '#333';
  };

  return (
    <AppContainer>
      <Container>
        <Header
          currentTimeWindow={currentTimeWindow}
          onTimeWindowChange={handleTimeWindowChange}
          isLiveUpdatesEnabled={isLiveUpdatesEnabled}
          onToggleLiveUpdates={toggleLiveUpdates}
          isConnected={isConnected}
          lastUpdated={lastUpdated}
        />

        <MainContent>
          <Leaderboard data={leaderboardData} />
          <ActivityFeed data={activityData} onRefresh={fetchActivityData} />
        </MainContent>

        <AdminControls
          onAddEntry={handleAddEntry}
          onControlGenerator={handleControlGenerator}
          generatorStatus={generatorStatus}
        />

        <ConnectionStatus isConnected={isConnected} />
      </Container>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#21262d',
            color: '#f0f6fc',
            border: '1px solid #30363d',
          },
        }}
      />
    </AppContainer>
  );
}

export default App;
