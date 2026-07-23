"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormGroup } from "@/app/_components/page-states";
import { LoadingState } from "@/app/_components/page-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { ImageUpload } from "@/components/image-upload";
import { SkillTagInput } from "@/components/skill-tag-input";
import catalogService from "@/services/catalog";
import { EXPERIENCE_LEVELS, JOB_TYPES } from "@/lib/constants";
import { formatLabel, resolveMediaUrl } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";
import type { Job, Skill } from "@/types";

export const jobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional()
    .or(z.literal("")),
  category: z.string().optional(),
  job_type: z.enum(JOB_TYPES),
  experience_level: z.enum(EXPERIENCE_LEVELS),
  location: z.string().optional(),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  deadline: z.string().optional(),
  skill_ids: z.array(z.number()).optional(),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

export type JobFormSubmitData = ReturnType<typeof formValuesToPayload> & {
  image?: File | null;
  removeImage?: boolean;
};

interface JobFormProps {
  defaultValues?: Partial<JobFormValues>;
  existingImageUrl?: string | null;
  onSubmit: (payload: JobFormSubmitData) => Promise<void>;
  submitLabel: string;
  cancelHref?: string;
  onCancel?: () => void;
}

export function JobForm({
  defaultValues,
  existingImageUrl,
  onSubmit,
  submitLabel,
  onCancel,
}: JobFormProps) {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(
    Boolean(defaultValues?.skill_ids?.length),
  );
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      job_type: "full_time",
      experience_level: "entry",
      location: "",
      salary_min: "",
      salary_max: "",
      deadline: "",
      skill_ids: [],
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (!removeExistingImage && existingImageUrl) {
      setPreviewUrl(resolveMediaUrl(existingImageUrl));
      return;
    }
    setPreviewUrl(null);
  }, [imageFile, existingImageUrl, removeExistingImage]);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setRemoveExistingImage(false);
      return;
    }
    setImageFile(null);
    if (existingImageUrl) {
      setRemoveExistingImage(true);
    }
  };

  useEffect(() => {
    const initialIds = defaultValues?.skill_ids ?? [];
    if (!initialIds.length) return;

    catalogService
      .listSkills()
      .then((catalog) => {
        setSelectedSkills(catalog.filter((skill) => initialIds.includes(skill.id)));
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoadingSkills(false));
  }, [defaultValues?.skill_ids]);

  const handleSkillsChange = (nextSkills: Skill[]) => {
    setSelectedSkills(nextSkills);
    setValue(
      "skill_ids",
      nextSkills.map((skill) => skill.id),
      { shouldValidate: true },
    );
  };

  const handleFormSubmit = async (values: JobFormValues) => {
    setSubmitting(true);
    try {
      await onSubmit({
        ...formValuesToPayload(values),
        image: imageFile,
        removeImage: removeExistingImage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <FormGroup label="Job title">
        <Input
          {...register("title")}
          placeholder="e.g. Senior Frontend Engineer"
          error={errors.title?.message}
        />
      </FormGroup>

      <FormGroup label="Description">
        <Textarea
          {...register("description")}
          rows={6}
          placeholder="Describe the role, responsibilities, and requirements..."
          error={errors.description?.message}
        />
      </FormGroup>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormGroup label="Category">
          <Input
            {...register("category")}
            placeholder="e.g. Engineering"
            error={errors.category?.message}
          />
        </FormGroup>

        <FormGroup label="Location">
          <Input
            {...register("location")}
            placeholder="e.g. Remote, New York"
            error={errors.location?.message}
          />
        </FormGroup>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormGroup label="Job type">
          <Select {...register("job_type")} error={errors.job_type?.message}>
            {JOB_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatLabel(type)}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup label="Experience level">
          <Select
            {...register("experience_level")}
            error={errors.experience_level?.message}
          >
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {formatLabel(level)}
              </option>
            ))}
          </Select>
        </FormGroup>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormGroup label="Salary min">
          <Input
            {...register("salary_min")}
            type="number"
            min={0}
            placeholder="50000"
            error={errors.salary_min?.message}
          />
        </FormGroup>

        <FormGroup label="Salary max">
          <Input
            {...register("salary_max")}
            type="number"
            min={0}
            placeholder="90000"
            error={errors.salary_max?.message}
          />
        </FormGroup>

        <FormGroup label="Application deadline">
          <Input
            {...register("deadline")}
            type="date"
            error={errors.deadline?.message}
          />
        </FormGroup>
      </div>

      <FormGroup label="Required skills">
        {loadingSkills ? (
          <LoadingState message="Loading skills..." />
        ) : (
          <SkillTagInput
            value={selectedSkills}
            onChange={handleSkillsChange}
            placeholder="Search required skills…"
          />
        )}
      </FormGroup>

      <FormGroup
        label="Cover image (optional)"
        hint="Shown on the job listing and detail page. Recommended: 1200×600px."
      >
        <ImageUpload
          file={imageFile}
          previewUrl={previewUrl}
          onFileChange={handleImageChange}
          dropzoneTitle="Add a cover image"
          dropzoneHint="JPG, PNG, or WEBP · max 5MB · optional"
          previewAspectClass="aspect-[2/1] w-full object-cover"
          previewAlt="Job cover preview"
        />
      </FormGroup>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function jobToFormValues(job: Job): Partial<JobFormValues> {
  return {
    title: job.title,
    description: job.description ?? "",
    category: job.category ?? "",
    job_type: job.job_type,
    experience_level: job.experience_level,
    location: job.location ?? "",
    salary_min: job.salary_min != null ? String(job.salary_min) : "",
    salary_max: job.salary_max != null ? String(job.salary_max) : "",
    deadline: job.deadline ?? "",
    skill_ids:
      job.skill_ids ??
      job.skills?.map((js) => js.skill_id).filter(Boolean) ??
      [],
  };
}

export function formValuesToPayload(values: JobFormValues) {
  return {
    title: values.title,
    description: values.description || undefined,
    category: values.category || undefined,
    job_type: values.job_type,
    experience_level: values.experience_level,
    location: values.location || undefined,
    salary_min: values.salary_min ? Number(values.salary_min) : undefined,
    salary_max: values.salary_max ? Number(values.salary_max) : undefined,
    deadline: values.deadline || undefined,
    skill_ids: values.skill_ids,
  };
}
