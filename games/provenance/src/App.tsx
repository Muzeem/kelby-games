import { Routes, Route, Navigate } from 'react-router-dom';
import { MainMenu } from './components/MainMenu';
import { GameScreen } from './components/GameScreen';
import { AuctionScreen } from './components/AuctionScreen';
import { HighScoresScreen } from './components/HighScoresScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="w-full h-full">
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/play" element={<GameScreen />} />
          <Route path="/auction" element={<AuctionScreen />} />
          <Route path="/scores" element={<HighScoresScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}
