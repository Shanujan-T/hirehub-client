"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import catalogService from "@/services/catalog";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Interest, UserInterest } from "@/types";

function MyInterestsContent() {
  const [mine, setMine] = useState<UserInterest[]>([]);
  const [catalog, setCatalog] = useState<Interest[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [my, all] = await Promise.all([
        catalogService.listMyInterests(),
        catalogService.listInterests(),
      ]);
      setMine(my);
      setCatalog(all);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!selected) return;
    try {
      await catalogService.addMyInterest({ interest_id: Number(selected) });
      toast.success("Interest added");
      setSelected("");
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const remove = async (id: number) => {
    try {
      await catalogService.deleteMyInterest(id);
      toast.success("Interest removed");
      setMine((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (loading) return <LoadingState message="Loading interests..." />;

  const attachedIds = new Set(mine.map((i) => i.interest_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">My Interests</h1>
        <p className="text-subtle mt-1">Personalize your community feed</p>
      </div>
      <Card className="border-default bg-surface-card">
        <CardContent className="flex flex-wrap gap-3 p-4">
          <Select value={selected} onChange={(e) => setSelected(e.target.value)} className="max-w-xs">
            <option value="">Add interest...</option>
            {catalog.filter((i) => !attachedIds.has(i.id)).map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </Select>
          <Button onClick={add} disabled={!selected}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardContent>
      </Card>
      {mine.length === 0 ? (
        <EmptyState title="No interests yet" description="Add interests to personalize your feed." />
      ) : (
        <div className="flex flex-wrap gap-2">
          {mine.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-2 rounded-full border border-default bg-surface-card px-4 py-2 text-sm font-medium text-heading"
            >
              {item.interest?.name}
              <button type="button" onClick={() => remove(item.id)}>
                <Trash2 className="h-3.5 w-3.5 text-[var(--brand-rose)]" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyInterestsPage() {
  return (
    <AuthenticatedRoute>
      <PortalLayout role="seeker">
        <MyInterestsContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
