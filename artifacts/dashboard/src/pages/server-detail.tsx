import { useState, useEffect } from "react";
import { useGetServer, useGetNsfwChannels } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Server, Users, MessageSquare, Clock, Hash, ShieldAlert, Settings, Save, Bot, Volume2, Zap, BookOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface ServerConfig {
  welcomeEnabled: boolean;
  welcomeChannelId: string;
  pingChannelId: string;
  prefix: string;
  aiEnabled: boolean;
  customPrompt: string;
}

export function ServerDetail() {
  const params = useParams();
  const guildId = params.guildId as string;
  const { data: server, isLoading: serverLoading } = useGetServer(guildId);
  const { data: nsfwChannels, isLoading: nsfwLoading } = useGetNsfwChannels(guildId);
  const { toast } = useToast();

  const [config, setConfig] = useState<ServerConfig>({
    welcomeEnabled: false,
    welcomeChannelId: "",
    pingChannelId: "",
    prefix: "!",
    aiEnabled: true,
    customPrompt: "",
  });
  const [configLoading, setConfigLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!guildId) return;
    const token = localStorage.getItem("dashboard_token");
    fetch(`/api/servers/${guildId}/config`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => {
        setConfig({
          welcomeEnabled: d.welcomeEnabled ?? false,
          welcomeChannelId: d.welcomeChannelId ?? "",
          pingChannelId: d.pingChannelId ?? "",
          prefix: d.prefix ?? "!",
          aiEnabled: d.aiEnabled ?? true,
          customPrompt: d.customPrompt ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setConfigLoading(false));
  }, [guildId]);

  async function saveConfig() {
    setSaving(true);
    try {
      const token = localStorage.getItem("dashboard_token");
      const res = await fetch(`/api/servers/${guildId}/config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Saved! 🌸", description: "Server configuration updated." });
    } catch {
      toast({ title: "Error", description: "Could not save config.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (serverLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!server) {
    return <div className="text-muted-foreground">Server not found</div>;
  }

  return (
    <div className="space-y-6 slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/servers">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-xl">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          {server.iconUrl ? (
            <img src={server.iconUrl} alt={server.name} className="w-12 h-12 rounded-xl ring-2 ring-primary/30" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center">
              <Server className="w-5 h-5 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight gradient-text">{server.name}</h1>
            <p className="text-xs text-muted-foreground font-mono">{server.guildId}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-card border-primary/20 kawaii-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20 text-primary"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-xl font-bold">{server.memberCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-card border-purple-500/20 kawaii-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400"><MessageSquare className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Messages</p>
              <p className="text-xl font-bold">{server.totalMessages.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-card border-accent/20 kawaii-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/20 text-accent"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm font-semibold">{format(new Date(server.joinedAt), "MMM d, yyyy")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Server Configuration ── */}
      <Card className="bg-card/40 border-border/60 kawaii-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Server Configuration
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Customize how mommy behaves in this server
              </CardDescription>
            </div>
            <span className="text-2xl">⚙️</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {configLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : (
            <>
              {/* AI Enabled */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <Label className="font-medium text-sm">mommy AI Chat</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Enable or disable mommy's AI responses in this server</p>
                  </div>
                </div>
                <Switch
                  checked={config.aiEnabled}
                  onCheckedChange={(v) => setConfig((c) => ({ ...c, aiEnabled: v }))}
                />
              </div>

              {/* Welcome messages */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                    <span className="text-base">👋</span>
                  </div>
                  <div>
                    <Label className="font-medium text-sm">Welcome Messages</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Greet new members when they join</p>
                  </div>
                </div>
                <Switch
                  checked={config.welcomeEnabled}
                  onCheckedChange={(v) => setConfig((c) => ({ ...c, welcomeEnabled: v }))}
                />
              </div>

              {/* Welcome channel */}
              {config.welcomeEnabled && (
                <div className="p-4 rounded-xl bg-background/40 border border-border/50 space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    Welcome Channel ID
                  </Label>
                  <p className="text-xs text-muted-foreground">Paste the channel ID where mommy should send welcome messages</p>
                  <Input
                    placeholder="e.g. 1234567890123456789"
                    value={config.welcomeChannelId}
                    onChange={(e) => setConfig((c) => ({ ...c, welcomeChannelId: e.target.value }))}
                    className="bg-background/50 border-border/60 rounded-xl font-mono text-sm max-w-xs"
                  />
                </div>
              )}

              {/* Random ping channel */}
              <div className="p-4 rounded-xl bg-background/40 border border-border/50 space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-accent" />
                  Random Ping Channel ID
                </Label>
                <p className="text-xs text-muted-foreground">Channel where mommy randomly starts conversations (leave blank for any channel)</p>
                <Input
                  placeholder="e.g. 1234567890123456789"
                  value={config.pingChannelId}
                  onChange={(e) => setConfig((c) => ({ ...c, pingChannelId: e.target.value }))}
                  className="bg-background/50 border-border/60 rounded-xl font-mono text-sm max-w-xs"
                />
              </div>

              {/* Command prefix */}
              <div className="p-4 rounded-xl bg-background/40 border border-border/50 space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-sm">⌨️</span>
                  Command Prefix
                </Label>
                <p className="text-xs text-muted-foreground">Prefix for text commands in this server (default: !)</p>
                <Input
                  placeholder="!"
                  value={config.prefix}
                  onChange={(e) => setConfig((c) => ({ ...c, prefix: e.target.value }))}
                  className="bg-background/50 border-border/60 rounded-xl text-sm w-20 text-center font-mono"
                  maxLength={5}
                />
              </div>

              {/* Custom server prompt */}
              <div className="p-4 rounded-xl bg-background/40 border border-border/50 space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  Custom Server Instructions
                </Label>
                <p className="text-xs text-muted-foreground">
                  Extra instructions mommy follows only in this server — e.g. "Always speak formally" or "Never discuss competitors"
                </p>
                <Textarea
                  placeholder="e.g. Is server mein hamesha formal reh aur sirf tech topics pe baat kar..."
                  value={config.customPrompt}
                  onChange={(e) => setConfig((c) => ({ ...c, customPrompt: e.target.value }))}
                  className="bg-background/50 border-border/60 rounded-xl text-sm resize-none"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{config.customPrompt.length}/500</p>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  onClick={saveConfig}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow shadow-primary/30 font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Config ✨"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* NSFW Channels */}
      <Card className="bg-card/40 border-border/60 kawaii-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            NSFW Channels
          </CardTitle>
          <CardDescription className="text-xs">Channels where mommy's NSFW mode is toggled on/off via /nsfw command</CardDescription>
        </CardHeader>
        <CardContent>
          {nsfwLoading ? (
            <Skeleton className="h-20 w-full rounded-xl" />
          ) : nsfwChannels && nsfwChannels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nsfwChannels.map((channel) => (
                <div
                  key={channel.channelId}
                  className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/50"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{channel.channelName}</span>
                  </div>
                  {channel.enabled ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 uppercase shrink-0">
                      NSFW ON
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-muted text-muted-foreground border border-border/50 uppercase shrink-0">
                      OFF
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border/50 rounded-xl bg-background/20">
              <div className="text-2xl mb-2">🔒</div>
              No NSFW channels configured for this server.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
