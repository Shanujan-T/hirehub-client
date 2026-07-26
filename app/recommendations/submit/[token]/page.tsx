"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Textarea } from "@/components/ui/card";
import { Label } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import recommendationsService from "@/services/recommendations";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Recommendation } from "@/types";

export default function RecommendationSubmitPage() {
  const params = useParams();
  const token = String(params.token || "");
  const [context, setContext] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorTitle, setAuthorTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Invalid link");
      return;
    }
    recommendationsService
      .getSubmitContext(token)
      .then((row) => {
        setContext(row);
        setAuthorName(row.author_name || "");
        setAuthorTitle(row.author_title || "");
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <LoadingState message="Loading recommendation form..." />
      </div>
    );
  }

  if (error || !context) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="Link unavailable"
          description={error || "This recommendation link is invalid or already used."}
          action={
            <Link href="/" className="text-sm font-semibold text-[var(--brand-blue)]">
              Go home
            </Link>
          }
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="Thank you"
          description="Your recommendation was submitted and is awaiting approval."
        />
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-[70vh] py-12">
      <div className="mx-auto max-w-lg px-4">
        <Card className="border-default bg-surface-card">
          <CardHeader>
            <CardTitle>
              Recommend {context.recommended_user?.full_name ?? "this candidate"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-subtle text-sm">
              No HireHub account needed. Your note will appear on their profile only after they approve it.
            </p>
            <div>
              <Label htmlFor="name">Your name</Label>
              <Input id="name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="title">Your title</Label>
              <Input
                id="title"
                placeholder="Former Manager at Acme"
                value={authorTitle}
                onChange={(e) => setAuthorTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="content">Recommendation</Label>
              <Textarea
                id="content"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share how you worked together and what stands out…"
              />
            </div>
            <Button
              loading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await recommendationsService.submit(token, {
                    content: content.trim(),
                    author_name: authorName.trim(),
                    author_title: authorTitle.trim() || undefined,
                  });
                  setDone(true);
                  toast.success("Recommendation submitted");
                } catch (err) {
                  toast.error(getApiErrorMessage(err));
                } finally {
                  setSaving(false);
                }
              }}
            >
              Submit recommendation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
