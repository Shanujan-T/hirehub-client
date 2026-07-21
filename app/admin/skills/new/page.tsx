"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AdminPageHeader, AdminShell } from "@/app/admin/_components/admin-shell";
import { FormGroup } from "@/app/_components/page-states";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/card";
import catalogService from "@/services/catalog";
import { getApiErrorMessage } from "@/lib/api-client";

const schema = z.object({
  name: z.string().min(2),
  category: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function NewSkillForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const skill = await catalogService.createSkill({
        name: data.name,
        category: data.category || undefined,
        description: data.description || undefined,
      });
      toast.success("Skill created");
      router.push(`/admin/skills/${skill.id}/edit`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Link
        href="/admin/skills"
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to skills
      </Link>
      <AdminPageHeader title="Add Skill" />
      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormGroup label="Name">
              <Input {...register("name")} error={errors.name?.message} />
            </FormGroup>
            <FormGroup label="Category">
              <Input {...register("category")} placeholder="e.g. Programming" />
            </FormGroup>
            <FormGroup label="Description">
              <Textarea {...register("description")} rows={4} />
            </FormGroup>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting}>
                Create Skill
              </Button>
              <Link href="/admin/skills" className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminNewSkillPage() {
  return (
    <AdminShell>
      <NewSkillForm />
    </AdminShell>
  );
}
