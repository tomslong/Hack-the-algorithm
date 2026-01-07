import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = [
  "Arrays", "Linked Lists", "Stacks & Queues", "Trees", 
  "Recursion", "Dynamic Programming", "Sorting", "Searching"
];

const OPENAI_MODELS = [
  { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
  { value: "gpt-4o-mini", label: "gpt-4o-mini" },
  { value: "*", label: "Provider Default (*)" },
];

type ApiKeyItem = {
  id: number;
  provider: string;
  model: string;
  name: string | null;
  is_default: number;
  disabled: number;
  quota_requests_per_day: number | null;
  quota_tokens_per_day: number | null;
  rate_limit_rpm: number | null;
  rate_limit_tpm: number | null;
  created_at: number;
  last_used_at: number | null;
};

export function AISettings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [keyExists, setKeyExists] = useState(false);
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyModel, setNewKeyModel] = useState<string>("*");
  const [newKeyName, setNewKeyName] = useState<string>("");
  const [newKeyDefault, setNewKeyDefault] = useState<boolean>(true);
  const [newKeyQuotaRequests, setNewKeyQuotaRequests] = useState<string>("");
  const [newKeyQuotaTokens, setNewKeyQuotaTokens] = useState<string>("");
  const [newKeyRateRpm, setNewKeyRateRpm] = useState<string>("");
  const [newKeyRateTpm, setNewKeyRateTpm] = useState<string>("");
  const [skills, setSkills] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const fetchSkills = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/skills");
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (err) {
      console.error("Failed to fetch skills", err);
    }
  };

  const fetchKeys = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/keys?provider=openai&detailed=1");
      if (res.ok) {
        const data = await res.json();
        const nextKeys = (data.keys || []) as ApiKeyItem[];
        setKeys(nextKeys);
        setKeyExists(Boolean(data.exists));
      }
    } catch (err) {
      console.error("Failed to fetch keys", err);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchKeys();
  }, []);

  const saveKey = async () => {
    if (!apiKey) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openai",
          model: newKeyModel,
          name: newKeyName || undefined,
          key: apiKey,
          is_default: newKeyDefault,
          quota_requests_per_day: newKeyQuotaRequests ? Number(newKeyQuotaRequests) : undefined,
          quota_tokens_per_day: newKeyQuotaTokens ? Number(newKeyQuotaTokens) : undefined,
          rate_limit_rpm: newKeyRateRpm ? Number(newKeyRateRpm) : undefined,
          rate_limit_tpm: newKeyRateTpm ? Number(newKeyRateTpm) : undefined,
        }),
      });
      if (res.ok) {
        setApiKey("");
        setNewKeyName("");
        setNewKeyQuotaRequests("");
        setNewKeyQuotaTokens("");
        setNewKeyRateRpm("");
        setNewKeyRateTpm("");
        await fetchKeys();
        toast({ title: "Success", description: "API Key saved securely." });
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast({ title: "Error", description: errJson.error || "Failed to save API Key.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    }
    setLoading(false);
  };

  const setDefaultKey = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_default" }),
      });
      if (res.ok) {
        await fetchKeys();
        toast({ title: "Success", description: "Default key updated." });
      } else {
        toast({ title: "Error", description: "Failed to set default key.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    }
    setLoading(false);
  };

  const disableKey = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      if (res.ok) {
        await fetchKeys();
        toast({ title: "Success", description: "Key disabled." });
      } else {
        toast({ title: "Error", description: "Failed to disable key.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    }
    setLoading(false);
  };

  const deleteKey = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/keys/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchKeys();
        toast({ title: "Success", description: "Key removed." });
      } else {
        toast({ title: "Error", description: "Failed to remove key.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    }
    setLoading(false);
  };

  const saveSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Skills profile updated." });
      } else {
        toast({ title: "Error", description: "Failed to save skills.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSkillChange = (category: string, value: string) => {
    setSkills(prev => ({ ...prev, [category]: parseInt(value) }));
  };

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">AI Settings & Profile</h1>
      
      <div className="grid gap-8">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>LLM Configuration</CardTitle>
            <CardDescription>Manage multiple API keys per model. Keys are stored encrypted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Model</label>
                  <Select value={newKeyModel} onValueChange={setNewKeyModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPENAI_MODELS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="keyname" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Key Name (optional)</label>
                  <Input id="keyname" placeholder="e.g. team-key-1" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="rpm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Rate Limit RPM (optional)</label>
                  <Input id="rpm" inputMode="numeric" placeholder="e.g. 60" value={newKeyRateRpm} onChange={(e) => setNewKeyRateRpm(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="tpm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Rate Limit TPM (optional)</label>
                  <Input id="tpm" inputMode="numeric" placeholder="e.g. 20000" value={newKeyRateTpm} onChange={(e) => setNewKeyRateTpm(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="quotaReq" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Quota Requests/Day (optional)</label>
                  <Input id="quotaReq" inputMode="numeric" placeholder="e.g. 500" value={newKeyQuotaRequests} onChange={(e) => setNewKeyQuotaRequests(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="quotaTok" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Quota Tokens/Day (optional)</label>
                  <Input id="quotaTok" inputMode="numeric" placeholder="e.g. 200000" value={newKeyQuotaTokens} onChange={(e) => setNewKeyQuotaTokens(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="newKeyDefault"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={newKeyDefault}
                  onChange={(e) => setNewKeyDefault(e.target.checked)}
                />
                <label htmlFor="newKeyDefault" className="text-sm">Set as default for this model</label>
              </div>

              <label
                htmlFor="apikey"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                OpenAI API Key
              </label>
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  id="apikey" 
                  placeholder={keyExists ? "Key is set (enter to update)" : "sk-..."}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button onClick={saveKey} disabled={loading || !apiKey}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
              {keyExists && <p className="text-sm text-green-600 dark:text-green-400">✓ At least one key is configured</p>}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Configured Keys</h3>
                <Button variant="outline" onClick={fetchKeys} disabled={loading}>
                  Refresh
                </Button>
              </div>

              {keys.length === 0 ? (
                <p className="text-sm text-muted-foreground">No keys configured yet.</p>
              ) : (
                <div className="space-y-2">
                  {keys.map((k) => (
                    <div key={k.id} className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{k.name || `Key #${k.id}`}</span>
                          <span className="text-xs text-muted-foreground">{k.provider}:{k.model}</span>
                          {k.is_default ? <span className="text-xs text-green-600 dark:text-green-400">Default</span> : null}
                          {k.disabled ? <span className="text-xs text-destructive">Disabled</span> : null}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {k.rate_limit_rpm ? `RPM ${k.rate_limit_rpm}` : ""}{k.rate_limit_rpm && k.rate_limit_tpm ? " · " : ""}{k.rate_limit_tpm ? `TPM ${k.rate_limit_tpm}` : ""}
                          {(k.rate_limit_rpm || k.rate_limit_tpm) && (k.quota_requests_per_day || k.quota_tokens_per_day) ? " · " : ""}
                          {k.quota_requests_per_day ? `Req/day ${k.quota_requests_per_day}` : ""}{k.quota_requests_per_day && k.quota_tokens_per_day ? " · " : ""}{k.quota_tokens_per_day ? `Tok/day ${k.quota_tokens_per_day}` : ""}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => setDefaultKey(k.id)} disabled={loading || Boolean(k.disabled) || Boolean(k.is_default)}>
                          Set Default
                        </Button>
                        <Button variant="outline" onClick={() => disableKey(k.id)} disabled={loading || Boolean(k.disabled)}>
                          Disable
                        </Button>
                        <Button variant="destructive" onClick={() => deleteKey(k.id)} disabled={loading}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skill Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Assessment</CardTitle>
            <CardDescription>Rate your proficiency (1-5) to personalize the AI tutor.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CATEGORIES.map((category) => (
                <div key={category} className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{category}</label>
                  <Select 
                    value={skills[category]?.toString() || "1"} 
                    onValueChange={(val) => handleSkillChange(category, val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Novice</SelectItem>
                      <SelectItem value="2">2 - Beginner</SelectItem>
                      <SelectItem value="3">3 - Intermediate</SelectItem>
                      <SelectItem value="4">4 - Advanced</SelectItem>
                      <SelectItem value="5">5 - Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <Separator className="my-6" />
            <Button onClick={saveSkills} disabled={loading} className="w-full md:w-auto">
              {loading ? "Saving..." : "Update Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Progress Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>My Progress</CardTitle>
            <CardDescription>Track your mastery of algorithm topics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CATEGORIES.map(category => {
                const level = skills[category] || 0;
                const percentage = (level / 5) * 100;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground">{level}/5</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
