import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, Menu, Shield } from "lucide-react";

const AdminTopbar = ({ onMobileMenuToggle }) => {
  return (
    <header
      className="sticky top-0 z-20 h-16 px-4 md:px-6 flex items-center justify-between border-b"
      style={{
        background: "rgba(12,25,41,0.95)",
        borderColor: "rgba(77,208,225,0.12)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white/70 transition"
        onClick={onMobileMenuToggle}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Admin badge */}
      <div
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#4DD0E1]/30"
        style={{ background: "rgba(77,208,225,0.08)" }}
      >
        <Shield className="w-3.5 h-3.5 text-[#4DD0E1]" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[#4DD0E1]">
          Admin Panel
        </span>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm mx-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Search users, content, reports..."
          className="w-full text-sm py-2 pl-9 pr-4 rounded-full focus:outline-none focus:ring-2 transition placeholder:text-white/25 text-white/80"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(77,208,225,0.15)",
            "--tw-ring-color": "rgba(77,208,225,0.35)",
          }}
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Bell */}
        <button className="relative p-2 hover:bg-white/10 rounded-full transition">
          <Bell className="w-5 h-5 text-white/70" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#0c1929]" />
        </button>

        {/* Admin user */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10 ml-1">
          <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-[#4DD0E1]/40">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] font-black text-white/90 uppercase tracking-wide">
              Admin
            </p>
            <p className="text-[10px] text-white/40">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
