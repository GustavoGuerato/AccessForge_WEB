import { useAuth } from "./auth/AuthContext";
import Login from "./pages/Login/Login";
import Workspaces from "./pages/Worskpaces/Workspaces";
function App() {
  const { user, token } = useAuth();

  if (user && token) {
    return <Workspaces />;
  }

  return <Login />;
}

export default App;
