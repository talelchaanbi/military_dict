"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, User, Shield, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      username: form.get("username"),
      password: form.get("password"),
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setLoading(false);
        setError("اسم المستخدم أو كلمة المرور غير صحيحة.");
        return;
      }

      router.push("/sections");
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.");
    }
  }

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        العودة للصفحة الرئيسية
      </Link>
      
      <Card className="border-t-4 border-t-primary shadow-2xl bg-card/60 backdrop-blur-xl">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto w-24 h-24 mb-2 bg-primary/5 rounded-full flex items-center justify-center p-3 shadow-inner">
            <img 
              src="/logo.png" 
              alt="القاموس العسكري" 
              className="w-full h-full object-contain drop-shadow-md" 
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            تسجيل الدخول
          </CardTitle>
          <CardDescription className="text-base">
            أدخل بيانات الاعتماد الخاصة بك للوصول للنظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label 
                className="text-sm font-semibold leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70" 
                htmlFor="username"
              >
                اسم المستخدم
              </label>
              <div className="relative group">
                <User className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                    id="username" 
                    name="username" 
                    placeholder="admin" 
                    className="pr-10 h-11 text-base bg-background/50 focus:bg-background transition-colors"
                    required 
                    autoComplete="username"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label 
                  className="text-sm font-semibold leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70" 
                  htmlFor="password"
                >
                  كلمة المرور
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type="password" 
                    className="pr-10 h-11 text-base bg-background/50 focus:bg-background transition-colors" 
                    required 
                    autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 flex items-center gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold shadow-md active:scale-[0.98] transition-all" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 relative flex">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-foreground"></span>
                  </span>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  تسجيل الدخول
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-8 text-center text-sm font-medium text-muted-foreground flex flex-col items-center justify-center gap-1">
        <span>نظام القاموس العسكري الموحد</span>
        <span>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة</span>
      </div>
    </div>
  );
}
