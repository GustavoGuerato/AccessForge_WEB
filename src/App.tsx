import { useAuth, type User } from "./auth/AuthContext";
import Login from "./pages/Login/Login";
import Workspaces from "./pages/Worskpaces/Workspaces";

type RefreshResponse = { token: string };
function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "username" in value &&
    typeof value.username === "string" &&
    "email" in value &&
    typeof value.email === "string"
  );
}
