import { Dashboard } from './components/Dashboard';
import { AdminPage } from './components/AdminPage';
import { useWebSocket } from './hooks/useWebSocket';
import { ConfigProvider } from './hooks/useConfig';

function App() {
  // Establish WebSocket connection for viewer tracking
  useWebSocket();

  const isDev = import.meta.env.DEV;
  const path = window.location.pathname;

  // Dev-only admin route
  if (isDev && path === '/admin') {
    return <AdminPage />;
  }

  return (
    <ConfigProvider>
      <Dashboard />
    </ConfigProvider>
  );
}

export default App;
