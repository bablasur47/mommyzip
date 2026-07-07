import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, MessageSquare, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearPortalToken } from "@/lib/portal";

const navItems = [
  { href: "/portal/home", label: "Home", icon: Home },
  { href: "/portal/history", label: "History", icon: MessageSquare },
  { href: "/portal/settings", label: "Settings", icon: Settings },
];

export function PortalLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  function handleLogout() {
    clearPortalToken();
    setLocation("/portal");
  }

  function isActive(href: string) {
    return location === href || location.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 border-r border-white/5 bg-black/40 backdrop-blur-xl flex-col shrink-0">
        <div className="h-16 flex items-center px-4 border-b border-white/5 gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-base">
            🌸
          </div>
          <div>
            <div className="font-semibold text-sm text-white/85 leading-tight">mommy</div>
            <div className="text-[10px] text-white/30 uppercase tracking-widest">Your portal</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-150 cursor-pointer relative ${
                  active
                    ? "bg-white/6 text-white/90 font-medium accent-bar"
                    : "text-white/38 hover:text-white/70 hover:bg-white/4"
                }`}>
                  <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-[hsl(192,90%,50%)]" : ""}`} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/30 hover:text-red-400/80 hover:bg-red-500/8 rounded-md text-sm h-9 px-3"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2.5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden h-14 border-b border-white/5 flex items-center justify-between px-4 bg-black/50 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm">🌸</div>
            <span className="font-semibold text-sm text-white/80">mommy</span>
          </div>
          <Button variant="ghost" size="icon" className="text-white/30 hover:text-red-400/80 w-8 h-8" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 pb-24 md:pb-8 md:p-8">
          <div className="max-w-3xl mx-auto">{children}</div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-black/80 backdrop-blur border-t border-white/5 z-20 flex">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex-1">
            <span className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
              isActive(item.href) ? "text-[hsl(192,90%,50%)]" : "text-white/30"
            }`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
