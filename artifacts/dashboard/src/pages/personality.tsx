import { useEffect } from "react";
import { useGetPersonality, useUpdatePersonality, getGetPersonalityQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";

type PersonalityFormData = {
  name: string;
  systemPrompt: string;
  nsfwEnabled: boolean;
  randomPingEnabled: boolean;
  greetNewMembers: boolean;
  randomPingIntervalMinutes: number;
  maxHistoryDays: number;
  activeProvider: string;
};

export function Personality() {
  const { data, isLoading } = useGetPersonality();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<PersonalityFormData>({
    defaultValues: {
      name: "mommy",
      systemPrompt: "",
      nsfwEnabled: false,
      randomPingEnabled: true,
      greetNewMembers: true,
      randomPingIntervalMinutes: 120,
      maxHistoryDays: 7,
      activeProvider: "groq",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        systemPrompt: data.systemPrompt,
        nsfwEnabled: data.nsfwEnabled,
        randomPingEnabled: data.randomPingEnabled,
        greetNewMembers: data.greetNewMembers,
        randomPingIntervalMinutes: data.randomPingIntervalMinutes ?? 120,
        maxHistoryDays: data.maxHistoryDays ?? 7,
        activeProvider: data.activeProvider ?? "groq",
      });
    }
  }, [data, form]);

  const updateMutation = useUpdatePersonality({
    mutation: {
      onSuccess: () => {
        toast({ title: "Saved! 🌸", description: "Personality settings updated." });
        queryClient.invalidateQueries({ queryKey: getGetPersonalityQueryKey() });
      },
      onError: () => toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" }),
    },
  });

  const onSubmit = (values: PersonalityFormData) => {
    updateMutation.mutate({ data: values });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 slide-up">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Personality 🧠</h1>
          <p className="text-muted-foreground mt-1">Configure mommy's character and behavior</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center text-2xl shadow shadow-primary/20">
          🧠
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          {/* Identity */}
          <Card className="bg-card/40 border-border/60 kawaii-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span>🌸</span> Identity
              </CardTitle>
              <CardDescription className="text-xs">The bot's name and core AI instructions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-background/50 border-border/60 max-w-xs rounded-xl" data-testid="input-bot-name" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt</FormLabel>
                    <FormDescription className="text-xs">
                      The core personality instructions for mommy.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={10}
                        className="bg-background/50 border-border/60 font-mono text-xs resize-y rounded-xl"
                        data-testid="textarea-system-prompt"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activeProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active AI Provider</FormLabel>
                    <FormDescription className="text-xs">
                      Primary provider — falls back to others if rate limited.
                    </FormDescription>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/60 max-w-xs rounded-xl" data-testid="select-provider">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="groq">⚡ Groq</SelectItem>
                        <SelectItem value="gemini">💎 Gemini</SelectItem>
                        <SelectItem value="nvidia">🚀 Nvidia</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Behavior Toggles */}
          <Card className="bg-card/40 border-border/60 kawaii-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span>⚙️</span> Behavior Toggles
              </CardTitle>
              <CardDescription className="text-xs">Global on/off switches for mommy's features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField
                control={form.control}
                name="nsfwEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-3 rounded-xl bg-background/30 border border-border/40">
                    <div>
                      <FormLabel className="flex items-center gap-1.5">🔞 NSFW Mode (Global)</FormLabel>
                      <FormDescription className="text-xs mt-0.5">
                        Master switch. Per-channel control via /nsfw command.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="toggle-nsfw" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="randomPingEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-3 rounded-xl bg-background/30 border border-border/40">
                    <div>
                      <FormLabel className="flex items-center gap-1.5">🎲 Random Pings</FormLabel>
                      <FormDescription className="text-xs mt-0.5">
                        mommy randomly messages members to start conversations.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="toggle-random-ping" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="greetNewMembers"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-3 rounded-xl bg-background/30 border border-border/40">
                    <div>
                      <FormLabel className="flex items-center gap-1.5">👋 Greet New Members</FormLabel>
                      <FormDescription className="text-xs mt-0.5">
                        Send a welcome message when someone joins a server.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="toggle-greet" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Limits */}
          <Card className="bg-card/40 border-border/60 kawaii-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span>⏱️</span> Limits & Memory
              </CardTitle>
              <CardDescription className="text-xs">Control timing and how long mommy remembers conversations</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="randomPingIntervalMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Random Ping Interval (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={30}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-background/50 border-border/60 rounded-xl"
                        data-testid="input-ping-interval"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxHistoryDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memory Duration (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-background/50 border-border/60 rounded-xl"
                        data-testid="input-history-days"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-xl bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/30 font-semibold"
              data-testid="button-save-personality"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Changes ✨"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
