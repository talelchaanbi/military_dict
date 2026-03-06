import re

# 1. Fix Shell.tsx footer
with open('src/components/layout/Shell.tsx', 'r') as f:
    shell_text = f.read()

shell_text = re.sub(
    r'<div className="flex flex-col items-center justify-center gap-2 text-center">.*?</div>',
    '<div className="flex flex-col items-center justify-center gap-2 text-center"><span className="font-semibold text-lg">القاموس العسكري الموحد</span><p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} جميع الحقوق محفوظة.</p></div>',
    shell_text,
    flags=re.DOTALL
)

with open('src/components/layout/Shell.tsx', 'w') as f:
    f.write(shell_text)

# 2. Fix sections-client.tsx
with open('src/app/sections/sections-client.tsx', 'r') as f:
    sections_text = f.read()

# Make sure imports are correct for icons
if "import {" not in sections_text:
    pass

import_pattern = r'import \{[^}]+\} from "lucide-react";?'
lucide_imports = 'import { Search, Map, Cpu, Plane, Ship, Shield, Navigation, Crosshair, Radio, HardDrive, Network, Settings, Database, BookOpen } from "lucide-react";'

sections_text = re.sub(import_pattern, lucide_imports, sections_text)

# Update getSectionIcon
icon_func = """const getSectionIcon = (number: string) => {
  switch (number) {
    case '1': return <Map className="h-6 w-6 text-emerald-500" />;
    case '2': return <Navigation className="h-6 w-6 text-blue-500" />;
    case '3': return <Search className="h-6 w-6 text-amber-500" />;
    case '4': return <Plane className="h-6 w-6 text-sky-500" />;
    case '5': return <Ship className="h-6 w-6 text-cyan-500" />;
    case '6': return <Shield className="h-6 w-6 text-indigo-500" />;
    case '7': return <Crosshair className="h-6 w-6 text-rose-500" />;
    case '8': return <Radio className="h-6 w-6 text-purple-500" />;
    case '9': return <Cpu className="h-6 w-6 text-fuchsia-500" />;
    case '10': return <HardDrive className="h-6 w-6 text-pink-500" />;
    case '11': return <Network className="h-6 w-6 text-orange-500" />;
    case '12': return <Settings className="h-6 w-6 text-slate-500" />;
    case '13': return <Database className="h-6 w-6 text-teal-500" />;
    default: return <BookOpen className="h-6 w-6 text-primary" />;
  }
};"""

sections_text = re.sub(r'const getSectionIcon = [^}]+.*?};', icon_func, sections_text, flags=re.DOTALL)

# Update Card
card_pattern = r'<Card className="group relative overflow-hidden.*?</Card>'
new_card = """<Card className="group relative overflow-hidden border bg-card/40 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-card/80">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  {getSectionIcon(section.number)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {section.id}
                    </h2>
                    <Badge variant="secondary" className="bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      القسم {section.number}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                {section.title}
              </p>
              
              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                <div className="text-xs font-medium text-muted-foreground group-hover:text-primary/80 transition-colors">
                  {section.termCount} مصطلح
                </div>
                <div className="flex items-center text-xs font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  تصفح <ChevronLeft className="ml-1 h-3 w-3" />
                </div>
              </div>
            </div>
          </Card>"""

sections_text = re.sub(card_pattern, new_card, sections_text, flags=re.DOTALL)

with open('src/app/sections/sections-client.tsx', 'w') as f:
    f.write(sections_text)

print("Restored UI changes!")
