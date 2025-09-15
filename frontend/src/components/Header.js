import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Play, Pause } from 'lucide-react';

const HeaderContainer = styled.header`
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #30363d;
  border-radius: 12px;
  margin-bottom: 2rem;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  font-family: 'Cinzel', serif;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const HogwartsText = styled.span`
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #740001, #58a6ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HouseText = styled.span`
  display: block;
  font-size: 1.2rem;
  font-weight: 400;
  color: #8b949e;
  margin-top: 0.25rem;
`;

const HeaderControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const TimeControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const TimeLabel = styled.label`
  color: #8b949e;
  font-weight: 500;
  margin-right: 0.5rem;
`;

const TimeButton = styled(motion.button)`
  background: ${props => props.active ? '#58a6ff' : '#21262d'};
  border: 1px solid ${props => props.active ? '#58a6ff' : '#30363d'};
  color: ${props => props.active ? 'white' : '#f0f6fc'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.active ? '#4493f8' : '#30363d'};
    border-color: #58a6ff;
  }
`;

const LiveControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LiveButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.active ? '#3fb950' : '#21262d'};
  border: 1px solid ${props => props.active ? '#3fb950' : '#30363d'};
  color: ${props => props.active ? 'white' : '#f0f6fc'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.active ? '#2ea043' : '#30363d'};
  }
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #21262d;
  border-radius: 8px;
  font-size: 0.9rem;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.connected ? '#3fb950' : '#f85149'};
  animation: ${props => props.connected ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const LastUpdated = styled.div`
  text-align: center;
  color: #8b949e;
  font-size: 0.9rem;
  margin-top: 1rem;
`;

const timeWindows = [
  { value: 'all', label: 'All Time' },
  { value: '24hours', label: '24 Hours' },
  { value: '1hour', label: '1 Hour' },
  { value: '5min', label: '5 Minutes' }
];

function Header({
  currentTimeWindow,
  onTimeWindowChange,
  isLiveUpdatesEnabled,
  onToggleLiveUpdates,
  isConnected,
  lastUpdated
}) {
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <HeaderContainer>
      <Title>
        <HogwartsText>Hogwarts</HogwartsText>
        <HouseText>House Leaderboard</HouseText>
      </Title>

      <HeaderControls>
        <TimeControls>
          <TimeLabel>Time Window:</TimeLabel>
          {timeWindows.map((window) => (
            <TimeButton
              key={window.value}
              active={currentTimeWindow === window.value}
              onClick={() => onTimeWindowChange(window.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {window.label}
            </TimeButton>
          ))}
        </TimeControls>

        <LiveControls>
          <LiveButton
            active={isLiveUpdatesEnabled}
            onClick={onToggleLiveUpdates}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLiveUpdatesEnabled ? <Pause size={16} /> : <Play size={16} />}
            Live Updates: {isLiveUpdatesEnabled ? 'ON' : 'OFF'}
          </LiveButton>

          <ConnectionStatus>
            <StatusDot connected={isConnected} />
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </ConnectionStatus>
        </LiveControls>
      </HeaderControls>

      {lastUpdated && (
        <LastUpdated>
          Last updated: {formatTime(lastUpdated)}
        </LastUpdated>
      )}
    </HeaderContainer>
  );
}

export default Header;