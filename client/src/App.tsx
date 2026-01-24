import { useState, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { AdminPage } from './components/AdminPage';
import { IntroVideo } from './components/IntroVideo';
import { useWebSocket } from './hooks/useWebSocket';
import { ConfigProvider } from './hooks/useConfig';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  // Establish WebSocket connection for viewer tracking
  useWebSocket();

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  const isDev = import.meta.env.DEV;
  const path = window.location.pathname;

  // Dev-only admin route
  if (isDev && path === '/admin') {
    return <AdminPage />;
  }

  // Show intro video first, then dashboard
  if (showIntro) {
    return <IntroVideo onComplete={handleIntroComplete} />;
  }

  return (
    <ConfigProvider>
      <Dashboard />
    </ConfigProvider>
  );
}

export default App;
