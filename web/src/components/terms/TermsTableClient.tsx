"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProposalModal } from "@/app/sections/[number]/proposal-modal";
import { Download, CheckSquare, Square, Ban, Printer } from "lucide-react";
import { ImageZoom } from "@/components/ui/image-zoom";

export function TermsTableClient({
  terms,
  groupedTerms,
  columns,
  isDep13SubSection,
  canPropose,
  highlightTermId,
  canGroup,
  descriptionCol,
  sectionTitle
}: any) {
  const [selectedMap, setSelectedMap] = useState<Record<number, any>>({});
  const selectedCount = Object.keys(selectedMap).length;

  const toggleSelection = (t: any, groupTitle: string = "") => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[t.id]) {
        delete next[t.id];
      } else {
        next[t.id] = { ...t, _groupTitle: groupTitle };
      }
      return next;
    });
  };

  const toggleGroupSelection = (group: any) => {
    const allSelected = group.terms.length > 0 && group.terms.every((t: any) => selectedMap[t.id]);
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (allSelected) {
        group.terms.forEach((t: any) => { delete next[t.id]; });
      } else {
        group.terms.forEach((t: any) => { next[t.id] = { ...t, _groupTitle: group.title }; });
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (canGroup) {
        groupedTerms.forEach((g: any) => {
          g.terms.forEach((t: any) => { next[t.id] = { ...t, _groupTitle: g.title }; });
        });
      } else {
        terms.forEach((t: any) => { next[t.id] = { ...t, _groupTitle: "" }; });
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedMap({});
  };

  const handleExportCsv = () => {
    const selectedRows = Object.values(selectedMap);
    if (selectedRows.length === 0) return;

    // headers based on isDep13SubSection
    let headers: string[] = [];
    if (isDep13SubSection) {
       headers = ["الرمز (رابط الصورة)", "معنى الرمز", "ملاحظات"];
    } else {
       headers = ["الرقم", "المصطلح", "الشرح", "الاختصار"];
    }

    const csvRows = [headers.join(",")];

    for (const t of selectedRows) {
      if (isDep13SubSection) {
        const row = [
          `"${(t.imageUrl || "").replace(/"/g, '""')}"`,
          `"${(t.term || "").replace(/"/g, '""')}"`,
          `"${(t.description || "").replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(","));
      } else {
         const row = [
          `"${(t.itemNumber || "").replace(/"/g, '""')}"`,
          `"${(t.term || "").replace(/"/g, '""')}"`,
          `"${(t.description || "").replace(/"/g, '""')}"`,
          `"${(t.abbreviation || "").replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(","));
      }
    }

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "terms_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    const handlePrint = () => {
    if (selectedCount === 0) return;

        // Group items from all selections across searches
    let printGroups: any[] = [];
    const allSelected = Object.values(selectedMap);
    
    if (canGroup) {
      const groupsMap = new Map<string, any[]>();
      allSelected.forEach((t: any) => {
        const gTitle = t._groupTitle || "";
        if (!groupsMap.has(gTitle)) {
          groupsMap.set(gTitle, []);
        }
        groupsMap.get(gTitle)?.push(t);
      });
      
      groupsMap.forEach((terms, title) => {
        printGroups.push({ title, terms });
      });
    } else {
      printGroups.push({
        title: "",
        terms: allSelected
      });
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("الرجاء السماح بالنوافذ المنبثقة للطباعة");
      return;
    }

    const hasImages = isDep13SubSection;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>طباعة - ${sectionTitle || 'قسم'}</title>
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            padding: 20px; 
            color: #333;
          }
          h1 {
            text-align: center;
            font-size: 24px;
            margin-bottom: 5px;
          }
          h2.subtitle {
            text-align: center;
            font-size: 18px;
            color: #555;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ccc;
          }
          .group-title {
            background-color: #f1f5f9;
            padding: 8px 12px;
            margin-top: 30px;
            margin-bottom: 10px;
            border-right: 4px solid #0f172a;
            font-weight: bold;
          }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            vertical-align: middle; 
            ${hasImages ? 'text-align: center;' : 'text-align: right;'}
          }
          th { background-color: #f8f9fa; font-weight: bold; }
          img { max-width: 150px; max-height: 150px; object-fit: contain; display: block; margin: 0 auto; }
          .abbreviation { font-family: monospace; font-size: 0.9em; background: #eee; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; }
          .controls { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
          .btn { padding: 8px 16px; background: #0f172a; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
          .btn-cancel { background: #cbd5e1; color: #0f172a; }
          @media print {
            body { padding: 0; }
            .controls { display: none; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
          }
        </style>
      </head>
      <body>
        <div class="controls">
          <button class="btn" onclick="window.print()">طباعة الآن</button>
          <button class="btn btn-cancel" onclick="window.close()">إغلاق</button>
        </div>
        
        <h1>${sectionTitle || 'قسم بدون عنوان'}</h1>
        
        ${printGroups.map((group: any) => `
          ${group.title ? `<div class="group-title">${group.title}</div>` : ''}
          <table>
            <thead>
              <tr>
                ${isDep13SubSection ? '<th>الرمز</th>' : '<th>الرقم</th>'}
                <th>المصطلح</th>
                <th>الشرح</th>
              </tr>
            </thead>
            <tbody>
              ${group.terms.map((row: any) => `
                <tr>
                  ${isDep13SubSection 
                    ? `<td style="text-align:center;">${row.imageUrl ? `<img src="${row.imageUrl}" alt="${row.term}" />` : '<span style="color:#888;">لا يوجد</span>'}</td>` 
                    : `<td>${row.itemNumber || '-'}</td>`
                  }
                  <td>
                    <strong>${row.term || '-'}</strong>
                    ${row.abbreviation ? `<br/><span class="abbreviation">${row.abbreviation}</span>` : ''}
                  </td>
                  <td>${row.description || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `).join('')}

        <script>
          // Automatically trigger print dialog when images load
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const renderRow = (t: any, groupTitle: string = "") => {
    const isSelected = !!selectedMap[t.id];
    
    if (isDep13SubSection) {
        return (
            <>
                {/* Symbol Col - with Checkbox */}
                <div className="col-span-4 sm:col-span-3 flex items-center justify-center gap-4 relative group">
                     <button onClick={() => toggleSelection(t, groupTitle)} className="flex-shrink-0 absolute right-4">
                         {isSelected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground" />}
                     </button>
                     <div className="flex-1 flex justify-center items-center mr-8">
                         {t.imageUrl ? (
                            <div className="inline-block bg-white border rounded-md overflow-hidden">
                              <ImageZoom
                                src={t.imageUrl}
                                alt={t.term}
                                className="w-full max-w-[280px] sm:max-w-[360px] h-auto block object-contain"
                                cropBorder={true}
                              />
                            </div>
                         ) : (
                            <span className="text-muted-foreground text-xs italic">لا يوجد رمز</span>
                         )}
                     </div>
                </div>

                {/* Meaning Col (formerly term) - CENTERED */}
                <div className="col-span-4 sm:col-span-4 font-bold text-primary text-base leading-snug flex items-center justify-center text-center">
                    {t.term}
                </div>

                {/* Notes Col (formerly description) */}
                <div className="col-span-4 sm:col-span-5 text-foreground leading-relaxed text-base flex items-center justify-center text-center">
                    {t.description || ""}
                </div>
            </>
        )
    }

    return (
        <>
            <div className="col-span-2 sm:col-span-1 flex items-start gap-2 font-mono text-muted-foreground text-xs pt-1 relative group">
                <button onClick={() => toggleSelection(t, groupTitle)} className="flex-shrink-0 mt-0.5">
                    {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                </button>
                <span className="mt-0.5">{t.itemNumber || "-"}</span>
            </div>
            <div className="col-span-4 sm:col-span-3 font-bold text-primary text-base leading-snug relative pr-1">
                {t.term}
                {canPropose && (
                    <div className="absolute top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ProposalModal term={t} />
                    </div>
                )}
            </div>
            <div className={`${descriptionCol} text-foreground leading-relaxed text-base`}>
                {t.imageUrl && (
                <div className="inline-block bg-white p-1 rounded-md border mb-2 overflow-hidden">
                    <ImageZoom src={t.imageUrl} alt={t.term} className="w-full max-w-[150px] h-auto max-h-[150px] object-contain" cropBorder={true} />
                </div>
                )}
                {t.description || (!t.imageUrl && <span className="text-muted-foreground italic">لا يوجد شرح</span>)}
            </div>
            <div className="hidden sm:flex sm:col-span-1 items-center">
                {t.abbreviation ? (
                  <span className="inline-block font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md text-sm shadow-sm transform hover:scale-105 transition-transform cursor-default select-all" title="اختصار">
                      {t.abbreviation}
                  </span>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/30 border border-muted" title="لا يوجد اختصار">
                      <Ban className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                )}
            </div>
            {canPropose && (
                <div className="hidden sm:block sm:col-span-1">
                    <ProposalModal term={t} />
                </div>
            )}
        </>
    );
  };

  return (
    <div className="flex flex-col gap-4">
       
       <div className="flex flex-wrap items-center justify-between gap-4 bg-background/95 backdrop-blur shadow-sm p-4 rounded-lg border sticky top-20 sm:top-24 z-40 my-2">
          <div className="flex items-center gap-2">
             <button onClick={selectAll} className="text-sm px-3 py-1.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium">تحديد الكل</button>
             <button onClick={clearSelection} className="text-sm px-3 py-1.5 rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground font-medium disabled:opacity-50" disabled={selectedCount === 0}>إلغاء التحديد</button>
             {selectedCount > 0 && <span className="text-sm font-semibold text-primary px-2">{selectedCount} عنصر محدد</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} disabled={selectedCount === 0} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none transition-all">
               <Printer className="w-4 h-4" /> طباعة
            </button>
            {!isDep13SubSection && (
              <button onClick={handleExportCsv} disabled={selectedCount === 0} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none transition-all">
                 <Download className="w-4 h-4" /> تصدير CSV
              </button>
            )}
          </div>
       </div>

       {canGroup ? (
         <div className="flex-1 space-y-6">
            {groupedTerms.map((group: any, idx: number) => (
              <div key={group.id} id={group.id} className="group-section scroll-mt-24 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-muted/40 flex justify-between items-center break-inside-avoid">
                  <div>
                    {group.subTitle && group.parentTitle ? (
                      <div className="space-y-1">
                        {(idx === 0 || groupedTerms[idx - 1]?.parentTitle !== group.parentTitle) && (
                          <div className="text-xs font-semibold text-muted-foreground">{group.parentTitle}</div>
                        )}
                        <div className="text-sm font-semibold">{group.title}</div>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold">{group.title}</div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleGroupSelection(group)}
                    className="flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-md bg-background border border-border shadow-sm hover:bg-accent hover:text-accent-foreground font-medium transition-all"
                  >
                    {group.terms.length > 0 && group.terms.every((t: any) => selectedMap[t.id]) ? (
                      <><CheckSquare className="w-4 h-4 text-primary" /> الغاء تحديد المجموعة</>
                    ) : (
                      <><Square className="w-4 h-4 text-muted-foreground" /> تحديد هذه المجموعة</>
                    )}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[720px] grid grid-cols-12 gap-2 sm:gap-4 border-b bg-muted/50 px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {columns.map((col: any) => (
                          <div key={col.key} className={col.className}>{col.label}</div>
                      ))}
                  </div>

                  {group.terms.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      لا توجد عناصر ضمن هذا العنوان.
                    </div>
                  ) : (
                    <div className="min-w-[720px] divide-y divide-border">
                      {group.terms.map((t: any) => (
                        <div
                          key={t.id}
                          id={`term-${t.id}`}
                          className={`scroll-mt-40 grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm hover:bg-muted/30 transition-colors items-start ${
                                highlightTermId === t.id ? "bg-primary/10 dark:bg-primary/20 border-l-4 border-primary ring-2 ring-primary/30" : ""
                          }`}
                        >
                          {renderRow(t, group?.title || "")}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
       ) : (
         <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
              <div className="min-w-[720px] grid grid-cols-12 gap-2 sm:gap-4 border-b bg-muted/50 px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                 {columns.map((col: any) => (
                      <div key={col.key} className={col.className}>{col.label}</div>
                 ))}
            </div>
            
            {terms.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                    لا توجد نتائج مطابقة للبحث.
                </div>
            ) : (
                <div className="min-w-[720px] divide-y divide-border">
                    {terms.map((t: any) => (
                    <div
                        key={t.id}
                        id={`term-${t.id}`}
                        className={`scroll-mt-40 grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm hover:bg-muted/30 transition-colors items-start ${
                              highlightTermId === t.id ? "bg-primary/10 dark:bg-primary/20 border-l-4 border-primary ring-2 ring-primary/30" : ""
                        }`}
                    >
                       {renderRow(t, "")}
                    </div>
                    ))}
                </div>
            )}
          </div>
        </div>
       )}
    </div>
  );
}
