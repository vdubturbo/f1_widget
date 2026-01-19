import { Dashboard } from './components/Dashboard';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  // Establish WebSocket connection for viewer tracking
  useWebSocket();

  return <Dashboard />;
}

export default App;
