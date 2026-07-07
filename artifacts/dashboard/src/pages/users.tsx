import { useState } from "react";
import { useGetUsers } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Clock, ChevronRight } from "lucide-react";
import { AnimatedPage, StaggerContainer, StaggerItem } from "@/components/animations";

export function Users() {
  const { data: users, isLoading } = useGetUsers();
  const [search, setSearch] = useState("");

  const filtered = users?.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.userId.includes(search)
  ) ?? [];

  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Users 💖</h1>
        <p className="text-muted-foreground mt-1">Everyone who has chatted with mommy</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by username or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card/30 border-border/60 rounded-xl"
          data-testid="input-user-search"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-4xl mb-3">💖</div>
              <p className="text-sm">No users found.</p>
            </div>
          ) : (
            <StaggerContainer className="space-y-2">
            {filtered.map((user) => (<StaggerItem key={user.userId}>
              <Link key={user.userId} href={`/users/${user.userId}`}>
                <Card
                  className="bg-card/40 border-border/60 hover:border-primary/40 kawaii-card cursor-pointer"
                  data-testid={`card-user-${user.userId}`}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-10 h-10 rounded-xl ring-1 ring-border/60"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">{user.username}</span>
                        {user.discriminator && user.discriminator !== "0" && (
                          <span className="text-muted-foreground text-xs">#{user.discriminator}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{user.userId}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-primary/60" />
                        {user.messageCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 hidden sm:flex">
                        <Clock className="w-3.5 h-3.5 text-primary/60" />
                        {new Date(user.lastSeen).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-xs border-border/60 hidden md:flex rounded-lg">
                        {(user.servers ?? []).length} server{(user.servers ?? []).length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />
                  </CardContent>
                </Card>
              </Link></StaggerItem>
            ))
          </StaggerContainer>
          )}
        </div>
      )}
    </AnimatedPage>
  );
}
