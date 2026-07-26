"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Education, Experience, Recommendation } from "@/types";

function formatRange(start: string | null, end: string | null): string {
  if (!start) return "—";
  const startLabel = formatDate(start, { year: "numeric", month: "short" });
  if (!end) return `${startLabel} – Present`;
  return `${startLabel} – ${formatDate(end, { year: "numeric", month: "short" })}`;
}

interface TimelineDisplayProps {
  experiences?: Experience[];
  educations?: Education[];
  recommendations?: Recommendation[];
}

export function TimelineDisplay({
  experiences = [],
  educations = [],
  recommendations,
}: TimelineDisplayProps) {
  const approved =
    recommendations?.filter((r) => r.status === "approved" && r.content) ?? [];

  if (
    experiences.length === 0 &&
    educations.length === 0 &&
    approved.length === 0
  ) {
    return null;
  }

  return (
    <div className="space-y-6">
      {experiences.length > 0 ? (
        <Card className="border-default bg-surface-card">
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {experiences.map((item) => (
                <li key={item.id} className="border-b border-default pb-4 last:border-0 last:pb-0">
                  <p className="font-semibold text-heading">{item.job_title}</p>
                  <p className="text-sm text-heading/80">{item.company_name}</p>
                  <p className="text-subtle mt-0.5 text-xs">
                    {formatRange(item.start_date, item.end_date)}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>
                  {item.description ? (
                    <p className="text-subtle mt-2 whitespace-pre-wrap text-sm">
                      {item.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {educations.length > 0 ? (
        <Card className="border-default bg-surface-card">
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {educations.map((item) => (
                <li key={item.id} className="border-b border-default pb-4 last:border-0 last:pb-0">
                  <p className="font-semibold text-heading">{item.degree}</p>
                  <p className="text-sm text-heading/80">{item.institution}</p>
                  <p className="text-subtle mt-0.5 text-xs">
                    {formatRange(item.start_date, item.end_date)}
                    {item.field_of_study ? ` · ${item.field_of_study}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {approved.length > 0 ? (
        <Card className="border-default bg-surface-card">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {approved.map((item) => (
                <li key={item.id} className="border-b border-default pb-4 last:border-0 last:pb-0">
                  <p className="font-medium text-heading">{item.author_name}</p>
                  {item.author_title ? (
                    <p className="text-subtle text-xs">{item.author_title}</p>
                  ) : null}
                  {item.content ? (
                    <p className="text-subtle mt-2 whitespace-pre-wrap text-sm">
                      {item.content}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default TimelineDisplay;
