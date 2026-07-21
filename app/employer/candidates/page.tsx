"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, User } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Select } from "@/components/ui/form";
import { Avatar } from "@/components/ui/shared";
import { UserSkillBadge } from "@/components/user-skill-badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { PageHeader } from "@/app/employer/_components/page-header";
import usersService from "@/services/users";
import catalogService from "@/services/catalog";
import { getApiErrorMessage } from "@/lib/api-client";
import { EDUCATION_LEVELS } from "@/lib/constants";
import { formatLabel } from "@/lib/utils";
import type { CandidatesQueryParams, Skill, User as CandidateUser } from "@/types";

function CandidateCard({ candidate }: { candidate: CandidateUser }) {
  const topSkills = candidate.skills?.slice(0, 4) ?? [];

  return (
    <Link href={`/employer/candidates/${candidate.id}`}>
      <Card className="border-default bg-surface-card card-hover h-full">
        <CardContent className="flex gap-4 p-5">
          <Avatar
            src={candidate.avatar_url}
            name={candidate.full_name}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-heading hover:text-[var(--brand-blue)]">
              {candidate.full_name}
            </h3>
            {candidate.location && (
              <p className="text-subtle text-sm">{candidate.location}</p>
            )}
            {candidate.education_level && (
              <p className="text-subtle text-sm">
                {formatLabel(candidate.education_level)}
              </p>
            )}
            {candidate.bio && (
              <p className="text-subtle mt-2 line-clamp-2 text-sm">
                {candidate.bio}
              </p>
            )}
            {topSkills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topSkills.map((userSkill) => (
                  <UserSkillBadge key={userSkill.id} userSkill={userSkill} showLevel={false} />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CandidatesSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [candidates, setCandidates] = useState<CandidateUser[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [skillId, setSkillId] = useState(searchParams.get("skill_id") ?? "");
  const [education, setEducation] = useState(
    searchParams.get("education_level") ?? "",
  );

  const buildParams = useCallback((): CandidatesQueryParams => {
    return {
      q: query.trim() || undefined,
      location: location.trim() || undefined,
      skill_id: skillId ? Number(skillId) : undefined,
      education_level:
        (education as CandidatesQueryParams["education_level"]) || undefined,
    };
  }, [query, location, skillId, education]);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersService.listCandidates(buildParams());
      setCandidates(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    catalogService
      .listSkills()
      .then(setSkills)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("location", location.trim());
    if (skillId) params.set("skill_id", skillId);
    if (education) params.set("education_level", education);
    router.push(
      params.toString()
        ? `/employer/candidates?${params.toString()}`
        : "/employer/candidates",
    );
    fetchCandidates();
  };

  return (
    <>
      <PageHeader
        title="Search Candidates"
        description="Find talent by skills, location, and education."
      />

      <Card className="border-default bg-surface-card mb-8">
        <CardContent className="p-5">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="q">Keywords</Label>
                <Input
                  id="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name, bio, skills..."
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or region"
                />
              </div>
              <div>
                <Label htmlFor="skill_id">Skill</Label>
                <Select
                  id="skill_id"
                  value={skillId}
                  onChange={(e) => setSkillId(e.target.value)}
                >
                  <option value="">Any skill</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="education_level">Education</Label>
                <Select
                  id="education_level"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                >
                  <option value="">Any level</option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {formatLabel(level)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Button type="submit">
              <Search className="h-4 w-4" />
              Search candidates
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-subtle mb-4 text-sm">
        {loading
          ? "Searching..."
          : `${candidates.length} candidate${candidates.length !== 1 ? "s" : ""} found`}
      </p>

      {loading ? (
        <LoadingState message="Loading candidates..." />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={User}
          title="No candidates found"
          description="Try adjusting your search filters."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}
    </>
  );
}

export default function CandidatesPage() {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalLayout role="employer">
        <Suspense fallback={<LoadingState message="Loading candidates..." />}>
          <CandidatesSearchContent />
        </Suspense>
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
