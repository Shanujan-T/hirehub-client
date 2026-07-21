"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminAnalytics } from "@/types";

export default function AnalyticsCharts({ analytics }: { analytics: AdminAnalytics }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-default bg-surface-card">
        <CardHeader>
          <CardTitle>Jobs by category</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.jobs_by_category}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0C44B7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-default bg-surface-card">
        <CardHeader>
          <CardTitle>Applications by week</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.applications_by_week}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#5A299A" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-default bg-surface-card lg:col-span-2">
        <CardHeader>
          <CardTitle>Top skills in demand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default text-left">
                  <th className="pb-2 font-semibold text-heading">Skill</th>
                  <th className="pb-2 font-semibold text-heading">Open jobs</th>
                </tr>
              </thead>
              <tbody>
                {analytics.top_skills_in_demand.map((row) => (
                  <tr key={row.skill} className="border-b border-default/60">
                    <td className="py-2 text-heading">{row.skill}</td>
                    <td className="py-2 text-subtle">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
