import Link from "next/link";

export function Shell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold">
            القاموس العسكري
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/sections"
              className="rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              الأقسام
            </Link>
            <Link
              href="/pages"
              className="rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              الصفحات
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {title ? (
          <div className="mb-4">
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
        ) : null}
        {children}
      </main>

      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-zinc-500">
          Military Dictionary • Next.js + MySQL
        </div>
      </footer>
    </div>
  );
}
