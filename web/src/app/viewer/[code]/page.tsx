import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dep12ViewerClient, type Dep12DocItem } from "./dep12-viewer-client";

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
   // Security: allow only a safe filename-like slug to prevent traversal.
   // We intentionally allow underscores/hyphens because docs are named like `dep12_section1.html`.
   if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
      return notFound();
   }

   const safeCode = code;
   const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "docs",
      `${safeCode}.html`
   );

  if (!fs.existsSync(filePath)) {
    return notFound();
  }

   const showPdfButton = safeCode === "dep12" || safeCode === "dep13";
   const pdfUrl = `/uploads/docs/${safeCode}.pdf`;

   if (safeCode === "dep12") {
      const dep12Title = "الرموز العسكرية للقوات البرية والقوات البحرية";
      const candidates: Dep12DocItem[] = [
         {
            code: "dep12_maps",
            title: "الخرائط",
            description: "استعراض الخرائط",
            kind: "visuals",
         },
         {
            code: "dep12_transparencies",
            title: "الشفافات والمخططات",
            description: "مخططات وشفافات",
            kind: "visuals",
         },
         {
            code: "dep12_maritime_maps",
            title: "الخرائط البحرية",
            description: "خرائط بحرية",
            kind: "visuals",
         },
         {
            code: "dep12_section1",
            title: "القسم الأول: الرموز العسكرية",
            description: "محتوى + بحث داخل الصفحة",
            kind: "sections",
         },
         {
            code: "dep12_section2",
            title: "القسم الثاني: الرموز العسكرية للقوات البرية",
            description: "محتوى + بحث داخل الصفحة",
            kind: "sections",
         },
         {
            code: "dep12_section3",
            title: "القسم الثالث: الرموز المستخدمة للقوات البحرية",
            description: "محتوى + بحث داخل الجدول",
            kind: "sections",
         },
      ];

      const docsDir = path.join(process.cwd(), "public", "uploads", "docs");
      const items = candidates.filter((c) =>
         fs.existsSync(path.join(docsDir, `${c.code}.html`))
      );

      return (
         <Shell backTo="/sections">
            <div className="max-w-6xl mx-auto">
               {showPdfButton && (
                  <div className="mb-4 flex justify-end">
                     <Button asChild variant="outline" size="sm">
                        <a href={pdfUrl} target="_blank" rel="noreferrer">
                             عرض الوثيقة الأصلية
                        </a>
                     </Button>
                  </div>
               )}

               <Dep12ViewerClient items={items} title={dep12Title} />
            </div>
         </Shell>
      );
   }

   // Some docs (notably `dep12_*`) rely on embedded CSS/JS (theme toggle, search, maps-like layout).
   // When we inline HTML we intentionally strip <style>/<script> for safety and app-theme isolation.
   // For these docs, render via iframe so their own assets execute without affecting the app shell.
   const shouldUseIframe = safeCode.startsWith("dep12_");
   if (shouldUseIframe) {
      const iframeSrc = `/uploads/docs/${encodeURIComponent(safeCode)}.html`;
      return (
         <Shell backTo="/sections">
            <div className="max-w-6xl mx-auto">
               <div className="mb-4 flex items-center justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                     <a href={iframeSrc} target="_blank" rel="noreferrer">
                        فتح النسخة الأصلية (HTML)
                     </a>
                  </Button>
               </div>
               <Card className="shadow-lg">
                  <CardContent className="p-0">
                     <iframe
                        title={safeCode}
                        src={iframeSrc}
                        className="block w-full h-[80vh] sm:h-[85vh] md:h-[88vh] rounded-md"
                        // Allow scripts + same-origin storage for theme sync.
                        // Allow top navigation on user click to avoid nesting the app inside the iframe.
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                     />
                  </CardContent>
               </Card>
            </div>
         </Shell>
      );
   }

   const fileContent = fs.readFileSync(filePath, "utf-8");

  // Simple extraction of the main content
  // We look for <main> content or just body body content
  // The generated files have <main><div class="card">...</div></main>
  
  let content = "";
  const mainMatch = fileContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  
  if (mainMatch && mainMatch[1]) {
     content = mainMatch[1];
  } else {
     // Fallback to body if main not found
     const bodyMatch = fileContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
     if (bodyMatch && bodyMatch[1]) {
        content = bodyMatch[1];
     } else {
        content = fileContent;
     }
  }

  // Remove the wrapper .card div if it exists to avoid double card styling
  content = content.replace(/<div class="card">/g, "").replace(/<\/div>\s*$/g, "");
  
  // Also strip the <div class="doc-content"> wrapper if it exists, since we add it ourselves
  // Note: This regex is simple and implies the structure we know.
  content = content.replace(/<div class="doc-content">/g, "").replace(/<\/div>\s*$/g, "");

   // Remove embedded styles/scripts from source HTML so global app theme and navbar are not affected.
   content = content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/\sstyle=("[^"]*"|'[^']*')/gi, "")
      .replace(/\sbgcolor=("[^"]*"|'[^']*')/gi, "")
      .replace(/\scolor=("[^"]*"|'[^']*')/gi, "");

   // Remove subheader rows like (أ)(ب)(ج/ﺠ)(د) in tables
   content = content.replace(
      /<tr>\s*<th>\s*<p>\s*\(أ\)\s*<\/p>\s*<\/th>\s*<th>\s*<p>\s*\(ب\)\s*<\/p>\s*<\/th>\s*<th>\s*<p>\s*\((?:ﺠ|ج)\)\s*<\/p>\s*<\/th>\s*<\/tr>/gi,
      ""
   );
   content = content.replace(
      /<tr>\s*<td>\s*<p>\s*\(أ\)\s*<\/p>\s*<\/td>\s*<td>\s*<p>\s*\(ب\)\s*<\/p>\s*<\/td>\s*<td>\s*<p>\s*\((?:ﺠ|جـ|ج)\)\s*<\/p>\s*<\/td>\s*<td>\s*<p>\s*\(د\)\s*<\/p>\s*<\/td>\s*<\/tr>/gi,
      ""
   );

   return (
      <Shell backTo="/sections">
         <div className="max-w-5xl mx-auto">
            {showPdfButton && (
               <div className="mb-4 flex justify-end">
                  <Button asChild variant="outline" size="sm">
                     <a href={pdfUrl} target="_blank" rel="noreferrer">
                        عرض نسخة PDF الرسمية
                     </a>
                  </Button>
               </div>
            )}
            <Card className="shadow-lg">
               <CardContent className="p-8 sm:p-12">
                  <div
                     className="doc-content max-w-none"
                     dangerouslySetInnerHTML={{ __html: content }}
                  />
               </CardContent>
            </Card>
         </div>
      </Shell>
   );
}
