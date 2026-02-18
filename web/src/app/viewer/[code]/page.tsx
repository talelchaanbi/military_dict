import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  // Security: Allow only alphanumeric characters to prevent traversal
  const safeCode = code.replace(/[^a-zA-Z0-9]/g, "");
  
  const filePath = path.join(process.cwd(), "public", "uploads", "docs", `${safeCode}.html`);

  if (!fs.existsSync(filePath)) {
    return notFound();
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
   const showPdfButton = safeCode === "dep12" || safeCode === "dep13";
   const pdfUrl = `/uploads/docs/${safeCode}.pdf`;

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
