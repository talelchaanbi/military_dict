"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Shield, Search, ArrowLeft, Globe, Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClientHome({ initialSearchQuery = "" }: { initialSearchQuery?: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-foreground overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "10s" }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "15s" }}></div>
        </div>

      <div className="flex flex-col items-center justify-center pt-10 pb-20 text-center space-y-8">
        
        {/* Logo & Headline */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
          <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
              <img 
                  src="/logo.png" 
                  alt="شعار القاموس العسكري" 
                  className="relative h-32 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
              />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-primary pb-2">
            القاموس العسكري الموحد
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed font-light">
            المرجع الرقمي الشامل للمصطلحات والمفاهيم العسكرية الحديثة. 
            <br className="hidden md:block"/>
            دقة في المعلومة، وسرعة في الوصول.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl relative animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards">
          <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center bg-card border border-border/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 p-2 pl-4">
                  <Search className="h-6 w-6 text-muted-foreground mr-4 ml-2" />
                  <Input 
                      type="text" 
                      placeholder="ابحث عن مصطلح (مثال: مناورة، إمداد، استطلاع...)" 
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg h-12"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="lg" className="rounded-full px-8 h-12 ml-1">
                      بحث
                  </Button>
              </div>
          </form>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-backwards">
           <Link href="/sections">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-3 rounded-full border-2 hover:bg-secondary/50 hover:border-primary/50 transition-all">
                 <BookOpen className="h-5 w-5" />
                 تصفح الأقسام
              </Button>
           </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 fill-mode-backwards">
           <FeatureCard 
              icon={<Globe className="h-8 w-8 text-blue-500" />}
              title="شامل ومتكامل"
              description="قاعدة بيانات ضخمة تغطي كافة التخصصات البرية والجوية والبحرية، محدثة باستمرار."
           />
           <FeatureCard 
              icon={<Zap className="h-8 w-8 text-yellow-500" />}
              title="بحث ذكي وسريع"
              description="خوارزميات بحث متقدمة تضمن الوصول إلى المصطلح الدقيق ومعانيه في ثوانٍ معدودة."
           />
           <FeatureCard 
              icon={<Shield className="h-8 w-8 text-green-500" />}
              title="موثوق ومعتمد"
              description="المصدر الرسمي المعتمد للمصطلحات والرموز العسكرية في مختلف الصنوف والتشكيلات."
           />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 flex flex-col items-center text-center p-4">
                <div className="mb-3 inline-flex p-2.5 rounded-xl bg-secondary/50 group-hover:bg-background shadow-sm transition-colors">
                    {icon}
                </div>
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-center p-4 pt-0">
                <CardDescription className="text-sm leading-relaxed">
                    {description}
                </CardDescription>
            </CardContent>
        </Card>
    )
}
