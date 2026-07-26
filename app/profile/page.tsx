"use client";



import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { toast } from "sonner";

import { AuthenticatedRoute } from "@/components/auth-guard";

import { PortalLayout } from "@/components/layout/main-layout";

import { ResumeUpload } from "@/components/resume-upload";
import { AvatarUpload } from "@/components/avatar-upload";
import { SkillTagInput } from "@/components/skill-tag-input";
import { ExperienceEducationSections } from "@/components/profile/experience-education-sections";
import { RecommendationsSection } from "@/components/profile/recommendations-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Label, Select } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, Textarea } from "@/components/ui/card";
import { LoadingState } from "@/app/_components/page-states";
import { useAuth } from "@/providers/auth-provider";
import authService from "@/services/auth";
import aiService from "@/services/ai";
import { EDUCATION_LEVELS, NOTIFY_VIA_OPTIONS } from "@/lib/constants";
import { getApiErrorMessage } from "@/lib/api-client";
import { resolveMediaUrl, formatLabel } from "@/lib/utils";
import type { EducationLevel, NotifyVia, Skill } from "@/types";
import dashboardService from "@/services/dashboard";
import catalogService from "@/services/catalog";
import companiesService from "@/services/companies";
import { Sparkles } from "lucide-react";



const schema = z.object({

  full_name: z.string().min(2, "Name is required"),

  bio: z.string().optional(),

  location: z.string().optional(),

  phone: z.string().optional(),

  education_level: z.string().optional(),

});



type FormData = z.infer<typeof schema>;



