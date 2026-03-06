const fs = require('fs');
const filepath = 'src/app/viewer/[code]/dep12-viewer-client.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Replace the getDynamicIcon and DocListItem section to fix the typescript/eslint warnings
const original = `function getDynamicIcon(title, kind) {
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
  const href = \`/uploads/docs/\$\{encodeURIComponent(item.code)}.html\`;

  return (`;

const fixed = `const getDynamicIcon = (title: string, kind: string) => {
  const t = title.toLowerCase();
  if (t.includes('بحر')) return Anchor;
  if (t.includes('جو')) return Plane;
  if (t.includes('فضاء')) return Rocket;
  if (t.includes('برية')) return Target;
  if (t.includes('قيادة') || t.includes('سيطرة')) return Flag;
  if (t.includes('خريط') || t.includes('خرائط')) return MapIcon;
  if (t.includes('شفاف')) return Layers;
  
  return kind === "visuals" ? MapIcon : FileText;
};

function DocListItem({ item }: { item: Dep12DocItem }) {
  const isVisual = item.kind === "visuals";
  const ItemIcon = getDynamicIcon(item.title, item.kind);
  const href = \`/uploads/docs/\$\{encodeURIComponent(item.code)}.html\`;

  return (`;

content = content.replace(original, fixed);
// Update <Icon> to <ItemIcon>
content = content.replace(/<Icon /g, "<ItemIcon ");

fs.writeFileSync(filepath, content);
console.log("Fixed icons eslint warnings");
