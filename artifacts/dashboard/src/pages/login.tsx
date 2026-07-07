import { useState, useEffect } from "react";
import { useLogin } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AnimeBackground } from "@/components/AnimeBackground";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

export function Login() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [botInfo, setBotInfo] = useState<{ username: string; avatarUrl: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/bot/avatar")
      .then((r) => r.json())
      .then(setBotInfo)
      .catch(() => {});
  }, []);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        if (data.success) {
          localStorage.setItem("dashboard_token", data.token);
          setLocation("/overview");
        } else {
          toast({ title: "Wrong password", description: "Access denied.", variant: "destructive" });
        }
      },
      onError: () => {
        toast({ title: "Connection error", description: "Could not reach the server.", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    loginMutation.mutate({ data: { password } });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[hsl(220,25%,4%)]">
      <AnimeBackground />

      {/* Centered login card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Glass card */}
        <div className="bg-black/60 backdrop-blur-2xl border border-white/8 rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[hsl(192,90%,50%)] to-transparent opacity-60" />

          <div className="p-8 space-y-6">
            {/* Bot avatar + name */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center gap-3"
            >
              {botInfo?.avatarUrl ? (
                <img
                  src={botInfo.avatarUrl}
                  alt={botInfo.username}
                  className="w-18 h-18 rounded-full ring-2 ring-white/10 shadow-lg"
                  style={{ width: 72, height: 72 }}
                />
              ) : (
                <div className="w-[72px] h-[72px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-lg">
                  🌸
                </div>
              )}
              <div className="text-center">
                <h1 className="text-xl font-semibold tracking-tight text-white/90">
                  {botInfo?.username ?? "mommy"}
                </h1>
                <p className="text-xs text-white/35 mt-0.5 tracking-wider uppercase">Dashboard</p>
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
              className="h-px bg-white/6 origin-left"
            />

            {/* Form */}
            <motion.form
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                <Input
                  type="password"
                  placeholder="Enter secret..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 focus-visible:ring-[hsl(192,90%,50%)] focus-visible:border-[hsl(192,90%,50%)/50] rounded-lg h-10 text-sm text-white/80 placeholder:text-white/25"
                />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
              <Button
                type="submit"
                className="w-full h-10 rounded-lg font-medium text-sm tracking-wide text-black bg-[hsl(215,20%,72%)] hover:bg-[hsl(215,20%,82%)] transition-all shadow-lg"
                disabled={loginMutation.isPending || !password}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  "Enter"
                )}
              </Button>
              </motion.div>
            </motion.form>
          </div>

          {/* Bottom accent */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </div>

        {/* Subtle glow under card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[hsl(192,90%,50%)] opacity-5 blur-2xl rounded-full pointer-events-none"
        />
      </motion.div>
    </div>
  );
}
