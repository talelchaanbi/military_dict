import Link from "next/link";
import { BookOpen, Shield, ChevronLeft, User, LogOut, Menu } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md shadow-sm">
        <div className={`container flex h-16 items-center justify-between px-4 sm:px-8 mx-auto max-w-[1600px]`}>
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-2 transition-all hover:opacity-90">
              <div className="bg-primary/10 group-hover:bg-primary/20 p-2.5 rounded-xl transition-colors">
                <Shield className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-none tracking-tight">القاموس العسكري</h1>
                <p className="text-xs text-muted-foreground mt-1">أمانة الشؤون العسكرية</p>
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
                  إدارة المصطلحات
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
      <main className="flex-1 py-8">
        <div className={`container px-4 sm:px-8 mx-auto max-w-[1600px]`}>
           {(title || backTo) && (
             <div className="mb-8 border-b border-border pb-4 flex flex-col gap-2">
               {backTo && (
                 <Link href={backTo} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 w-fit mb-1">
                    <ChevronLeft className="h-4 w-4" />
                    عودة
                 </Link>
               )}
               {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
             </div>
           )}
           {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-6 md:py-0">
        <div className={`container flex flex-col items-center justify-center gap-4 md:h-16 px-4 sm:px-8 mx-auto max-w-[1600px]`}>
          <p className="text-center text-sm leading-loose text-muted-foreground">
             تم التطوير بواسطة إدارة النظم والمعلومات &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
