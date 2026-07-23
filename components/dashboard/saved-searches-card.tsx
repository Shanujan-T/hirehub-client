import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLabel } from "@/lib/utils";
import type { SavedSearch } from "@/types";

export function SavedSearchesCard({
  searches,
  deletingId,
  onOpen,
  onDelete,
}: {
  searches: SavedSearch[];
  deletingId: number | null;
  onOpen: (search: SavedSearch) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Card className="glass-card overflow-hidden border-default">
      <CardHeader className="border-b border-default bg-[color-mix(in_srgb,var(--brand-blue)_8%,var(--surface-card))]">
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Saved searches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {searches.length ? (
          searches.map((search) => (
            <div
              key={search.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-default p-4"
            >
              <button type="button" onClick={() => onOpen(search)} className="text-left">
                <p className="font-semibold text-heading">
                  {search.name || search.keywords || search.category || "Saved search"}
                </p>
                <p className="text-subtle mt-1 text-xs">
                  {[
                    search.keywords,
                    search.location,
                    search.job_type ? formatLabel(search.job_type) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Custom filters"}
                </p>
              </button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                loading={deletingId === search.id}
                onClick={() => onDelete(search.id)}
                aria-label="Delete saved search"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-default bg-surface-muted px-4 py-6 text-center">
            <p className="text-subtle text-sm">
              Save a search from the Jobs page to get notified when new matching jobs are posted.
            </p>
            <Link
              href="/jobs"
              className="mt-3 inline-block text-sm font-semibold text-[var(--brand-blue)] hover:underline"
            >
              Go to Jobs →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
