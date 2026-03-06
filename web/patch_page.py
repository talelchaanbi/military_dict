import re

with open('src/app/sections/[number]/page.tsx', 'r') as f:
    text = f.read()

import_stmt = "import { TermsTableClient } from \"@/components/terms/TermsTableClient\";\n"
if "TermsTableClient" not in text:
    text = text.replace('import { ProposalModal } from "./proposal-modal";', 'import { ProposalModal } from "./proposal-modal";\n' + import_stmt)

# Let's locate "{canGroup ?" and the end of its tree. 
# A safer way: Use Python's simple string replace for the parts we care about.

# Let's extract the start index of "{canGroup ? (" and the end.
start_idx = text.find("{canGroup ? (")

if start_idx != -1:
    end_idx = text.find("      {/* Pagination */}")
    
    if end_idx != -1:
        new_jsx = """{canGroup ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 xl:w-72 shrink-0">
            <div className="rounded-xl border bg-card/90 text-card-foreground backdrop-blur p-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="text-sm font-semibold text-muted-foreground mb-3">
                العناوين الفرعية
              </div>
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    <a
                      href={`#${item.id}`}
                      className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold text-foreground hover:bg-accent w-fit"
                    >
                      {item.title}
                    </a>
                    {item.children && item.children.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-3">
                        {item.children.map((child) => (
                          <a
                            key={child.id}
                            href={`#${child.id}`}
                            className="rounded-full border bg-muted/70 px-3 py-1 text-xs text-foreground hover:bg-accent"
                          >
                            {child.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <div className="flex-1 min-w-0">
              <TermsTableClient
                 terms={terms as any}
                 groupedTerms={groupedTerms as any}
                 columns={columns as any}
                 isDep13SubSection={isDep13SubSection}
                 canPropose={canPropose}
                 highlightTermId={highlightTermId}
                 canGroup={canGroup}
                 descriptionCol={descriptionCol}
              />
          </div>
        </div>
      ) : (
        <TermsTableClient
             terms={terms as any}
             groupedTerms={groupedTerms as any}
             columns={columns as any}
             isDep13SubSection={isDep13SubSection}
             canPropose={canPropose}
             highlightTermId={highlightTermId}
             canGroup={canGroup}
             descriptionCol={descriptionCol}
          />
      )}

"""
        text = text[:start_idx] + new_jsx + text[end_idx:]

with open('src/app/sections/[number]/page.tsx', 'w') as f:
    f.write(text)

print("page.tsx patched effectively!")
