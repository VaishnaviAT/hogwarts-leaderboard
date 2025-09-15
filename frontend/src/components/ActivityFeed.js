import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';

const ActivityContainer = styled.div`
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #f0f6fc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RefreshButton = styled(motion.button)`
  background: #21262d;
  border: 1px solid #30363d;
  color: #f0f6fc;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.15s ease;

  &:hover {
    background: #30363d;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActivityFeed = styled.div`
  max-height: 600px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #21262d;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #484f58;
  }
`;

const ActivityItem = styled(motion.div)`
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid ${props => props.houseColor};
  transition: all 0.15s ease;

  &:hover {
    background: #30363d;
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ActivityHouse = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${props => props.houseColor};
`;

const ActivityPoints = styled.span`
  font-weight: 700;
  font-size: 1.2rem;
  color: ${props => props.points > 0 ? '#3fb950' : '#f85149'};
`;

const ActivityReason = styled.div`
  color: #8b949e;
  font-style: italic;
  margin-bottom: 0.5rem;
  line-height: 1.4;
`;

const ActivityTime = styled.div`
  color: #8b949e;
  font-size: 0.8rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #8b949e;
`;

const Spinner = styled(motion.div)`
  width: 32px;
  height: 32px;
  border: 3px solid #30363d;
  border-top: 3px solid #58a6ff;
  border-radius: 50%;
  margin-bottom: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #8b949e;
  font-style: italic;
`;

const houseColors = {
  'Gryffindor': '#740001',
  'Slytherin': '#1a472a',
  'Ravenclaw': '#0e1a40',
  'Hufflepuff': '#ecb939'
};

function ActivityFeedComponent({ data, onRefresh }) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!data) {
    return (
      <ActivityContainer>
        <SectionHeader>
          <SectionTitle>
            <Activity size={24} />
            Recent Activity
          </SectionTitle>
        </SectionHeader>
        <LoadingContainer>
          <Spinner
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading activity...</p>
        </LoadingContainer>
      </ActivityContainer>
    );
  }

  return (
    <ActivityContainer>
      <SectionHeader>
        <SectionTitle>
          <Activity size={24} />
          Recent Activity
        </SectionTitle>
        <RefreshButton
          onClick={handleRefresh}
          disabled={isRefreshing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
          >
            <RefreshCw size={16} />
          </motion.div>
          Refresh
        </RefreshButton>
      </SectionHeader>

      <ActivityFeed>
        {data.length === 0 ? (
          <EmptyState>
            No recent activity
          </EmptyState>
        ) : (
          <AnimatePresence>
            {data.map((activity, index) => (
              <ActivityItem
                key={`${activity.id}-${activity.timestamp}`}
                houseColor={houseColors[activity.house] || activity.color}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                <ActivityHeader>
                  <ActivityHouse houseColor={houseColors[activity.house] || activity.color}>
                    {activity.house}
                  </ActivityHouse>
                  <ActivityPoints points={activity.points}>
                    {activity.points > 0 ? '+' : ''}{activity.points}
                  </ActivityPoints>
                </ActivityHeader>

                {activity.reason && (
                  <ActivityReason>
                    "{activity.reason}"
                  </ActivityReason>
                )}

                <ActivityTime>
                  {formatTime(activity.timestamp)}
                </ActivityTime>
              </ActivityItem>
            ))}
          </AnimatePresence>
        )}
      </ActivityFeed>
    </ActivityContainer>
  );
}

export default ActivityFeedComponent;