"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserIcon,
  ShieldCheck,
  UserCog,
  X,
  Save,
  Key,
  Power,
  Pencil,
  RotateCcw,
  Trash2,
  Plus,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "admin" | "editor" | "reader";

type User = {
  id: number;
  username: string;
  role: UserRole;
  isActive: boolean;
  deletedAt: string | null;
  lastActiveAt: string | null;
  createdAt: string;
};

/** Online = lastActiveAt within 10 minutes */
function isOnline(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < 10 * 60 * 1000;
}

function OnlineDot({ lastActiveAt }: { lastActiveAt: string | null }) {
  const online = isOnline(lastActiveAt);
  return (
    <span
      title={online ? "متصل الآن" : lastActiveAt ? "غير متصل" : "لم يتصل بعد"}
      className={cn(
        "absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-background",
        online ? "bg-emerald-500" : "bg-slate-400"
      )}
    />
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  switch (role) {
    case "admin":
      return (
        <Badge className="gap-1.5 px-3 py-1 bg-red-600/15 text-red-600 border border-red-500/30 hover:bg-red-600/25 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30">
          <ShieldCheck className="h-3.5 w-3.5" />
          مدير النظام
        </Badge>
      );
    case "editor":
      return (
        <Badge className="gap-1.5 px-3 py-1 bg-blue-600/15 text-blue-600 border border-blue-500/30 hover:bg-blue-600/25 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30">
          <UserCog className="h-3.5 w-3.5" />
          معالج البيانات
        </Badge>
      );
    default:
      return (
        <Badge className="gap-1.5 px-3 py-1 bg-emerald-600/15 text-emerald-700 border border-emerald-500/30 hover:bg-emerald-600/25 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
          <UserIcon className="h-3.5 w-3.5" />
          مستخدم
        </Badge>
      );
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatRelative(dateString: string | null): string {
  if (!dateString) return "لم يتصل بعد";
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} س`;
  return formatDate(dateString);
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function EditModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: (updated: User) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") || "").trim();
    const role = String(form.get("role") || "");
    const password = String(form.get("password") || "").trim();

    const body: Record<string, unknown> = {};
    if (username && username !== user.username) body.username = username;
    if (role && role !== user.role) body.role = role;
    if (password) body.password = password;

    if (Object.keys(body).length === 0) {
      onClose();
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل التعديل");
      onSaved(data.user as User);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "فشل التعديل");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              تعديل: <span className="text-primary">{user.username}</span>
            </CardTitle>
            <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>اترك الحقل فارغاً للإبقاء على القيمة الحالية</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">اسم المستخدم</label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input name="username" defaultValue={user.username} className="pr-9" minLength={3} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">الصلاحية</label>
              <select
                name="role"
                defaultValue={user.role}
                aria-label="الصلاحية"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="reader">مستخدم (عرض وتقديم مقترحات)</option>
                <option value="editor">معالج البيانات (إدارة البيانات والمقترحات)</option>
                <option value="admin">مدير النظام (إدارة المستخدمين والنظام)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">كلمة المرور الجديدة</label>
              <div className="relative">
                <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="password"
                  type="password"
                  placeholder="اتركه فارغاً للإبقاء على الحالية"
                  className="pr-9"
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
              <Button type="submit" disabled={loading} className="min-w-25">
                {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                حفظ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminUsersClient({ currentUserId }: { currentUserId: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: String(form.get("username")),
          password: String(form.get("password")),
          role: String(form.get("role")),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر إنشاء المستخدم");
      setUsers(prev => [...prev, data.user]);
      setShowCreate(false);
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setCreateLoading(false);
    }
  }

  async function onToggleActive(u: User) {
    if (u.id === currentUserId) return;
    setActionLoading(u.id);
    const prev = [...users];
    setUsers(users.map(x => x.id === u.id ? { ...x, isActive: !x.isActive } : x));
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setUsers(prev);
    } finally {
      setActionLoading(null);
    }
  }

  async function onDelete(u: User) {
    if (u.id === currentUserId) return;
    if (!confirm(`هل تريد أرشفة حساب "${u.username}"؟ يمكن استعادته لاحقاً.`)) return;
    setActionLoading(u.id);
    const prev = [...users];
    setUsers(users.map(x => x.id === u.id ? { ...x, deletedAt: new Date().toISOString(), isActive: false } : x));
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setUsers(prev);
      alert("فشل أرشفة المستخدم");
    } finally {
      setActionLoading(null);
    }
  }

  async function onRestore(u: User) {
    setActionLoading(u.id);
    const prev = [...users];
    setUsers(users.map(x => x.id === u.id ? { ...x, deletedAt: null, isActive: true } : x));
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: true }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setUsers(prev);
      alert("فشل استعادة المستخدم");
    } finally {
      setActionLoading(null);
    }
  }

  function onEditSaved(updated: User) {
    setUsers(users.map(u => u.id === updated.id ? { ...u, ...updated } : u));
  }

  const q = searchQuery.toLowerCase();
  const activeUsers = users.filter(u => !u.deletedAt && u.username.toLowerCase().includes(q));
  const deletedUsers = users.filter(u => !!u.deletedAt && u.username.toLowerCase().includes(q));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {editingUser && (
        <EditModal user={editingUser} onClose={() => setEditingUser(null)} onSaved={onEditSaved} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-background/95 backdrop-blur p-1 rounded-lg sticky top-20 z-10">
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن مستخدم..."
            className="pr-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2 w-full sm:w-auto">
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? "إلغاء" : "إضافة مستخدم جديد"}
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="border-dashed border-2 border-primary/20 bg-muted/10 shadow-none animate-in zoom-in-95 duration-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              بيانات المستخدم الجديد
            </CardTitle>
            <CardDescription>قم بتعبئة البيانات لإنشاء حساب جديد للنظام</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم المستخدم</label>
                  <div className="relative">
                    <UserIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input name="username" placeholder="مثال: ahmed_ali" className="pr-9" required autoFocus />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">كلمة المرور</label>
                  <div className="relative">
                    <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input name="password" type="password" placeholder="••••••••" className="pr-9" required minLength={6} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الصلاحية</label>
                  <select
                    name="role"
                    defaultValue="reader"
                    aria-label="الصلاحية"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="reader">مستخدم (عرض وتقديم مقترحات)</option>
                    <option value="editor">معالج البيانات (إدارة البيانات والمقترحات)</option>
                    <option value="admin">مدير النظام (إدارة المستخدمين والنظام)</option>
                  </select>
                </div>
              </div>
              {createError && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-md flex items-center gap-2">
                  <X className="h-4 w-4" />
                  {createError}
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={createLoading} className="min-w-30">
                  {createLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                  حفظ المستخدم
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Users Table */}
      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">المستخدم</th>
                <th className="px-6 py-4">الصلاحية</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">آخر اتصال</th>
                <th className="px-6 py-4">تاريخ الانضمام</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    جاري التحميل...
                  </td>
                </tr>
              ) : activeUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-muted-foreground">
                    لا يوجد مستخدمين مطابقين للبحث
                  </td>
                </tr>
              ) : (
                activeUsers.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const busy = actionLoading === u.id;
                  return (
                    <tr
                      key={u.id}
                      className={cn(
                        "group transition-colors",
                        u.isActive ? "hover:bg-muted/30" : "bg-amber-500/5 hover:bg-amber-500/10",
                      )}
                    >
                      {/* Username + online dot */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className={cn(
                              "h-9 w-9 rounded-full flex items-center justify-center font-bold shadow-sm text-sm",
                              u.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            <OnlineDot lastActiveAt={u.lastActiveAt} />
                          </div>
                          <div>
                            <p className={cn("font-medium leading-tight", !u.isActive && "text-muted-foreground line-through decoration-2")}>
                              {u.username}
                            </p>
                            {isSelf && (
                              <p className="text-[10px] text-primary font-semibold mt-0.5">أنت</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Active badge */}
                      <td className="px-6 py-4">
                        {u.isActive ? (
                          <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[11px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                            مفعّل
                          </Badge>
                        ) : (
                          <Badge className="gap-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[11px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                            معطّل
                          </Badge>
                        )}
                      </td>

                      {/* Last active */}
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5">
                          {isOnline(u.lastActiveAt) && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                          )}
                          {formatRelative(u.lastActiveAt)}
                        </div>
                      </td>

                      {/* Join date */}
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon" variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => setEditingUser(u)}
                            title="تعديل"
                            disabled={busy}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {!isSelf && (
                            <Button
                              size="icon" variant="ghost"
                              className={cn(
                                "h-8 w-8",
                                u.isActive
                                  ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                                  : "text-amber-600 hover:text-emerald-600 hover:bg-emerald-500/10"
                              )}
                              onClick={() => onToggleActive(u)}
                              title={u.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
                              disabled={busy}
                            >
                              {busy && actionLoading === u.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Power className="h-3.5 w-3.5" />}
                            </Button>
                          )}

                          {!isSelf && (
                            <Button
                              size="icon" variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onDelete(u)}
                              title="أرشفة"
                              disabled={busy}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Archived Users */}
      {deletedUsers.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-1"
          >
            {showDeleted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            الحسابات المؤرشفة ({deletedUsers.length})
          </button>

          {showDeleted && (
            <Card className="shadow-sm overflow-hidden border-dashed opacity-80">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-muted/30 text-xs text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-6 py-3">المستخدم</th>
                      <th className="px-6 py-3">الصلاحية</th>
                      <th className="px-6 py-3">تاريخ الأرشفة</th>
                      <th className="px-6 py-3 text-center">استعادة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {deletedUsers.map((u) => {
                      const busy = actionLoading === u.id;
                      return (
                        <tr key={u.id} className="opacity-60 hover:opacity-90 transition-opacity group">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-muted-foreground line-through decoration-2">
                                {u.username}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <RoleBadge role={u.role} />
                          </td>
                          <td className="px-6 py-3 text-muted-foreground font-mono text-xs">
                            {u.deletedAt ? formatDate(u.deletedAt) : "-"}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex justify-center">
                              <Button
                                size="sm" variant="outline"
                                className="h-7 gap-1.5 text-xs hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
                                onClick={() => onRestore(u)}
                                disabled={busy}
                              >
                                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                                استعادة
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}



