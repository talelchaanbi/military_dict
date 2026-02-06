import Link from "next/link";
<<<<<<< HEAD

import { Shell } from "@/components/Shell";
=======
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Shield, Search } from "lucide-react";
>>>>>>> main

export default function Home() {
  return (
    <Shell>
<<<<<<< HEAD
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold">القاموس العسكري</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            نسخة حديثة تعتمد على قاعدة بيانات MySQL.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/sections"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              تصفح الأقسام
            </Link>
            <Link
              href="/pages"
              className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              عرض الصفحات
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <div className="font-semibold text-zinc-900 dark:text-zinc-50">
            ملاحظة
          </div>
          <p className="mt-2">
            القسمان (12 و 13) يعرضان المحتوى كصفحات ويب.
          </p>
=======
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <Shield className="h-16 w-16 text-primary" />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-16 text-right">
           <Card className="hover:shadow-md transition-shadow">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <BookOpen className="h-5 w-5 text-primary" />
                 مصطلحات شاملة
               </CardTitle>
             </CardHeader>
             <CardContent>
               <CardDescription>
                  قاعدة بيانات ضخمة تحتوي على آلاف المصطلحات العسكرية في مختلف التخصصات البرية والجوية والبحرية.
               </CardDescription>
             </CardContent>
           </Card>

           <Card className="hover:shadow-md transition-shadow">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Search className="h-5 w-5 text-primary" />
                 بحث متقدم
               </CardTitle>
             </CardHeader>
             <CardContent>
               <CardDescription>
                  محرك بحث سريع ودقيق للوصول إلى المعلومات التي تحتاجها بأسرع وقت ممكن.
               </CardDescription>
             </CardContent>
           </Card>

           <Card className="hover:shadow-md transition-shadow">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Shield className="h-5 w-5 text-primary" />
                 رموز عسكرية
               </CardTitle>
             </CardHeader>
             <CardContent>
               <CardDescription>
                  توثيق كامل للرموز العسكرية المستخدمة في القوات المسلحة لمختلف الصنوف والتشكيلات.
               </CardDescription>
             </CardContent>
           </Card>
>>>>>>> main
        </div>
      </div>
    </Shell>
  );
}
