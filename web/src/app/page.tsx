import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Shield, Search } from "lucide-react";

export default function Home() {
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">
        <div className="mb-4">
          <img src="/logo.png" alt="شعار القاموس العسكري" className="h-32 w-auto object-contain" />
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl max-w-3xl">
          القاموس العسكري الموحد
        </h1>
        
        <p className="max-w-[700px] text-lg text-muted-foreground leading-relaxed">
          مرجعك الشامل للمصطلحات والمفاهيم العسكرية. تصفح الأقسام المختلفة أو ابحث عن مصطلحات محددة في قاعدة البيانات المحدثة.
        </p>
        
        <div className="flex gap-4 pt-4">
           <Link href="/sections">
              <Button size="lg" className="h-12 px-8 text-base gap-2">
                 <BookOpen className="h-5 w-5" />
                 تصفح الأقسام
              </Button>
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16 text-center">
           <Card className="hover:shadow-md transition-shadow">
             <CardHeader>
               <CardTitle className="flex flex-col items-center gap-2">
                 <BookOpen className="h-8 w-8 text-primary mb-2" />
                 مصطلحات شاملة
               </CardTitle>
             </CardHeader>
             <CardContent>
               <CardDescription className="text-center">
                  قاعدة بيانات ضخمة تحتوي على آلاف المصطلحات العسكرية في مختلف التخصصات البرية والجوية والبحرية.
               </CardDescription>
             </CardContent>
           </Card>

           <Card className="hover:shadow-md transition-shadow">
             <CardHeader>
               <CardTitle className="flex flex-col items-center gap-2">
                 <Search className="h-8 w-8 text-primary mb-2" />
                 بحث متقدم
               </CardTitle>
             </CardHeader>
             <CardContent>
               <CardDescription className="text-center">
                  محرك بحث سريع ودقيق للوصول إلى المعلومات التي تحتاجها بأسرع وقت ممكن.
               </CardDescription>
             </CardContent>
           </Card>

           <Card className="hover:shadow-md transition-shadow">
             <CardHeader>
               <CardTitle className="flex flex-col items-center gap-2">
                 <Shield className="h-8 w-8 text-primary mb-2" />
                 رموز عسكرية
               </CardTitle>
             </CardHeader>
             <CardContent>
               <CardDescription className="text-center">
                  توثيق كامل للرموز العسكرية المستخدمة في القوات المسلحة لمختلف الصنوف والتشكيلات.
               </CardDescription>
             </CardContent>
           </Card>
        </div>
      </div>
    </Shell>
  );
}
