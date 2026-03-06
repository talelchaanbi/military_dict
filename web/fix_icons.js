const fs = require('fs');
const filepath = 'src/app/viewer/[code]/dep12-viewer-client.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const newImports = `import { Search, FileText, Map as MapIcon, Sparkles, ChevronLeft, Zap, Layers, Anchor, Rocket, Target, Flag, Shield, Plane } from "lucide-react";`;
content = content.replace(/import \{ Search, FileText, Map, Sparkles, ChevronLeft, Zap, Layers \} from "lucide-react";/, newImports);

const newDocListItem = `function getDynamicIcon(title, kind) {
  const t = title.toLowerCase();
  if (t.includes('بحر')) return Anchor;
  if (t.includes('جو')) return Plane;
  if (t.includes('فضاء')) return Rocket;
  if (t.includes('برية')) return Target;
  if (t.includes('قيادة') || t.includes('سيطرة')) return Flag;
  if (t.includes('خريط') || t.includes('خرائط')) return MapIcon;
  if (t.includes('شفاف')) return Layers;
  
  return kind === "visuals" ? MapIcon : FileText;
}

function DocListItem({ item }: { item: Dep12DocItem }) {
  const isVisual = item.kind === "visuals";
  const Icon = getDynamicIcon(item.title, item.kind);
  const href = \`/uploads/docs/\${encodeURIComponent(item.code)}.html\`;

  return (`;

content = content.replace(/function DocListItem\(\{\s*item\s*\}\:\s*\{\s*item:\s*Dep12DocItem\s*\}\)\s*\{\s*const isVisual \= item\.kind \=\=\= "visuals"\;\s*const Icon \= isVisual \? Map \: FileText\;\s*const href \= \`\/uploads\/docs\/\$\{encodeURIComponent\(item\.code\)\}\.html\`\;\s*return \(/s, newDocListItem);

// also replace Map -> MapIcon in the rest of the file
content = content.replace(/icon=\{Map\}/g, "icon={MapIcon}");

fs.writeFileSync(filepath, content);
console.log("Updated icons!");
