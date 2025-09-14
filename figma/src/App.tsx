import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChickenBoxGrid } from './components/ChickenBoxGrid';
import { ResultsScreen } from './components/ResultsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'voting' | 'results'>('welcome');
  const [username, setUsername] = useState('');
  const [userVotes, setUserVotes] = useState<Record<number, { guess: string; ranking?: number }>>({});

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    setCurrentScreen('voting');
  };

  const handleVoteSubmit = (boxNumber: number, guess: string, ranking?: number) => {
    setUserVotes(prev => ({
      ...prev,
      [boxNumber]: { guess, ranking }
    }));
  };

  const handleViewResults = () => {
    setCurrentScreen('results');
  };

  const handleBackToVoting = () => {
    setCurrentScreen('voting');
  };

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'welcome' && (
        <WelcomeScreen onSubmit={handleUsernameSubmit} />
      )}
      {currentScreen === 'voting' && (
        <ChickenBoxGrid 
          username={username}
          userVotes={userVotes}
          onVoteSubmit={handleVoteSubmit}
          onViewResults={handleViewResults}
        />
      )}
      {currentScreen === 'results' && (
        <ResultsScreen 
          username={username}
          userVotes={userVotes}
          onBackToVoting={handleBackToVoting}
        />
      )}
    </div>
  );
}