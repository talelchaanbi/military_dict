import Link from "next/link";
import { BookOpen, Search, Shield, Menu, ChevronLeft } from "lucide-react";

export function Shell({
  children,
  title,
  backTo,
}: {
  children: React.ReactNode;
  title?: string;
  backTo?: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-none">القاموس العسكري</h1>
                <p className="text-xs text-muted-foreground">أمانة الشؤون العسكرية</p>
              </div>
            </Link>
          </div>
          
          <nav className="flex items-center gap-4">
             <Link 
                href="/sections" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>الأقسام</span>
             </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container px-4 sm:px-8 max-w-7xl mx-auto">
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
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 sm:px-8 max-w-7xl mx-auto">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
             تم التطوير بواسطة إدارة النظم والمعلومات &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
