"use client";



import { useEffect, useState } from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import { ArrowLeft, Download, Mail, MapPin, Phone } from "lucide-react";

import { toast } from "sonner";

import { AuthenticatedRoute } from "@/components/auth-guard";

import { PortalLayout } from "@/components/layout/main-layout";

import { UserSkillBadge } from "@/components/user-skill-badge";

import { Button, buttonVariants } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, Badge } from "@/components/ui/shared";

import { LoadingState, EmptyState } from "@/app/_components/page-states";

import { PageHeader } from "@/app/employer/_components/page-header";

import usersService from "@/services/users";

import userSkillsService from "@/services/user-skills";

import { getApiErrorMessage } from "@/lib/api-client";

import { formatDate, formatLabel, resolveMediaUrl } from "@/lib/utils";

import type { User, UserSkill } from "@/types";



function VerifySkillRow({

  userSkill,

  onVerified,

}: {

  userSkill: UserSkill;

  onVerified: (updated: UserSkill) => void;

}) {

  const [loading, setLoading] = useState(false);



  const handleVerify = async () => {

    setLoading(true);

    try {

      const updated = await userSkillsService.verify(userSkill.id);

      onVerified(updated);

      toast.success("Skill verified");

    } catch (err) {

      toast.error(getApiErrorMessage(err));

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="flex flex-wrap items-center gap-2">

      <UserSkillBadge userSkill={userSkill} />

      {!userSkill.verified ? (

        <Button type="button" size="sm" variant="outline" loading={loading} onClick={handleVerify}>

          Verify

        </Button>

      ) : null}

    </div>

  );

}



function CandidateProfileContent() {

  const params = useParams();

  const candidateId = Number(params.id);



  const [candidate, setCandidate] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [downloading, setDownloading] = useState(false);



  useEffect(() => {

    if (!candidateId || Number.isNaN(candidateId)) {

      setLoading(false);

      return;

    }

    usersService

      .getCandidate(candidateId)

      .then(setCandidate)

      .catch((err) => toast.error(getApiErrorMessage(err)))

      .finally(() => setLoading(false));

  }, [candidateId]);



  const handleDownloadPdf = async () => {

    if (!candidate) return;

    setDownloading(true);

    try {

      await usersService.exportCandidatePdf(candidate.id);

      toast.success("Profile PDF downloaded.");

    } catch (err) {

      toast.error(getApiErrorMessage(err));

    } finally {

      setDownloading(false);

    }

  };



  const handleSkillVerified = (updated: UserSkill) => {

    setCandidate((prev) => {

      if (!prev?.skills) return prev;

      return {

        ...prev,

        skills: prev.skills.map((skill) => (skill.id === updated.id ? updated : skill)),

      };

    });

  };



  if (loading) {

    return <LoadingState message="Loading candidate profile..." />;

  }



  if (!candidate) {

    return (

      <EmptyState

        title="Candidate not found"

        description="This profile may not exist or is unavailable."

        action={

          <Link href="/employer/candidates" className={buttonVariants()}>

            Back to search

          </Link>

        }

      />

    );

  }



  const skills = candidate.skills ?? [];

  const interests = candidate.interests ?? [];

  const resumeHref = resolveMediaUrl(candidate.resume_url);



  return (

    <>

      <Link

        href="/employer/candidates"

        className="text-subtle mb-4 inline-flex items-center gap-1 text-sm hover:text-[var(--brand-blue)]"

      >

        <ArrowLeft className="h-4 w-4" /> Back to candidates

      </Link>



      <PageHeader

        title={candidate.full_name}

        description="Candidate profile"

        action={

          <Button loading={downloading} onClick={handleDownloadPdf}>

            <Download className="h-4 w-4" />

            Download PDF

          </Button>

        }

      />



      <div className="grid gap-6 lg:grid-cols-3">

        <div className="space-y-6 lg:col-span-2">

          <Card className="border-default bg-surface-card">

            <CardContent className="flex gap-5 p-6">

              <Avatar

                src={candidate.avatar_url}

                name={candidate.full_name}

                entityId={candidate.id}

                size="lg"

              />

              <div>

                <h2 className="font-display text-xl font-bold text-heading">

                  {candidate.full_name}

                </h2>

                {candidate.education_level && (

                  <p className="text-subtle mt-1 text-sm">

                    {formatLabel(candidate.education_level)}

                  </p>

                )}

                <div className="text-subtle mt-3 space-y-1 text-sm">

                  {candidate.location && (

                    <p className="inline-flex items-center gap-1.5">

                      <MapPin className="h-4 w-4" />

                      {candidate.location}

                    </p>

                  )}

                  <p className="inline-flex items-center gap-1.5">

                    <Mail className="h-4 w-4" />

                    {candidate.email}

                  </p>

                  {candidate.phone && (

                    <p className="inline-flex items-center gap-1.5">

                      <Phone className="h-4 w-4" />

                      {candidate.phone}

                    </p>

                  )}

                </div>

              </div>

            </CardContent>

          </Card>



          {candidate.bio && (

            <Card className="border-default bg-surface-card">

              <CardHeader>

                <CardTitle>About</CardTitle>

              </CardHeader>

              <CardContent>

                <p className="whitespace-pre-wrap text-subtle">{candidate.bio}</p>

              </CardContent>

            </Card>

          )}



          {skills.length > 0 && (

            <Card className="border-default bg-surface-card">

              <CardHeader>

                <CardTitle>Skills</CardTitle>

              </CardHeader>

              <CardContent>

                <div className="flex flex-wrap gap-3">

                  {skills.map((us) => (

                    <VerifySkillRow key={us.id} userSkill={us} onVerified={handleSkillVerified} />

                  ))}

                </div>

              </CardContent>

            </Card>

          )}



          {interests.length > 0 && (

            <Card className="border-default bg-surface-card">

              <CardHeader>

                <CardTitle>Interests</CardTitle>

              </CardHeader>

              <CardContent>

                <div className="flex flex-wrap gap-2">

                  {interests.map((ui) => (

                    <Badge key={ui.id} variant="secondary">

                      {ui.interest?.name ?? "Interest"}

                    </Badge>

                  ))}

                </div>

              </CardContent>

            </Card>

          )}

        </div>



        <div className="space-y-4">

          <Card className="border-default bg-surface-card">

            <CardHeader>

              <CardTitle className="text-base">Details</CardTitle>

            </CardHeader>

            <CardContent className="space-y-3 text-sm">

              <div className="flex justify-between">

                <span className="text-subtle">Member since</span>

                <span className="font-medium text-heading">

                  {formatDate(candidate.created_at)}

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-subtle">Status</span>

                <Badge variant={candidate.is_active ? "success" : "danger"}>

                  {candidate.is_active ? "Active" : "Inactive"}

                </Badge>

              </div>

            </CardContent>

          </Card>



          {resumeHref && (

            <Card className="border-default bg-surface-card">

              <CardHeader>

                <CardTitle className="text-base">Resume</CardTitle>

              </CardHeader>

              <CardContent>

                <a

                  href={resumeHref}

                  target="_blank"

                  rel="noopener noreferrer"

                  className={buttonVariants({ variant: "outline", className: "w-full" })}

                >

                  View resume

                </a>

              </CardContent>

            </Card>

          )}

        </div>

      </div>

    </>

  );

}



export default function CandidateProfilePage() {

  return (

    <AuthenticatedRoute allowedRoles={["employer"]}>

      <PortalLayout role="employer">

        <CandidateProfileContent />

      </PortalLayout>

    </AuthenticatedRoute>

  );

}

