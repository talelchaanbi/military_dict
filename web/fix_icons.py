import re

with open('src/app/sections/sections-client.tsx', 'r') as f:
    code = f.read()

# I see it is defined multiple times. Let's remove ALL instances of getSectionIcon.
code = re.sub(r'function getSectionIcon\(number: number, title: string\) \{.*?return Book;\n\}', '', code, flags=re.DOTALL)
code = re.sub(r'const getSectionIcon = \(number: string\) => \{.*?};\n', '', code, flags=re.DOTALL)
code = re.sub(r'const getSectionIcon = \(number: string \| number\) => \{.*?};\n', '', code, flags=re.DOTALL)
code = re.sub(r'function getSectionIcon\(.*?\)\s*\{.*?\}\s*', '', code, flags=re.DOTALL)


icon_func = """const getSectionIcon = (number: string | number) => {
  const n = String(number);
  switch (n) {
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
};
"""

code = code.replace("export function SectionsClient", icon_func + "\nexport function SectionsClient")

with open('src/app/sections/sections-client.tsx', 'w') as f:
    f.write(code)
