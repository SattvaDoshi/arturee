import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Film,
  Upload,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  MonitorPlay,
  IndianRupee,
  Briefcase,
} from "lucide-react";

const navItems = [
  { label: "Overview",  icon: LayoutDashboard, to: "/admin" },
  { label: "Slider",    icon: MonitorPlay,     to: "/admin/slider" },
  { label: "Revenue",   icon: IndianRupee,     to: "/admin/revenue" },
  { label: "Videos",    icon: Film,            to: "/admin/videos" },
  { label: "Upload",    icon: Upload,           to: "/admin/upload" },
  { label: "Users",     icon: Users,            to: "/admin/users" },
  { label: "Artists",   icon: UserCheck,        to: "/admin/artists" },
  { label: "Applications", icon: Briefcase,     to: "/admin/applications" },
];


const AdminSidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col shrink-0 transition-all duration-300 z-30"
      style={{
        width: collapsed ? "4.5rem" : "14rem",
        background:
          "linear-gradient(180deg,#0c1929 0%,#0d2137 60%,#071523 100%)",
        borderRight: "1px solid rgba(77,208,225,0.12)",
      }}
    >
      {/* Logo row */}
      <div
        className={`flex items-center gap-2 px-4 py-5 border-b border-white/10 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#4DD0E1,#C0E863)" }}
            >
              <Shield className="w-4 h-4 text-[#051d2e]" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-white/90">
              Admin
            </span>
          </div>
        )}
        {collapsed && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#4DD0E1,#C0E863)" }}
          >
            <Shield className="w-4 h-4 text-[#051d2e]" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={label}
              to={to}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all
                ${
                  active
                    ? "text-[#051d2e] shadow-[3px_3px_0px_rgba(77,208,225,0.25)]"
                    : "text-white/50 hover:bg-white/8 hover:text-white/90"
                }`}
              style={
                active
                  ? { background: "linear-gradient(135deg,#4DD0E1,#C0E863)" }
                  : {}
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-2 pb-4 border-t border-white/10 pt-3">
        <Link
          to="/admin/settings"
          title={collapsed ? "Settings" : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide text-white/50 hover:bg-white/8 hover:text-white/90 transition-all"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
