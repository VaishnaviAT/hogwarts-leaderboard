import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';

const LeaderboardContainer = styled.div`
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

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

const HouseCard = styled(motion.div)`
  background: #21262d;
  border: 2px solid ${props => {
    if (props.rank === 1) return '#ffd700';
    if (props.rank === 2) return '#c0c0c0';
    if (props.rank === 3) return '#cd7f32';
    return '#30363d';
  }};
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => {
    if (props.rank === 1) return '0 0 20px rgba(255, 215, 0, 0.3)';
    if (props.rank === 2) return '0 0 15px rgba(192, 192, 192, 0.3)';
    if (props.rank === 3) return '0 0 10px rgba(205, 127, 50, 0.3)';
    return 'none';
  }};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.houseColor};
    opacity: 0.8;
  }
`;

const HouseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const HouseName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  font-family: 'Cinzel', serif;
  color: ${props => props.houseColor};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RankBadge = styled.div`
  background: #0d1117;
  color: #f0f6fc;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  border: 2px solid #30363d;
  position: relative;
`;

const HouseStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.span`
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #f0f6fc;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #8b949e;
  font-style: italic;
`;

const houseColors = {
  'Gryffindor': '#ae0001',
  'Slytherin': '#2a623d',
  'Ravenclaw': '#222f5b',
  'Hufflepuff': '#f0c75e'
};

const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return <Trophy size={20} color="#ffd700" />;
    case 2:
      return <Medal size={20} color="#c0c0c0" />;
    case 3:
      return <Award size={20} color="#cd7f32" />;
    default:
      return null;
  }
};

function Leaderboard({ data }) {
  if (!data) {
    return (
      <LeaderboardContainer>
        <SectionHeader>
          <SectionTitle>
            <Trophy size={24} />
            House Standings
          </SectionTitle>
        </SectionHeader>
        <LoadingContainer>
          <Spinner
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading leaderboard...</p>
        </LoadingContainer>
      </LeaderboardContainer>
    );
  }

  if (data.length === 0) {
    return (
      <LeaderboardContainer>
        <SectionHeader>
          <SectionTitle>
            <Trophy size={24} />
            House Standings
          </SectionTitle>
        </SectionHeader>
        <EmptyState>
          No leaderboard data available
        </EmptyState>
      </LeaderboardContainer>
    );
  }

  return (
    <LeaderboardContainer>
      <SectionHeader>
        <SectionTitle>
          <Trophy size={24} />
          House Standings
        </SectionTitle>
      </SectionHeader>

      <LeaderboardList>
        <AnimatePresence>
          {data.map((house, index) => (
            <HouseCard
              key={house.house}
              rank={house.rank}
              houseColor={houseColors[house.house] || '#30363d'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <HouseHeader>
                <HouseName houseColor={houseColors[house.house]}>
                  {getRankIcon(house.rank)}
                  {house.house}
                </HouseName>
                <RankBadge>
                  {house.rank}
                </RankBadge>
              </HouseHeader>

              <HouseStats>
                <StatItem>
                  <StatValue>{house.total_points}</StatValue>
                  <StatLabel>Total Points</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{house.total_entries}</StatValue>
                  <StatLabel>Entries</StatLabel>
                </StatItem>
              </HouseStats>
            </HouseCard>
          ))}
        </AnimatePresence>
      </LeaderboardList>
    </LeaderboardContainer>
  );
}

export default Leaderboard;