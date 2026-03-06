import LoginClient from "./login-client";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 z-0 animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50 z-0 animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Top right floating controls */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-background/80 backdrop-blur-md border border-border rounded-full p-1 shadow-sm">
          <ThemeToggle />
        </div>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full p-4 flex items-center justify-center">
        <LoginClient />
      </div>
    </div>
  );
}
