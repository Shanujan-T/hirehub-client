"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/form";
import { Textarea } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import recommendationsService from "@/services/recommendations";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Recommendation } from "@/types";

export function RecommendationsSection() {
  const [rows, setRows] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    author_name: "",
    author_email: "",
    author_title: "",
  });
  const [lastSubmitUrl, setLastSubmitUrl] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await recommendationsService.listMine());
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pendingReview = rows.filter((r) => r.content && r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");
  const awaiting = rows.filter((r) => !r.content && r.status === "pending");

  return (
    <Card className="border-default bg-surface-card">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Recommendations</CardTitle>
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          Request a recommendation
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <p className="text-subtle text-sm">Loading…</p>
        ) : (
          <>
            {pendingReview.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-heading">Pending your approval</p>
                {pendingReview.map((row) => (
                  <div key={row.id} className="rounded-xl border border-default p-4">
                    <p className="font-medium text-heading">{row.author_name}</p>
                    {row.author_title ? (
                      <p className="text-subtle text-xs">{row.author_title}</p>
                    ) : null}
                    <p className="text-subtle mt-2 whitespace-pre-wrap text-sm">{row.content}</p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            await recommendationsService.review(row.id, "approved");
                            toast.success("Recommendation approved");
                            await load();
                          } catch (err) {
                            toast.error(getApiErrorMessage(err));
                          }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await recommendationsService.review(row.id, "declined");
                            toast.success("Recommendation declined");
                            await load();
                          } catch (err) {
                            toast.error(getApiErrorMessage(err));
                          }
                        }}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {approved.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-heading">Public on your profile</p>
                {approved.map((row) => (
                  <div key={row.id} className="rounded-xl border border-default bg-surface-muted/40 p-4">
                    <p className="font-medium text-heading">{row.author_name}</p>
                    {row.author_title ? (
                      <p className="text-subtle text-xs">{row.author_title}</p>
                    ) : null}
                    <p className="text-subtle mt-2 whitespace-pre-wrap text-sm">{row.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-subtle text-sm">No approved recommendations yet.</p>
            )}

            {awaiting.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-heading">Awaiting referrer</p>
                {awaiting.map((row) => (
                  <p key={row.id} className="text-subtle text-sm">
                    {row.author_name} ({row.author_email})
                    {row.submit_path ? (
                      <button
                        type="button"
                        className="ml-2 text-[var(--brand-blue)] underline"
                        onClick={async () => {
                          const url = `${window.location.origin}${row.submit_path}`;
                          try {
                            await navigator.clipboard.writeText(url);
                            toast.success("Submit link copied");
                          } catch {
                            toast.error("Could not copy link");
                          }
                        }}
                      >
                        Copy link
                      </button>
                    ) : null}
                  </p>
                ))}
              </div>
            ) : null}
          </>
        )}
      </CardContent>

      <Modal open={open} onClose={() => setOpen(false)} title="Request a recommendation">
        <div className="space-y-3">
          <div>
            <Label htmlFor="ref_name">Referrer name</Label>
            <Input
              id="ref_name"
              value={form.author_name}
              onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="ref_email">Referrer email</Label>
            <Input
              id="ref_email"
              type="email"
              value={form.author_email}
              onChange={(e) => setForm((f) => ({ ...f, author_email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="ref_title">Their title (optional)</Label>
            <Input
              id="ref_title"
              placeholder="Former Manager at Acme"
              value={form.author_title}
              onChange={(e) => setForm((f) => ({ ...f, author_title: e.target.value }))}
            />
          </div>
          {lastSubmitUrl ? (
            <p className="text-subtle text-xs break-all">
              Share link: {lastSubmitUrl}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              loading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  const result = await recommendationsService.request({
                    author_name: form.author_name.trim(),
                    author_email: form.author_email.trim(),
                    author_title: form.author_title.trim() || undefined,
                  });
                  setLastSubmitUrl(result.submit_url);
                  toast.success("Request created — copy the link to share");
                  setForm({ author_name: "", author_email: "", author_title: "" });
                  await load();
                } catch (err) {
                  toast.error(getApiErrorMessage(err));
                } finally {
                  setSaving(false);
                }
              }}
            >
              Send request
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