function ProfileContent() {
  const { user, refreshProfile, updateProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [notifyVia, setNotifyVia] = useState<NotifyVia>("email");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [savingNotify, setSavingNotify] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [resumePublic, setResumePublic] = useState(false);
  const [savingResumePublic, setSavingResumePublic] = useState(false);
  const [openToWork, setOpenToWork] = useState(false);
  const [savingOpenToWork, setSavingOpenToWork] = useState(false);
  const [aiResumeDraft, setAiResumeDraft] = useState("");
  const [generatingResume, setGeneratingResume] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [disable2faPassword, setDisable2faPassword] = useState("");
  const [saving2fa, setSaving2fa] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [followedCompanies, setFollowedCompanies] = useState<
    { id: number; name: string }[]
  >([]);

  const {

    register,

    handleSubmit,

    reset,

    formState: { errors },

  } = useForm<FormData>({ resolver: zodResolver(schema) });



  useEffect(() => {

    if (user) {

      reset({

        full_name: user.full_name,

        bio: user.bio ?? "",

        location: user.location ?? "",

        phone: user.phone ?? "",

        education_level: user.education_level ?? "",

      });

      setNotifyVia((user.notify_via as NotifyVia) || "email");
      setWhatsappNumber(user.whatsapp_number ?? "");
      setResumePublic(Boolean(user.resume_public));
      setOpenToWork(Boolean(user.open_to_work));
      setUsernameDraft(user.username ?? "");
      setTwoFactorEnabled(Boolean(user.two_factor_enabled));

    }

  }, [user, reset]);

  useEffect(() => {
    if (user?.role !== "seeker") return;
    companiesService
      .listFollowed()
      .then((rows) =>
        setFollowedCompanies(rows.map((c) => ({ id: c.id, name: c.name }))),
      )
      .catch(() => setFollowedCompanies([]));
  }, [user?.role]);

  const saveUsername = async () => {
    setSavingUsername(true);
    try {
      await updateProfile({ username: usernameDraft.trim().toLowerCase() });
      await refreshProfile();
      toast.success("Public username saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingUsername(false);
    }
  };

  const saveResumePublic = async (next: boolean) => {
    setSavingResumePublic(true);
    setResumePublic(next);
    try {
      await updateProfile({ resume_public: next });
      await refreshProfile();
      toast.success(next ? "Resume is public on your profile" : "Resume hidden from public profile");
    } catch (err) {
      setResumePublic(!next);
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingResumePublic(false);
    }
  };

  const saveOpenToWork = async (next: boolean) => {
    setSavingOpenToWork(true);
    setOpenToWork(next);
    try {
      await authService.toggleOpenToWork(next);
      await refreshProfile();
      toast.success(
        next
          ? "Open to work is visible to employers"
          : "Open to work badge hidden from employers",
      );
    } catch (err) {
      setOpenToWork(!next);
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingOpenToWork(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "seeker") return;
    dashboardService
      .get()
      .then((data) => {
        if (data.role === "seeker" && data.badges?.length) {
          setBadges(data.badges);
        }
      })
      .catch(() => undefined);
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "seeker") return;
    setLoadingSkills(true);
    catalogService
      .listMySkills()
      .then((rows) => {
        setSelectedSkills(
          rows
            .map((row) => row.skill)
            .filter((skill): skill is Skill => Boolean(skill)),
        );
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoadingSkills(false));
  }, [user?.role]);



  if (!user) return <LoadingState />;



  const onSubmit = async (data: FormData) => {

    setSaving(true);

    try {

      await updateProfile({

        full_name: data.full_name,

        bio: data.bio || undefined,

        location: data.location || undefined,

        phone: data.phone || undefined,

        education_level: (data.education_level as EducationLevel) || undefined,

      });

      toast.success("Profile updated");

    } catch (err) {

      toast.error(getApiErrorMessage(err));

    } finally {

      setSaving(false);

    }

  };



  const handleResumeUpload = async (file: File) => {

    try {

      await authService.uploadResume(file);

      await refreshProfile();

      toast.success("Resume uploaded");

    } catch (err) {

      toast.error(getApiErrorMessage(err));

      throw err;

    }

  };

  const generateAiResume = async () => {
    setGeneratingResume(true);
    try {
      const text = await aiService.generateResume();
      setAiResumeDraft(text);
      toast.success("Resume draft generated — review before downloading.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setGeneratingResume(false);
    }
  };

  const downloadAiResume = () => {
    if (!aiResumeDraft.trim()) return;
    const blob = new Blob([aiResumeDraft], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(user?.full_name || "resume").replace(/\s+/g, "-").toLowerCase()}-resume.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyAiResume = async () => {
    if (!aiResumeDraft.trim()) return;
    try {
      await navigator.clipboard.writeText(aiResumeDraft);
      toast.success("Resume draft copied");
    } catch {
      toast.error("Could not copy draft");
    }
  };



  const handleAvatarUpload = async (file: File) => {

    try {

      await authService.uploadAvatar(file);

      await refreshProfile();

      toast.success("Profile photo updated");

    } catch (err) {

      toast.error(getApiErrorMessage(err));

      throw err;

    }

  };



  const handleAvatarRemove = async () => {

    try {

      await updateProfile({ avatar_url: "" });

      toast.success("Profile photo removed");

    } catch (err) {

      toast.error(getApiErrorMessage(err));

      throw err;

    }

  };

  const saveSkills = async () => {
    setSavingSkills(true);
    try {
      await catalogService.replaceMySkills(selectedSkills.map((skill) => skill.id));
      toast.success("Skills updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingSkills(false);
    }
  };

  const saveNotificationPrefs = async () => {
    setSavingNotify(true);
    try {
      await authService.updateNotificationPreferences({
        notify_via: notifyVia,
        whatsapp_number: whatsappNumber || null,
      });
      await refreshProfile();
      toast.success("Notification preferences saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingNotify(false);
    }
  };

  const enable2fa = async () => {
    setSaving2fa(true);
    try {
      await authService.toggle2fa({ enabled: true });
      await refreshProfile();
      setTwoFactorEnabled(true);
      toast.success("Two-factor authentication enabled");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving2fa(false);
    }
  };

  const disable2fa = async () => {
    if (!disable2faPassword) {
      toast.error("Enter your current password to disable 2FA");
      return;
    }
    setSaving2fa(true);
    try {
      await authService.toggle2fa({
        enabled: false,
        password: disable2faPassword,
      });
      await refreshProfile();
      setTwoFactorEnabled(false);
      setDisable2faPassword("");
      toast.success("Two-factor authentication disabled");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving2fa(false);
    }
  };

  const downloadMyData = async (format: "json" | "csv") => {
    setExportingData(true);
    try {
      await authService.exportMyData(format);
      toast.success(`Download started (${format.toUpperCase()})`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setExportingData(false);
    }
  };

  const whatsappConnected =
    Boolean(whatsappNumber) &&
    (notifyVia === "whatsapp" || notifyVia === "both");



  const resumeHref = resolveMediaUrl(user.resume_url);



  return (

    <div className="mx-auto max-w-2xl space-y-6">

      <div>

        <h1 className="font-display text-3xl font-extrabold text-heading">Profile</h1>

        <p className="text-subtle mt-1">Update your professional information</p>

        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-[color-mix(in_srgb,var(--brand-blue)_12%,var(--surface-muted))] px-2.5 py-0.5 text-xs font-semibold text-heading"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

      </div>

      <Card className="border-default bg-surface-card">

        <CardHeader>

          <CardTitle>Profile photo</CardTitle>

        </CardHeader>

        <CardContent>

          <AvatarUpload

            currentImageUrl={user.avatar_url}

            name={user.full_name}

            entityId={user.id}

            shape="circle"

            label="Your photo"

            onUpload={handleAvatarUpload}

            onRemove={handleAvatarRemove}

          />

        </CardContent>

      </Card>

      {user.role === "seeker" && (
        <Card className="border-default bg-surface-card">
          <CardHeader>
            <CardTitle>Public profile link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-subtle text-sm">
              Share a read-only profile page. Your email, phone, and applications stay private.
            </p>
            {user.username ? (
              <div className="space-y-3">
                <p className="text-sm text-heading">
                  Your URL:{" "}
                  <Link
                    href={`/u/${user.username}`}
                    className="font-medium text-[var(--brand-blue)] hover:underline"
                  >
                    /u/{user.username}
                  </Link>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const url = `${window.location.origin}/u/${user.username}`;
                    try {
                      await navigator.clipboard.writeText(url);
                      toast.success("Public profile link copied");
                    } catch {
                      toast.error("Could not copy link");
                    }
                  }}
                >
                  Copy link
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="public-username">Choose your public URL</Label>
                <div className="flex flex-wrap gap-2">
                  <span className="text-subtle inline-flex items-center text-sm">/u/</span>
                  <Input
                    id="public-username"
                    value={usernameDraft}
                    onChange={(e) =>
                      setUsernameDraft(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                    }
                    placeholder="jane-doe"
                    className="max-w-xs"
                    maxLength={30}
                  />
                  <Button
                    type="button"
                    disabled={savingUsername || usernameDraft.length < 3}
                    onClick={saveUsername}
                  >
                    {savingUsername ? "Saving..." : "Save username"}
                  </Button>
                </div>
                <p className="text-subtle text-xs">
                  3–30 characters. Letters, numbers, hyphens, underscores. Can only be set once.
                </p>
              </div>
            )}
            <label className="flex items-start gap-3 text-sm text-heading">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--brand-blue)]"
                checked={resumePublic}
                disabled={savingResumePublic}
                onChange={(e) => void saveResumePublic(e.target.checked)}
              />
              <span>
                Make my resume link visible on my public profile
                <span className="text-subtle mt-0.5 block text-xs">
                  Off by default. Only your public page visitors can see it when enabled.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-heading">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-emerald-600"
                checked={openToWork}
                disabled={savingOpenToWork}
                onChange={(e) => void saveOpenToWork(e.target.checked)}
              />
              <span>
                Open to work — show employers you&apos;re actively looking
                <span className="text-subtle mt-0.5 block text-xs">
                  Adds a green badge employers see on candidate search, applications, and your public profile.
                </span>
              </span>
            </label>
          </CardContent>
        </Card>
      )}

      {user.role === "seeker" ? (
        <>
          <ExperienceEducationSections />
          <RecommendationsSection />
        </>
      ) : null}

      <Card className="border-default bg-surface-card">

        <CardHeader>

          <CardTitle>Personal details</CardTitle>

        </CardHeader>

        <CardContent>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>

              <Label htmlFor="full_name">Full name</Label>

              <Input id="full_name" {...register("full_name")} />

              {errors.full_name && (

                <p className="mt-1 text-sm text-[var(--brand-rose)]">{errors.full_name.message}</p>

              )}

            </div>

            <div>

              <Label htmlFor="bio">Bio</Label>

              <Input id="bio" {...register("bio")} />

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div>

                <Label htmlFor="location">Location</Label>

                <Input id="location" {...register("location")} />

              </div>

              <div>

                <Label htmlFor="phone">Phone</Label>

                <Input id="phone" {...register("phone")} />

              </div>

            </div>

            <div>

              <Label htmlFor="education_level">Education level</Label>

              <Select id="education_level" {...register("education_level")}>

                <option value="">Select level</option>

                {EDUCATION_LEVELS.map((level) => (

                  <option key={level} value={level}>

                    {level}

                  </option>

                ))}

              </Select>

            </div>

            <Button type="submit" disabled={saving}>

              {saving ? "Saving..." : "Save profile"}

            </Button>

          </form>

        </CardContent>

      </Card>

      {user.role === "seeker" && (
        <Card className="border-default bg-surface-card">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-subtle text-sm">
              Add skills to improve job recommendations. Search existing skills or create new ones.
            </p>
            {loadingSkills ? (
              <LoadingState message="Loading skills..." />
            ) : (
              <SkillTagInput
                value={selectedSkills}
                onChange={setSelectedSkills}
                placeholder="Search skills (e.g. React, Python)…"
              />
            )}
            {selectedSkills.length === 0 && !loadingSkills ? (
              <p className="text-subtle text-sm">
                Add your first skill to get better job matches.
              </p>
            ) : null}
            <Button type="button" disabled={savingSkills || loadingSkills} onClick={saveSkills}>
              {savingSkills ? "Saving..." : "Save skills"}
            </Button>
          </CardContent>
        </Card>
      )}

      {user.role === "seeker" && (
        <Card className="border-default bg-surface-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Notification preferences
              {whatsappConnected && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  WhatsApp connected
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="whatsapp_number">WhatsApp number</Label>
              <Input
                id="whatsapp_number"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+94771234567"
              />
              <p className="text-subtle mt-1 text-xs">
                Include country code. Used for job-match alerts when enabled.
              </p>
            </div>
            <div>
              <Label htmlFor="notify_via">Alert channel</Label>
              <Select
                id="notify_via"
                value={notifyVia}
                onChange={(e) => setNotifyVia(e.target.value as NotifyVia)}
              >
                {NOTIFY_VIA_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {formatLabel(option)}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="button" disabled={savingNotify} onClick={saveNotificationPrefs}>
              {savingNotify ? "Saving..." : "Save notification preferences"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-default bg-surface-card">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-subtle text-sm">
            When enabled, you will enter a 6-digit code after signing in with your password.
          </p>
          {twoFactorEnabled ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-heading">2FA is currently on</p>
              <div>
                <Label htmlFor="disable_2fa_password">Current password</Label>
                <PasswordInput
                  id="disable_2fa_password"
                  value={disable2faPassword}
                  onChange={(e) => setDisable2faPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Required to disable 2FA"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={saving2fa}
                onClick={disable2fa}
              >
                {saving2fa ? "Updating..." : "Disable 2FA"}
              </Button>
            </div>
          ) : (
            <Button type="button" disabled={saving2fa} onClick={enable2fa}>
              {saving2fa ? "Updating..." : "Enable 2FA"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-default bg-surface-card">
        <CardHeader>
          <CardTitle>Download my data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={exportingData}
            onClick={() => downloadMyData("json")}
          >
            Download JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={exportingData}
            onClick={() => downloadMyData("csv")}
          >
            Download CSV
          </Button>
        </CardContent>
      </Card>

      {user.role === "seeker" && (
        <Card className="border-default bg-surface-card">
          <CardHeader>
            <CardTitle>Followed Companies</CardTitle>
          </CardHeader>
          <CardContent>
            {followedCompanies.length === 0 ? (
              <p className="text-subtle text-sm">
                You are not following any companies yet. Follow from a company profile page.
              </p>
            ) : (
              <ul className="space-y-2">
                {followedCompanies.map((company) => (
                  <li key={company.id}>
                    <Link
                      href={`/companies/${company.id}`}
                      className="text-sm font-medium text-[var(--brand-blue)] hover:underline"
                    >
                      {company.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-default bg-surface-card">

        <CardHeader>

          <CardTitle>Resume</CardTitle>

        </CardHeader>

        <CardContent className="space-y-4">

          {resumeHref ? (

            <a

              href={resumeHref}

              target="_blank"

              rel="noopener noreferrer"

              className="text-sm font-medium text-[var(--brand-blue)] hover:underline"

            >

              View current resume

            </a>

          ) : null}

          <div className="space-y-3 rounded-xl border border-default bg-surface-muted p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-heading">Generate resume with AI</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={generatingResume}
                onClick={() => void generateAiResume()}
              >
                <Sparkles className="h-4 w-4" />
                Generate draft
              </Button>
            </div>
            <p className="text-subtle text-xs">
              Builds a Markdown resume from your profile skills and details. Edit freely — nothing is saved until you download or upload a file.
            </p>
            {aiResumeDraft ? (
              <>
                <Textarea
                  value={aiResumeDraft}
                  onChange={(e) => setAiResumeDraft(e.target.value)}
                  rows={12}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => void copyAiResume()}>
                    Copy
                  </Button>
                  <Button type="button" size="sm" onClick={downloadAiResume}>
                    Download .md
                  </Button>
                </div>
              </>
            ) : null}
          </div>

          <ResumeUpload currentResumeUrl={user.resume_url} onUpload={handleResumeUpload} />

        </CardContent>

      </Card>

    </div>

  );

}



export default function ProfilePage() {

  return (

    <AuthenticatedRoute>

      <PortalLayout>

        <ProfileContent />

      </PortalLayout>

    </AuthenticatedRoute>

  );

}

