import { Link, useLocation } from "wouter";
import { Home, TrendingUp, Book, BarChart3, User } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/activity", icon: TrendingUp, label: "Track" },
    { path: "/journal", icon: Book, label: "Journal" },
    { path: "/progress", icon: BarChart3, label: "Progress" },
    { path: "/social", icon: User, label: "Social" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 px-6 py-3">
      <div className="flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} href={path}>
            <a className={`flex flex-col items-center space-y-1 ${
              location === path ? "text-primary" : "text-gray-400"
            }`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
