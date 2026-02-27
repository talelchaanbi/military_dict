"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Shield, 
  Trash2, 
  Plus, 
  Search, 
  Loader2, 
  MoreHorizontal, 
  ShieldCheck, 
  UserCog, 
  X,
  Save,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "admin" | "editor" | "reader";

type User = {
  id: number;
  username: string;
  role: UserRole;
  createdAt: string;
};

// --- Helper Components ---

function RoleBadge({ role }: { role: UserRole }) {
  switch (role) {
    case "admin":
      return (
        <Badge variant="destructive" className="gap-1 pl-2">
          <ShieldCheck className="h-3 w-3" />
          مدير
        </Badge>
      );
    case "editor":
      return (
        <Badge variant="secondary" className="gap-1 pl-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
          <UserCog className="h-3 w-3" />
          محرر
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1 pl-2 text-muted-foreground">
          <UserIcon className="h-3 w-3" />
          قارئ
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

export default function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create State
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit State (Simple inline edit not implemented to avoid complexity without Dialogs, 
  // but we can add Password Reset / Role Change later if needed. For now, Delete is key).

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

  useEffect(() => {
    loadUsers();
  }, []);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username"));
    const password = String(form.get("password"));
    const role = String(form.get("role"));

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذر إنشاء المستخدم");
      }

      // Success
      setUsers([...users, data.user]); // Optimistic add or reload
      setShowCreate(false);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم نهائياً؟")) return;
    
    // Optimistic UI
    const oldUsers = [...users];
    setUsers(users.filter(u => u.id !== id));

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch (e) {
      // Revert on error
      setUsers(oldUsers);
      alert("فشل حذف المستخدم");
    }
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header Actions */}
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
          {showCreate ? "إلغاء للإضافة" : "إضافة مستخدم جديد"}
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
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="reader"
                  >
                    <option value="reader">قارئ (عرض فقط)</option>
                    <option value="editor">محرر (اقتراح وتعديل)</option>
                    <option value="admin">مدير (إدارة المستخدمين)</option>
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
                <Button type="submit" disabled={createLoading} className="min-w-[120px]">
                  {createLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                  حفظ المستخدم
                </Button>
              </div>
            </form>
           </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">المستخدم</th>
                <th className="px-6 py-4">الصلاحية</th>
                <th className="px-6 py-4">تاريخ الانضمام</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="h-32 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    جاري التحميل...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-32 text-center text-muted-foreground">
                    لا يوجد مستخدمين مطابقين للبحث
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(u.id)}
                          title="حذف المستخدم"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
