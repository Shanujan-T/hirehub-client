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
import catalogService from "@/services/catalog";
import { getApiErrorMessage } from "@/lib/api-client";

const schema = z.object({
  name: z.string().min(2),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function NewInterestForm() {
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
      const interest = await catalogService.createInterest({
        name: data.name,
        category: data.category || undefined,
      });
      toast.success("Interest created");
      router.push(`/admin/interests/${interest.id}/edit`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Link
        href="/admin/interests"
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to interests
      </Link>
      <AdminPageHeader title="Add Interest" />
      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormGroup label="Name">
              <Input {...register("name")} error={errors.name?.message} />
            </FormGroup>
            <FormGroup label="Category">
              <Input {...register("category")} placeholder="Optional" />
            </FormGroup>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting}>
                Create Interest
              </Button>
              <Link href="/admin/interests" className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminNewInterestPage() {
  return (
    <AdminShell>
      <NewInterestForm />
    </AdminShell>
  );
}
