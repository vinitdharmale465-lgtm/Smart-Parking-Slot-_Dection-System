import { useAuth } from "../auth.jsx";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="pathfinder-auth-shell">
      <header className="pathfinder-auth-bar">
        <div className="pathfinder-auth-brand">
          <strong>Path Finder</strong>
          <span>Signed in as {user?.name || "User"}</span>
        </div>
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <iframe
        title="Path Finder Smart Parking dashboard"
        src="/pathfinder-dashboard.html"
        className="pathfinder-dashboard-frame"
      />

      <style>{`
        .pathfinder-auth-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f2efe6;
        }
        .pathfinder-auth-bar {
          min-height: 58px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 10px 24px;
          color: #fff;
          background: #262d36;
          border-bottom: 4px solid #f5b800;
          font-family: "Segoe UI", Arial, sans-serif;
        }
        .pathfinder-auth-brand {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
        }
        .pathfinder-auth-brand strong {
          font-size: 19px;
        }
        .pathfinder-auth-brand span {
          color: #d8dee7;
          font-size: 14px;
        }
        .pathfinder-auth-bar button {
          padding: 8px 14px;
          border: 1px solid #f5b800;
          border-radius: 6px;
          color: #1b222b;
          background: #f5b800;
          font-weight: 700;
          cursor: pointer;
        }
        .pathfinder-dashboard-frame {
          display: block;
          width: 100%;
          flex: 1;
          min-height: calc(100vh - 62px);
          border: 0;
          background: #f2efe6;
        }
        @media (max-width: 560px) {
          .pathfinder-auth-bar { padding: 9px 12px; }
          .pathfinder-auth-brand { gap: 6px; flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
