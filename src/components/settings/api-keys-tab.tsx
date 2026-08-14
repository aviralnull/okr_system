
"use client";

import { useState, useTransition, useEffect } from "react";
import { Key, Plus, Trash2, Copy, CheckCircle2, AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import { getApiKeys, createApiKey, revokeApiKey } from "@/actions/api-keys.actions";
import { LockedBanner } from "@/components/shared/primium-gate";
import type { Plan }    from "@/lib/plan-config";
import { canUseFeature } from "@/lib/plan-config";

function cn(...c: (string|false|undefined)[]) { return c.filter(Boolean).join(" "); }

type ApiKey = { id: string; name: string; prefix: string; createdAt: Date; createdBy: string; lastUsed: string|null };

export function ApiKeysTab({ plan }: { plan: Plan }) {
  const [keys,     setKeys]     = useState<ApiKey[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name,     setName]     = useState("");
  const [newKey,   setNewKey]   = useState<string|null>(null);
  const [copied,   setCopied]   = useState(false);
  const [error,    setError]    = useState("");
  const [toast,    setToast]    = useState<{msg:string;type:"success"|"error"}|null>(null);
  const [pending,  start]       = useTransition();

  const canUse = canUseFeature(plan, "apiAccess");

  useEffect(() => {
    if (!canUse) return;
    getApiKeys("").then(setKeys).catch(console.error);
  }, [canUse]);

  function showToast(msg: string, type: "success"|"error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleCreate() {
    if (!name.trim()) return setError("Key name is required");
    setError("");
    const fd = new FormData();
    fd.set("name", name);
    start(async () => {
      const res = await createApiKey(fd);
      if (res.success && res.key) {
        setNewKey(res.key);
        setName("");
        setShowForm(false);
        getApiKeys("").then(setKeys);
      } else if (!res.success) {
        setError(res.error);
      }
    });
  }

  function handleRevoke(keyId: string) {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    start(async () => {
      const res = await revokeApiKey(keyId);
      if (res.success) {
        setKeys(prev => prev.filter(k => k.id !== keyId));
        showToast("API key revoked", "success");
      } else {
        showToast(res.error, "error");
      }
    });
  }

  function copyKey() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!canUse) {
    return (
      <LockedBanner
        requiredPlan="BUSINESS"
        label="API Access"
        description="Generate API keys to integrate OKR Desk with your tools. Available on Business plan and above."
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* New key reveal */}
      {newKey && (
        <div className="rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50 dark:bg-emerald-950/20 p-4">
          <div className="flex items-start gap-2.5 mb-3">
            <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-semibold text-foreground">API key created!</p>
              <p className="text-xs text-muted-foreground mt-0.5">Copy it now — you won't see it again.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg font-mono text-xs break-all">
            <span className="flex-1 text-foreground">{newKey}</span>
            <button onClick={copyKey}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              {copied ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14}/>}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="text-xs text-muted-foreground hover:text-foreground mt-2">
            I've copied it
          </button>
        </div>
      )}

      {/* Keys list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">API Keys</p>
            <p className="text-xs text-muted-foreground mt-0.5">{keys.length} active key{keys.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
            <Plus size={12}/> New key
          </button>
        </div>

        {showForm && (
          <div className="p-5 border-b border-border bg-muted/20 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Key name *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Production, Zapier, Slack Integration"
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1.5">
                <AlertCircle size={12}/>{error}
              </p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 text-xs py-2 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={pending}
                className="flex-1 text-xs py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                {pending ? "Generating..." : "Generate key"}
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-border">
          {keys.length === 0 ? (
            <div className="text-center py-10">
              <Key size={28} className="text-muted-foreground mx-auto mb-2"/>
              <p className="text-sm text-muted-foreground">No API keys yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first key to start integrating</p>
            </div>
          ) : keys.map(k => (
            <div key={k.id} className="flex items-center gap-3 px-6 py-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Key size={14} className="text-primary"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{k.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{k.prefix}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">Created by {k.createdBy}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(k.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => handleRevoke(k.id)} disabled={pending}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API docs note */}
      <div className="flex items-start gap-2.5 p-4 rounded-xl border border-border bg-muted/20">
        <Shield size={14} className="text-primary flex-shrink-0 mt-0.5"/>
        <div>
          <p className="text-xs font-medium text-foreground">Using the API</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Include your API key in the Authorization header: <code className="font-mono bg-muted px-1 rounded">Bearer okr_xxxx</code>
          </p>
        </div>
      </div>

      {toast && (
        <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
          {toast.type === "success" ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
