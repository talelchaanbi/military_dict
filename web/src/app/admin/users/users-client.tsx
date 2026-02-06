"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type User = {
  id: number;
  username: string;
  role: "admin" | "editor" | "reader";
  createdAt: string;
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) setUsers(data.users || []);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      username: form.get("username"),
      password: form.get("password"),
      role: form.get("role"),
    };

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "تعذر إنشاء المستخدم");
      return;
    }

    (e.target as HTMLFormElement).reset();
    await loadUsers();
  }

  async function onDelete(id: number) {
    if (!confirm("حذف المستخدم؟")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    await loadUsers();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 sm:grid-cols-3" onSubmit={onCreate}>
            <Input name="username" placeholder="اسم المستخدم" required />
            <Input name="password" placeholder="كلمة المرور" type="password" required />
            <select
              name="role"
              aria-label="الدور"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              defaultValue="reader"
            >
              <option value="reader">قارئ</option>
              <option value="editor">محرر</option>
              <option value="admin">مدير</option>
            </select>
            <div className="sm:col-span-3 flex items-center gap-3">
              <Button type="submit" disabled={loading}>إضافة مستخدم</Button>
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card">
        <div className="grid grid-cols-12 gap-0 border-b bg-muted/50 px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-5">اسم المستخدم</div>
          <div className="col-span-4">الدور</div>
          <div className="col-span-3">إجراء</div>
        </div>
        <div className="divide-y">
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-12 gap-0 px-4 py-3 text-sm">
              <div className="col-span-5 font-medium">{u.username}</div>
              <div className="col-span-4 text-muted-foreground">{u.role}</div>
              <div className="col-span-3">
                <Button variant="outline" size="sm" onClick={() => onDelete(u.id)}>
                  حذف
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">لا يوجد مستخدمون</div>
          )}
        </div>
      </div>
    </div>
  );
}
