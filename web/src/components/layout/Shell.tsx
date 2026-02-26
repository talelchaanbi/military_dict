import Link from "next/link";
import { BookOpen, ChevronLeft, User, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export async function Shell({
  children,
  title,
  backTo,
  fullWidth,
}: {
  children: React.ReactNode;
  title?: string;
  backTo?: string;
  fullWidth?: boolean;
}) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";
  const isEditor = user?.role === "editor";
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navbar */}
      <header className="fixed top-0 right-0 left-0 z-[1000] w-full border-b border-border/50 bg-background/90 backdrop-blur-md shadow-sm">
        <div className={`container flex h-16 items-center justify-between px-4 sm:px-8 mx-auto max-w-[1600px]`}>
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-2 transition-all hover:opacity-90">
                <img src="/logo.png" alt="القاموس العسكري الموحد" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-none tracking-tight">القاموس العسكري الموحد</h1>
                <p className="text-xs text-muted-foreground mt-1">الإدارة العسكرية ومجلس السلم والأمن العربي</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 mr-6">
              <Link 
                href="/sections" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 px-3 py-2 rounded-md transition-all flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>الأقسام</span>
              </Link>
              {isEditor && (
                <Link
                  href="/editor/terms"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 px-3 py-2 rounded-md transition-all"
                >
                  إدارة المصطلحات والرموز
                </Link>
              )}
              {isEditor && (
                <Link
                  href="/editor/proposals"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 px-3 py-2 rounded-md transition-all"
                >
                  طلبات الاختصارات
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin/users"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 px-3 py-2 rounded-md transition-all"
                >
                  المستخدمون
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end mr-2">
                   <span className="text-sm font-medium leading-none">{user.username}</span>
                   <span className="text-xs text-muted-foreground">{user.role === 'admin' ? 'مدير النظام' : user.role === 'editor' ? 'محرر' : 'مستخدم'}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                   <User className="h-4 w-4" />
                </div>
                <form action="/api/auth/logout" method="post">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
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
      <main className="flex-1 py-4 sm:py-8 pt-20 sm:pt-24 pb-24 md:pb-20">
        <div className={`container px-3 sm:px-6 lg:px-8 mx-auto max-w-[1600px]`}>
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
      <footer className="fixed bottom-0 right-0 left-0 z-[900] border-t border-border bg-background/90 backdrop-blur-md">
        <div className={`container flex flex-col items-center justify-center py-2 px-4 sm:px-8 mx-auto max-w-[1600px]`}>
          <div className="text-center text-xs sm:text-sm text-muted-foreground flex flex-col gap-0.5">
            <span className="font-semibold text-foreground/80">الجمهورية التونسية</span>
            <span>وزارة الدفاع الوطني</span>
            <span>الإدارة العامّة للإشارة والإعلامية</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
