import { useGetBotStats, useGetBotStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Users, MessageSquare, Activity, Cpu, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedPage, StaggerContainer, StaggerItem } from "@/components/animations";

export function Overview() {
  const { data: stats, isLoading: statsLoading } = useGetBotStats();
  const { data: status, isLoading: statusLoading } = useGetBotStatus();

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Overview ✨</h1>
          <p className="text-muted-foreground mt-1">Real-time stats for mommy's operations</p>
        </div>
        <div className="flex items-center gap-2">
          {statusLoading ? (
            <Skeleton className="w-28 h-8 rounded-full" />
          ) : (
            <div className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border ${
              status?.online
                ? "bg-green-500/10 text-green-400 border-green-500/30 shadow shadow-green-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}>
              <div className={`w-2 h-2 rounded-full ${status?.online ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
              {status?.online ? "ONLINE 💚" : "OFFLINE"}
            </div>
          )}
        </div>
      </div>

      {!statusLoading && status && (
        <Card className="bg-gradient-to-r from-primary/10 via-purple-500/5 to-card/50 border-primary/30 overflow-hidden relative kawaii-glow">
          <div className="absolute inset-0 kawaii-shimmer pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-6 relative z-10">
            {status.avatarUrl ? (
              <img
                src={status.avatarUrl}
                alt="Bot Avatar"
                className="w-16 h-16 rounded-2xl ring-2 ring-primary/40 shadow-lg shadow-primary/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/20 flex items-center justify-center border border-primary/30 text-3xl shadow-lg">
                🌸
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {status.username}
                <span className="text-muted-foreground text-lg font-normal">#{status.discriminator}</span>
              </h2>
              <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 text-accent">
                  <Cpu className="w-4 h-4" /> Active
                </span>
                <span className="flex items-center gap-1.5 text-primary">
                  <Zap className="w-4 h-4" /> {status.ping ?? 0}ms ping
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem><StatCard title="Total Servers" icon={Server} value={stats?.totalServers} loading={statsLoading} color="primary" emoji="🌸" /></StaggerItem>
        <StaggerItem><StatCard title="Total Users" icon={Users} value={stats?.totalUsers} loading={statsLoading} color="purple" emoji="💖" /></StaggerItem>
        <StaggerItem><StatCard title="Messages" icon={MessageSquare} value={stats?.totalMessages} loading={statsLoading} color="accent" emoji="💬" /></StaggerItem>
        <StaggerItem><StatCard title="Active Today" icon={Activity} value={stats?.activeToday} loading={statsLoading} color="yellow" emoji="⚡" /></StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StaggerItem>
          <QuickCard
            emoji="🧠"
            title="Personality"
            desc="Customize mommy's character, system prompt and AI provider"
            href="/personality"
          />
        </StaggerItem>
        <StaggerItem>
          <QuickCard
            emoji="🔑"
            title="API Keys"
            desc="Manage Groq, Gemini and Nvidia keys with auto-rotation"
            href="/apis"
          />
        </StaggerItem>
        <StaggerItem>
          <QuickCard
            emoji="🌸"
            title="Servers"
            desc="View all connected guilds and configure per-server settings"
            href="/servers"
          />
        </StaggerItem>
      </StaggerContainer>
    </AnimatedPage>
  );
}

function StatCard({
  title, icon: Icon, value, loading, color, emoji,
}: {
  title: string;
  icon: React.ElementType;
  value?: number;
  loading: boolean;
  color: string;
  emoji: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "from-primary/20 to-primary/5 border-primary/30 text-primary shadow-primary/10",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400 shadow-purple-500/10",
    accent: "from-accent/20 to-accent/5 border-accent/30 text-accent shadow-accent/10",
    yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400 shadow-yellow-500/10",
  };

  return (
    <Card className={`bg-gradient-to-br ${colorMap[color]} backdrop-blur border kawaii-card shadow-lg relative overflow-hidden`}>
      <div className="absolute top-2 right-3 text-2xl opacity-20 pointer-events-none">{emoji}</div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
        <Icon className={`h-4 w-4 opacity-70 ${colorMap[color].split(" ").find(c => c.startsWith("text-")) ?? "text-primary"}`} />
      </CardHeader>
      <CardContent className="pb-4">
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-3xl font-bold tracking-tighter">{value?.toLocaleString() ?? "0"}</div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickCard({ emoji, title, desc, href }: { emoji: string; title: string; desc: string; href: string }) {
  return (
    <a href={`/dashboard${href}`}>
      <Card className="bg-card/40 border-border/60 hover:border-primary/40 kawaii-card cursor-pointer group h-full">
        <CardContent className="p-5">
          <div className="text-2xl mb-3 group-hover:scale-110 transition-transform inline-block">{emoji}</div>
          <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
        </CardContent>
      </Card>
    </a>
  );
}
