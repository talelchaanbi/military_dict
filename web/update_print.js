const fs = require('fs');
const file = 'src/components/terms/TermsTableClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace props signature to add sectionTitle
content = content.replace(
  /export function TermsTableClient\(\{\s*terms,\s*groupedTerms,\s*columns,\s*isDep13SubSection,\s*canPropose,\s*highlightTermId,\s*canGroup,\s*descriptionCol/s,
  `export function TermsTableClient({
  terms,
  groupedTerms,
  columns,
  isDep13SubSection,
  canPropose,
  highlightTermId,
  canGroup,
  descriptionCol,
  sectionTitle`
);

// We need to replace handlePrint.
const newHandlePrint = `  const handlePrint = () => {
    if (selectedIds.size === 0) return;

    // Group items for printing
    let printGroups = [];
    
    if (canGroup) {
      groupedTerms.forEach((g) => {
        const selectedInGroup = g.terms.filter((t) => selectedIds.has(t.id));
        if (selectedInGroup.length > 0) {
          printGroups.push({
            title: g.title,
            terms: selectedInGroup
          });
        }
      });
    } else {
      const selectedRows = terms.filter((t) => selectedIds.has(t.id));
      if (selectedRows.length > 0) {
        printGroups.push({
          title: "", // No subtitle
          terms: selectedRows
        });
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("الرجاء السماح بالنوافذ المنبثقة للطباعة");
      return;
    }

    const hasImages = isDep13SubSection;

    const htmlContent = \`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>طباعة - \${sectionTitle || 'قسم'}</title>
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
            \${hasImages ? 'text-align: center;' : 'text-align: right;'}
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
        
        <h1>\${sectionTitle || 'قسم بدون عنوان'}</h1>
        
        \${printGroups.map(group => \`
          \${group.title ? \`<div class="group-title">\${group.title}</div>\` : ''}
          <table>
            <thead>
              <tr>
                \${isDep13SubSection ? '<th>الرمز</th>' : '<th>الرقم</th>'}
                <th>المصطلح</th>
                <th>الشرح</th>
              </tr>
            </thead>
            <tbody>
              \${group.terms.map(row => \`
                <tr>
                  \${isDep13SubSection 
                    ? \`<td style="text-align:center;">\${row.imageUrl ? \`<img src="\${row.imageUrl}" alt="\${row.term}" />\` : '<span style="color:#888;">لا يوجد</span>'}</td>\` 
                    : \`<td>\${row.itemNumber || '-'}</td>\`
                  }
                  <td>
                    <strong>\${row.term || '-'}</strong>
                    \${row.abbreviation ? \`<br/><span class="abbreviation">\${row.abbreviation}</span>\` : ''}
                  </td>
                  <td>\${row.description || '-'}</td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        \`).join('')}

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
    \`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };`;

// replace old handlePrint with new
content = content.replace(/const handlePrint = \(\) => \{[\s\S]*?printWindow\.document\.close\(\);\n  \};/, newHandlePrint);

fs.writeFileSync(file, content);
