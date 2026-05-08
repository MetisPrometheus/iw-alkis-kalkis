import Link from "next/link";

export function Paginator({
  currentPage,
  totalPages,
  searchParams,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
  basePath?: string;
}) {
  if (totalPages <= 1) return null;

  const linkFor = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (typeof v === "string" && v && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    const prefix = basePath ?? "";
    return qs ? `${prefix}?${qs}` : prefix || "?";
  };

  const window = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const pages = [...window].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items: (number | "…")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) items.push("…");
    items.push(p);
  });

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1 pt-2 text-sm">
      {currentPage > 1 ? (
        <Link
          href={linkFor(currentPage - 1)}
          className="rounded-md border border-foreground/15 px-3 py-1.5 hover:bg-surface-2"
        >
          ← Forrige
        </Link>
      ) : (
        <span className="rounded-md border border-foreground/10 px-3 py-1.5 text-foreground/30">
          ← Forrige
        </span>
      )}
      {items.map((it, idx) =>
        it === "…" ? (
          <span key={`gap-${idx}`} className="px-2 text-foreground/40">…</span>
        ) : it === currentPage ? (
          <span
            key={it}
            aria-current="page"
            className="rounded-md bg-foreground px-3 py-1.5 font-semibold text-background"
          >
            {it}
          </span>
        ) : (
          <Link
            key={it}
            href={linkFor(it)}
            className="rounded-md border border-foreground/15 px-3 py-1.5 hover:bg-surface-2"
          >
            {it}
          </Link>
        ),
      )}
      {currentPage < totalPages ? (
        <Link
          href={linkFor(currentPage + 1)}
          className="rounded-md border border-foreground/15 px-3 py-1.5 hover:bg-surface-2"
        >
          Neste →
        </Link>
      ) : (
        <span className="rounded-md border border-foreground/10 px-3 py-1.5 text-foreground/30">
          Neste →
        </span>
      )}
    </nav>
  );
}
