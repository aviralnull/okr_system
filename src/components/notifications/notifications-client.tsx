"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Bell, BellOff, CheckCheck, Trash2, X,
  Target, Star, MessageSquare, Activity,
  AlertTriangle, CheckCircle2, Info, Clock,
} from "lucide-react";
import {
  markAsRead, markAllAsRead,
  deleteNotification, clearReadNotifications,
} from "@/actions/notification.actions";
import type { NotificationItem } from "@/actions/notification.actions";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// Type config
const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  OKR_ASSIGNED:    { icon: Target,        color: "#6366f1", bg: "#6366f115", label: "OKR Assigned" },
  OKR_AT_RISK:     { icon: AlertTriangle, color: "#f59e0b", bg: "#f59e0b15", label: "At Risk" },
  OKR_COMPLETED:   { icon: CheckCircle2,  color: "#10b981", bg: "#10b98115", label: "Completed" },
  PROGRESS_LOGGED: { icon: Activity,      color: "#3b82f6", bg: "#3b82f615", label: "Progress" },
  REVIEW_DUE:      { icon: Clock,         color: "#f59e0b", bg: "#f59e0b15", label: "Review Due" },
  REVIEW_SUBMITTED:{ icon: Star,          color: "#f59e0b", bg: "#f59e0b15", label: "Review" },
  COMMENT_ADDED:   { icon: MessageSquare, color: "#8b5cf6", bg: "#8b5cf615", label: "Comment" },
  REMINDER:        { icon: Clock,         color: "#94a3b8", bg: "#94a3b815", label: "Reminder" },
  SYSTEM:          { icon: Info,          color: "#94a3b8", bg: "#94a3b815", label: "System" },
};

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hrs < 24)   return `${hrs}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Single notification row ───────────────────────────────────
function NotifRow({
  notif, onRead, onDelete,
}: {
  notif:    NotificationItem;
  onRead:   (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.SYSTEM;
  const Icon   = config.icon;

  const content = (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl border transition-all group",
      notif.isRead
        ? "border-border bg-card"
        : "border-primary/20 bg-primary/5"
    )}>
      {/* Icon */}
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: config.bg }}>
        <Icon size={16} style={{ color: config.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className={cn("text-sm font-medium truncate", notif.isRead ? "text-foreground" : "text-foreground font-semibold")}>
                {notif.title}
              </p>
              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {!notif.isRead && (
              <button onClick={(e) => { e.preventDefault(); onRead(notif.id); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Mark as read">
                <CheckCheck size={13} />
              </button>
            )}
            <button onClick={(e) => { e.preventDefault(); onDelete(notif.id); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-muted-foreground hover:text-red-500"
              title="Delete">
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ background: config.bg, color: config.color }}>
            {config.label}
          </span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(notif.createdAt)}</span>
        </div>
      </div>
    </div>
  );

  if (notif.link) {
    return <a href={notif.link} onClick={() => !notif.isRead && onRead(notif.id)}>{content}</a>;
  }
  return <div onClick={() => !notif.isRead && onRead(notif.id)} className="cursor-default">{content}</div>;
}

// ── MAIN ──────────────────────────────────────────────────────
export function NotificationsClient({ notifications: initial }: {
  notifications: NotificationItem[];
}) {
  const [notifications, setNotifications] = useState(initial);
  const [filter, setFilter]               = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter]       = useState("ALL");
  const [pending, startTransition]        = useTransition();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const matchRead = filter === "all" || (filter === "unread" ? !n.isRead : n.isRead);
      const matchType = typeFilter === "ALL" || n.type === typeFilter;
      return matchRead && matchType;
    });
  }, [notifications, filter, typeFilter]);

  function handleRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    startTransition(async () => { await markAsRead(id); });
  }

  function handleDelete(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id));
    startTransition(async () => { await deleteNotification(id); });
  }

  function handleMarkAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    startTransition(async () => { await markAllAsRead(); });
  }

  function handleClearRead() {
    setNotifications(prev => prev.filter(n => !n.isRead));
    startTransition(async () => { await clearReadNotifications(); });
  }

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = {};
    for (const n of filtered) {
      const d    = new Date(n.createdAt);
      const now  = new Date();
      const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
      const key  = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : diff < 7 ? "This week" : "Older";
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    }
    return groups;
  }, [filtered]);

  const GROUP_ORDER = ["Today", "Yesterday", "This week", "Older"];

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Stats + Actions bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{notifications.length}</span> total ·{" "}
            <span className="font-semibold text-primary">{unreadCount}</span> unread
          </span>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} disabled={pending}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
          {notifications.some(n => n.isRead) && (
            <button onClick={handleClearRead} disabled={pending}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <Trash2 size={12} /> Clear read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Read filter */}
        <div className="flex gap-0 border border-border rounded-lg overflow-hidden">
          {[
            { id: "all",    label: "All" },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "read",   label: "Read" },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as any)}
              className={cn("text-xs px-3 py-1.5 transition-colors border-r border-border last:border-0 outline-none",
                filter === f.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground outline-none cursor-pointer">
          <option value="ALL">All types</option>
          {Object.entries(TYPE_CONFIG).map(([key, c]) => (
            <option key={key} value={key}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <BellOff size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {notifications.length === 0 ? "No notifications yet" : "No notifications match your filters"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {notifications.length === 0
              ? "You'll be notified about OKR updates, reviews, and comments"
              : "Try switching to 'All'"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {GROUP_ORDER.filter(g => grouped[g]).map(group => (
            <div key={group}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{group}</p>
              <div className="space-y-2">
                {grouped[group].map(n => (
                  <NotifRow key={n.id} notif={n} onRead={handleRead} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


