import Link from "next/link";
import { BookOpen, ChevronLeft, User, LogOut, HelpCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export async function Shell({
  children,
  title,
  backTo,
  fullWidth,
  isHome,
}: {
  children: React.ReactNode;
  title?: string;
  backTo?: string;
  fullWidth?: boolean;
  isHome?: boolean;
}) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";
  const isEditor = user?.role === "editor";
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navbar */}
      <header className="fixed top-0 right-0 left-0 z-[1000] w-full border-b border-muted/50 bg-dark text-white shadow-sm">
        <div className={`container flex h-16 items-center justify-between px-4 sm:px-8 mx-auto max-w-[1920px]`}>
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-2 transition-all hover:opacity-90">
                <img src="/logo.png" alt="القاموس العسكري الموحد" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-none tracking-tight text-white">القاموس العسكري الموحد</h1>
                <p className="text-xs text-white/70 mt-1">الإدارة العسكرية ومجلس السلم والأمن العربي</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 mr-6">
              <Link 
                href="/sections" 
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white border border-white/25 hover:border-white/60 hover:bg-white/10 transition-all"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>الأقسام</span>
              </Link>
              {isEditor && (
                <Link
                  href="/editor/terms"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white border border-white/25 hover:border-white/60 hover:bg-white/10 transition-all"
                >
                  إدارة المصطلحات والرموز
                </Link>
              )}
              {isEditor && (
                <Link
                  href="/editor/proposals"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white border border-white/25 hover:border-white/60 hover:bg-white/10 transition-all"
                >
                  طلبات الاختصارات
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin/users"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white border border-white/25 hover:border-white/60 hover:bg-white/10 transition-all"
                >
                  المستخدمون
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/guide"
              title="دليل الاستخدام"
              className="h-9 w-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 border border-white/25 hover:border-white/60 transition-all"
            >
              <HelpCircle className="h-4.5 w-4.5" />
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end mr-2 text-white">
                   <span className="text-sm font-medium leading-none">{user.username}</span>
                   <span className="text-xs text-white/70">{user.role === 'admin' ? 'مدير النظام' : user.role === 'editor' ? 'معالج البيانات' : 'مستخدم'}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                   <User className="h-4 w-4" />
                </div>
                <form action="/api/auth/logout" method="post">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-destructive">
                     <LogOut className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="px-6 rounded-full">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${isHome ? "" : "py-4 sm:py-8 pt-20 sm:pt-24 pb-36 md:pb-32"}`}>
        <div className={isHome ? "w-full" : `container px-3 sm:px-6 lg:px-8 mx-auto max-w-[1920px]`}>
           {(title || backTo) && (
             <div className="mb-8 border-b border-border pb-4 flex flex-col gap-2">
               {backTo && (
                 <Link href={backTo} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 w-fit mb-1">
                    <ChevronLeft className="h-4 w-4" />
                    عودة
                 </Link>
               )}
               {title && <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>}
             </div>
           )}
           {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 right-0 left-0 z-[900] border-t border-border bg-background/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <div className="container flex flex-col items-center justify-center py-3 px-4 mx-auto max-w-[1600px]">
          <div className="text-center flex flex-col gap-1">
            <div className="text-sm font-semibold text-foreground flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <span>القاموس العسكري الموحد</span>
            </div>
            <div className="text-[10px] text-muted-foreground dir-ltr font-mono">
              جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
