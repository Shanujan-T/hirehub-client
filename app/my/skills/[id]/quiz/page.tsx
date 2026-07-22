"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BadgeCheck, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/app/_components/page-states";
import quizService from "@/services/quiz";
import { getApiErrorMessage } from "@/lib/api-client";
import type { SkillQuizQuestion } from "@/types";

function SkillQuizContent() {
  const params = useParams();
  const router = useRouter();
  const skillId = Number(params.id);

  const [questions, setQuestions] = useState<SkillQuizQuestion[]>([]);
  const [skillName, setSkillName] = useState("");
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    pass_threshold: number;
  } | null>(null);

  useEffect(() => {
    if (!Number.isFinite(skillId)) return;
    quizService
      .getQuiz(skillId)
      .then(({ skill, questions: qs }) => {
        setSkillName(skill.name);
        setQuestions(qs);
        setAnswers(Array(qs.length).fill(-1));
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [skillId]);

  const current = questions[step];

  const submitQuiz = async () => {
    if (answers.some((a) => a < 0)) {
      toast.error("Please answer every question.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await quizService.submit(skillId, { answers });
      setResult({
        score: response.score,
        passed: response.passed,
        pass_threshold: response.pass_threshold,
      });
      if (response.passed) {
        toast.success("Skill verified!");
      } else {
        toast.error(`Score ${response.score}% — need ${response.pass_threshold}% to pass.`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading quiz..." />;

  if (result) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Link href="/my/skills" className="inline-flex items-center gap-1 text-sm text-[var(--brand-blue)]">
          <ChevronLeft className="h-4 w-4" /> Back to skills
        </Link>
        <Card className="border-default bg-surface-card">
          <CardHeader>
            <CardTitle>{skillName} quiz result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-4xl font-extrabold text-heading">{result.score}%</p>
            <p className="text-subtle">
              {result.passed
                ? "You passed — this skill is now verified on your profile."
                : `You need ${result.pass_threshold}% to earn the verified badge.`}
            </p>
            {result.passed && (
              <p className="inline-flex items-center justify-center gap-2 font-semibold text-[var(--brand-blue)]">
                <BadgeCheck className="h-5 w-5" /> Verified
              </p>
            )}
            <Button onClick={() => router.push("/my/skills")}>Back to my skills</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!current) {
    return (
      <p className="text-subtle">No quiz questions available for this skill.</p>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link href="/my/skills" className="inline-flex items-center gap-1 text-sm text-[var(--brand-blue)]">
        <ChevronLeft className="h-4 w-4" /> Back to skills
      </Link>
      <div>
        <h1 className="font-display text-2xl font-extrabold text-heading">{skillName} quiz</h1>
        <p className="text-subtle mt-1">
          Question {step + 1} of {questions.length}
        </p>
      </div>
      <Card className="border-default bg-surface-card">
        <CardContent className="space-y-4 pt-6">
          <p className="font-medium text-heading">{current.question}</p>
          <div className="space-y-2">
            {current.options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const next = [...answers];
                  next[step] = index;
                  setAnswers(next);
                }}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  answers[step] === index
                    ? "border-[var(--brand-blue)] bg-[color-mix(in_srgb,var(--brand-blue)_10%,var(--surface-card))]"
                    : "border-default hover:bg-surface-muted"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              Previous
            </Button>
            {step < questions.length - 1 ? (
              <Button
                type="button"
                disabled={answers[step] < 0}
                onClick={() => setStep((s) => s + 1)}
              >
                Next
              </Button>
            ) : (
              <Button type="button" disabled={submitting} onClick={submitQuiz}>
                {submitting ? "Submitting..." : "Submit quiz"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SkillQuizPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker"]}>
      <PortalLayout role="seeker">
        <SkillQuizContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
