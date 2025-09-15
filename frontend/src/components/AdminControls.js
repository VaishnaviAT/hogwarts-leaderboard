import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Square, 
  Zap, 
  Plus, 
  Home 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ControlsContainer = styled.div`
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #30363d;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #21262d;
  border-bottom: 1px solid #30363d;
`;

const PanelTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToggleButton = styled(motion.button)`
  background: #58a6ff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.15s ease;

  &:hover {
    background: #4493f8;
  }
`;

const ControlsContent = styled(motion.div)`
  padding: 1.5rem;
`;

const ControlGroup = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const GroupTitle = styled.h4`
  color: #f0f6fc;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GeneratorControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const ControlButton = styled(motion.button)`
  background: ${props => {
    if (props.variant === 'start') return '#3fb950';
    if (props.variant === 'stop') return '#f85149';
    if (props.variant === 'primary') return '#58a6ff';
    return '#21262d';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'start') return '#3fb950';
    if (props.variant === 'stop') return '#f85149';
    if (props.variant === 'primary') return '#58a6ff';
    return '#30363d';
  }};
  color: ${props => ['start', 'stop', 'primary'].includes(props.variant) ? 'white' : '#f0f6fc'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => {
      if (props.variant === 'start') return '#2ea043';
      if (props.variant === 'stop') return '#da3633';
      if (props.variant === 'primary') return '#4493f8';
      return '#30363d';
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GeneratorStatus = styled.div`
  color: #8b949e;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.running ? '#3fb950' : '#f85149'};
  animation: ${props => props.running ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const EntryForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #8b949e;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Select = styled.select`
  background: #21262d;
  border: 1px solid #30363d;
  color: #f0f6fc;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #58a6ff;
    box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.3);
  }

  option {
    background: #21262d;
    color: #f0f6fc;
  }
`;

const Input = styled.input`
  background: #21262d;
  border: 1px solid #30363d;
  color: #f0f6fc;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #58a6ff;
    box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.3);
  }

  &::placeholder {
    color: #6e7681;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const FullWidthField = styled(FormField)`
  grid-column: span 2;

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

function AdminControls({ onAddEntry, onControlGenerator, generatorStatus }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [entryForm, setEntryForm] = useState({
    house: '',
    points: '',
    reason: ''
  });

  const houses = ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'];

  const handleFormChange = (field, value) => {
    setEntryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!entryForm.house || entryForm.points === '') {
      toast.error('Please fill in all required fields');
      return;
    }

    const points = parseInt(entryForm.points);
    if (isNaN(points) || points < -100 || points > 100) {
      toast.error('Points must be between -100 and 100');
      return;
    }

    onAddEntry({
      house: entryForm.house,
      points: points,
      reason: entryForm.reason.trim() || null
    });

    // Reset form
    setEntryForm({
      house: '',
      points: '',
      reason: ''
    });
  };

  return (
    <ControlsContainer>
      <PanelHeader>
        <PanelTitle>
          <Settings size={20} />
          Admin Controls
        </PanelTitle>
        <ToggleButton
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? 'Hide' : 'Show'}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </ToggleButton>
      </PanelHeader>

      <AnimatePresence>
        {isExpanded && (
          <ControlsContent
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ControlGroup>
              <GroupTitle>
                <Zap size={18} />
                Data Generator
              </GroupTitle>
              
              <GeneratorControls>
                <ControlButton
                  variant="start"
                  onClick={() => onControlGenerator('start', { intervalMinutes: 1 })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={16} />
                  Start
                </ControlButton>

                <ControlButton
                  variant="stop"
                  onClick={() => onControlGenerator('stop')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Square size={16} />
                  Stop
                </ControlButton>

                <ControlButton
                  onClick={() => onControlGenerator('generate')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap size={16} />
                  Generate Entry
                </ControlButton>
              </GeneratorControls>

              <GeneratorStatus>
                <StatusIndicator running={generatorStatus.isRunning} />
                Status: {generatorStatus.isRunning ? 'Running' : 'Stopped'}
              </GeneratorStatus>
            </ControlGroup>

            <ControlGroup>
              <GroupTitle>
                <Plus size={18} />
                Add Manual Entry
              </GroupTitle>
              
              <EntryForm onSubmit={handleSubmit}>
                <FormField>
                  <Label htmlFor="house">House *</Label>
                  <Select
                    id="house"
                    value={entryForm.house}
                    onChange={(e) => handleFormChange('house', e.target.value)}
                    required
                  >
                    <option value="">Select House</option>
                    {houses.map(house => (
                      <option key={house} value={house}>
                        <Home size={16} style={{ marginRight: '0.5rem' }} />
                        {house}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField>
                  <Label htmlFor="points">Points *</Label>
                  <Input
                    type="number"
                    id="points"
                    placeholder="Points (-100 to 100)"
                    min="-100"
                    max="100"
                    value={entryForm.points}
                    onChange={(e) => handleFormChange('points', e.target.value)}
                    required
                  />
                </FormField>

                <FullWidthField>
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Input
                    type="text"
                    id="reason"
                    placeholder="Reason for points change"
                    maxLength="255"
                    value={entryForm.reason}
                    onChange={(e) => handleFormChange('reason', e.target.value)}
                  />
                </FullWidthField>

                <ControlButton
                  type="submit"
                  variant="primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={16} />
                  Add Entry
                </ControlButton>
              </EntryForm>
            </ControlGroup>
          </ControlsContent>
        )}
      </AnimatePresence>
    </ControlsContainer>
  );
}

export default AdminControls;