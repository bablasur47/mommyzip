import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogout, useGetBotStatus } from "@workspace/api-client-react";
import { LayoutDashboard, Server, Users, Key, BrainCircuit, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/servers", label: "Servers", icon: Server },
  { href: "/users", label: "Users", icon: Users },
  { href: "/apis", label: "API Keys", icon: Key },
  { href: "/personality", label: "Personality", icon: BrainCircuit },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: botStatus } = useGetBotStatus();

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        localStorage.removeItem("dashboard_token");
        setLocation("/login");
      },
    },
  });

  function isActive(href: string) {
    return location === href || location.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ── Desktop sidebar ── */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="hidden md:flex w-56 flex-col shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-xl"
      >
        {/* Logo / Bot info */}
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            {botStatus?.avatarUrl ? (
              <img
                src={botStatus.avatarUrl}
                alt={botStatus.username}
                className="w-8 h-8 rounded-full ring-1 ring-white/10 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-base">
                🌸
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white/85 truncate leading-tight">
                {botStatus?.username ?? "mommy"}
              </div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest">Dashboard</div>
            </div>
          </div>
        </div>

        {/* Online badge */}
        {botStatus && (
          <div className="px-4 py-2.5 border-b border-white/5">
            <div className={`flex items-center gap-1.5 text-[11px] font-medium ${botStatus.online ? "text-emerald-400" : "text-red-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${botStatus.online ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]" : "bg-red-400"} animate-pulse`} />
              {botStatus.online ? "Online" : "Offline"}
              {botStatus.online && <span className="text-white/25 font-normal ml-auto">{botStatus.ping}ms</span>}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item, idx) => {
            const active = isActive(item.href);
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.06, duration: 0.3, ease: "easeOut" }}
              >
              <Link href={item.href}>
                <span className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-150 cursor-pointer relative ${
                  active
                    ? "bg-white/6 text-white/90 font-medium accent-bar"
                    : "text-white/38 hover:text-white/70 hover:bg-white/4"
                }`}>
                  <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-[hsl(192,90%,50%)]" : ""}`} />
                  {item.label}
                  {active && <ChevronRight className="w-3 h-3 ml-auto text-white/20" />}
                </span>
              </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/30 hover:text-red-400/80 hover:bg-red-500/8 rounded-md text-sm h-9 px-3"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="w-4 h-4 mr-2.5" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* ── Main content ── */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="flex-1 flex flex-col min-w-0"
      >
        {/* Mobile top bar */}
        <div className="md:hidden h-14 border-b border-white/5 flex items-center justify-between px-4 bg-black/50 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            {botStatus?.avatarUrl ? (
              <img src={botStatus.avatarUrl} alt={botStatus.username} className="w-7 h-7 rounded-full ring-1 ring-white/10" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm">🌸</div>
            )}
            <span className="font-semibold text-sm text-white/80">{botStatus?.username ?? "mommy"}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/30 hover:text-red-400/80 w-8 h-8"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 pb-24 md:pb-8 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </motion.main>

      {/* ── Mobile bottom nav ── */}
      <motion.nav
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        className="md:hidden fixed bottom-0 inset-x-0 bg-black/80 backdrop-blur border-t border-white/5 z-20 flex"
      >
        {navItems.map((item, idx) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + idx * 0.05, duration: 0.25 }}
            className="flex-1"
          >
          <Link href={item.href}>
            <span className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
              isActive(item.href) ? "text-[hsl(192,90%,50%)]" : "text-white/30"
            }`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </span>
          </Link>
          </motion.div>
        ))}
      </motion.nav>
    </div>
  );
}
