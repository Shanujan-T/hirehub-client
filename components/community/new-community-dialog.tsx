"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { FormGroup } from "@/app/_components/page-states";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/form";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import { COMMUNITY_TYPES } from "@/lib/constants";
import { formatLabel } from "@/lib/utils";

const NAME_TAKEN_INLINE =
  "A community with this name already exists — try a different name.";

const createCommunitySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  type: z.enum(COMMUNITY_TYPES),
  description: z.string().max(2000).optional().or(z.literal("")),
  location: z.string().max(150).optional().or(z.literal("")),
  industry: z.string().max(150).optional().or(z.literal("")),
  rules: z.string().max(2000).optional().or(z.literal("")),
});

type CreateCommunityForm = z.infer<typeof createCommunitySchema>;

interface NewCommunityDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function NewCommunityDialog({
  open,
  onClose,
  onCreated,
}: NewCommunityDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateCommunityForm>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      type: "interest",
      description: "",
      location: "",
      industry: "",
      rules: "",
    },
  });

  const handleClose = () => {
    reset({
      type: "interest",
      description: "",
      location: "",
      industry: "",
      rules: "",
      name: "",
    });
    onClose();
  };

  const onSubmit = async (data: CreateCommunityForm) => {
    setSubmitting(true);
    clearErrors("name");
    try {
      const community = await socialService.createCommunity({
        name: data.name.trim(),
        type: data.type,
        description: data.description?.trim() || undefined,
        location: data.location?.trim() || undefined,
        industry: data.industry?.trim() || undefined,
        rules: data.rules?.trim() || undefined,
      });
      toast.success("Community created!");
      handleClose();
      onCreated?.();
      router.push(`/communities/${community.id}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError("name", { type: "server", message: NAME_TAKEN_INLINE });
        return;
      }
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create a Community" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormGroup label="Name" hint="Must be unique (exact match, case-sensitive).">
          <Input
            {...register("name", {
              onChange: () => clearErrors("name"),
            })}
            placeholder="e.g. Python Developers SL"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? (
            <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
              {errors.name.message}
            </p>
          ) : null}
        </FormGroup>

        <FormGroup label="Type">
          <Select {...register("type")}>
            {COMMUNITY_TYPES.map((communityType) => (
              <option key={communityType} value={communityType}>
                {formatLabel(communityType)}
              </option>
            ))}
          </Select>
          {errors.type ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">{errors.type.message}</p>
          ) : null}
        </FormGroup>

        <FormGroup label="Description">
          <Textarea
            {...register("description")}
            rows={3}
            placeholder="What is this community about?"
          />
        </FormGroup>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormGroup label="Location">
            <Input {...register("location")} placeholder="City or region" />
          </FormGroup>
          <FormGroup label="Industry">
            <Input {...register("industry")} placeholder="e.g. Technology" />
          </FormGroup>
        </div>

        <FormGroup label="Rules">
          <Textarea
            {...register("rules")}
            rows={3}
            placeholder="Optional community guidelines"
          />
        </FormGroup>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create community
          </Button>
        </div>
      </form>
    </Modal>
  );
}
