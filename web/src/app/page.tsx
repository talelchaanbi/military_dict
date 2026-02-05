import Link from "next/link";

import { Shell } from "@/components/Shell";

export default function Home() {
  return (
    <Shell>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold">القاموس العسكري</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            نسخة حديثة تعتمد على قاعدة بيانات MySQL.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/sections"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              تصفح الأقسام
            </Link>
            <Link
              href="/pages"
              className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              عرض الصفحات
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <div className="font-semibold text-zinc-900 dark:text-zinc-50">
            ملاحظة
          </div>
          <p className="mt-2">
            القسمان (12 و 13) يعرضان المحتوى كصفحات ويب.
          </p>
        </div>
      </div>
    </Shell>
  );
}
