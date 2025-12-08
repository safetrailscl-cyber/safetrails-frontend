import { Link, useLocation } from "react-router-dom";
import { Map, User, Settings } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? "text-blue-600" : "text-gray-500";

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-inner border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        <Link to="/map" className={`flex flex-col items-center ${isActive("/map")}`}>
          <Map size={24} />
          <span className="text-xs mt-1">Mapa</span>
        </Link>

        <Link to="/profile" className={`flex flex-col items-center ${isActive("/profile")}`}>
          <User size={24} />
          <span className="text-xs mt-1">Perfil</span>
        </Link>

        <Link to="/settings" className={`flex flex-col items-center ${isActive("/settings")}`}>
          <Settings size={24} />
          <span className="text-xs mt-1">Config</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
