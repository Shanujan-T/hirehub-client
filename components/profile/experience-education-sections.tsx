"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/form";
import { Textarea } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import profileTimelineService from "@/services/profile-timeline";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Education, Experience } from "@/types";

function formatRange(start: string | null, end: string | null) {
  const s = start ? start.slice(0, 7) : "—";
  const e = end ? end.slice(0, 7) : "Present";
  return `${s} → ${e}`;
}

export function ExperienceEducationSections() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [expOpen, setExpOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [saving, setSaving] = useState(false);

  const [expForm, setExpForm] = useState({
    job_title: "",
    company_name: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
  });
  const [eduForm, setEduForm] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [exps, edus] = await Promise.all([
        profileTimelineService.listExperience(),
        profileTimelineService.listEducation(),
      ]);
      setExperiences(exps);
      setEducations(edus);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openExp = (row?: Experience) => {
    setEditingExp(row ?? null);
    setExpForm({
      job_title: row?.job_title ?? "",
      company_name: row?.company_name ?? "",
      location: row?.location ?? "",
      start_date: row?.start_date?.slice(0, 10) ?? "",
      end_date: row?.end_date?.slice(0, 10) ?? "",
      description: row?.description ?? "",
    });
    setExpOpen(true);
  };

  const openEdu = (row?: Education) => {
    setEditingEdu(row ?? null);
    setEduForm({
      institution: row?.institution ?? "",
      degree: row?.degree ?? "",
      field_of_study: row?.field_of_study ?? "",
      start_date: row?.start_date?.slice(0, 10) ?? "",
      end_date: row?.end_date?.slice(0, 10) ?? "",
    });
    setEduOpen(true);
  };

  const saveExp = async () => {
    setSaving(true);
    try {
      const payload = {
        job_title: expForm.job_title.trim(),
        company_name: expForm.company_name.trim(),
        location: expForm.location.trim() || null,
        start_date: expForm.start_date,
        end_date: expForm.end_date || null,
        description: expForm.description.trim() || null,
      };
      if (editingExp) {
        await profileTimelineService.updateExperience(editingExp.id, payload);
        toast.success("Experience updated");
      } else {
        await profileTimelineService.createExperience(payload);
        toast.success("Experience added");
      }
      setExpOpen(false);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveEdu = async () => {
    setSaving(true);
    try {
      const payload = {
        institution: eduForm.institution.trim(),
        degree: eduForm.degree.trim(),
        field_of_study: eduForm.field_of_study.trim() || null,
        start_date: eduForm.start_date,
        end_date: eduForm.end_date || null,
      };
      if (editingEdu) {
        await profileTimelineService.updateEducation(editingEdu.id, payload);
        toast.success("Education updated");
      } else {
        await profileTimelineService.createEducation(payload);
        toast.success("Education added");
      }
      setEduOpen(false);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-subtle text-sm">Loading experience & education…</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-default bg-surface-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Experience</CardTitle>
          <Button type="button" size="sm" onClick={() => openExp()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {experiences.length === 0 ? (
            <p className="text-subtle text-sm">No work experience added yet.</p>
          ) : (
            experiences.map((row) => (
              <div key={row.id} className="border-b border-default pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-heading">{row.job_title}</p>
                    <p className="text-sm text-heading/80">{row.company_name}</p>
                    <p className="text-subtle text-xs mt-1">
                      {formatRange(row.start_date, row.end_date)}
                      {row.location ? ` · ${row.location}` : ""}
                    </p>
                    {row.description ? (
                      <p className="text-subtle mt-2 whitespace-pre-wrap text-sm">{row.description}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" size="icon" variant="ghost" onClick={() => openExp(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await profileTimelineService.deleteExperience(row.id);
                          toast.success("Experience removed");
                          await load();
                        } catch (err) {
                          toast.error(getApiErrorMessage(err));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-default bg-surface-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Education</CardTitle>
          <Button type="button" size="sm" onClick={() => openEdu()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {educations.length === 0 ? (
            <p className="text-subtle text-sm">No education entries yet.</p>
          ) : (
            educations.map((row) => (
              <div key={row.id} className="border-b border-default pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-heading">{row.degree}</p>
                    <p className="text-sm text-heading/80">{row.institution}</p>
                    {row.field_of_study ? (
                      <p className="text-subtle text-xs mt-0.5">{row.field_of_study}</p>
                    ) : null}
                    <p className="text-subtle text-xs mt-1">
                      {formatRange(row.start_date, row.end_date)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" size="icon" variant="ghost" onClick={() => openEdu(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await profileTimelineService.deleteEducation(row.id);
                          toast.success("Education removed");
                          await load();
                        } catch (err) {
                          toast.error(getApiErrorMessage(err));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Modal open={expOpen} onClose={() => setExpOpen(false)} title={editingExp ? "Edit experience" : "Add experience"}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="job_title">Job title</Label>
            <Input id="job_title" value={expForm.job_title} onChange={(e) => setExpForm((f) => ({ ...f, job_title: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="company_name">Company</Label>
            <Input id="company_name" value={expForm.company_name} onChange={(e) => setExpForm((f) => ({ ...f, company_name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="exp_location">Location</Label>
            <Input id="exp_location" value={expForm.location} onChange={(e) => setExpForm((f) => ({ ...f, location: e.target.value }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="exp_start">Start date</Label>
              <Input id="exp_start" type="date" value={expForm.start_date} onChange={(e) => setExpForm((f) => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="exp_end">End date (blank = Present)</Label>
              <Input id="exp_end" type="date" value={expForm.end_date} onChange={(e) => setExpForm((f) => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label htmlFor="exp_desc">Description</Label>
            <Textarea id="exp_desc" rows={3} value={expForm.description} onChange={(e) => setExpForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setExpOpen(false)}>Cancel</Button>
            <Button type="button" loading={saving} onClick={() => void saveExp()}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={eduOpen} onClose={() => setEduOpen(false)} title={editingEdu ? "Edit education" : "Add education"}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="institution">Institution</Label>
            <Input id="institution" value={eduForm.institution} onChange={(e) => setEduForm((f) => ({ ...f, institution: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="degree">Degree</Label>
            <Input id="degree" value={eduForm.degree} onChange={(e) => setEduForm((f) => ({ ...f, degree: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="field">Field of study</Label>
            <Input id="field" value={eduForm.field_of_study} onChange={(e) => setEduForm((f) => ({ ...f, field_of_study: e.target.value }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="edu_start">Start date</Label>
              <Input id="edu_start" type="date" value={eduForm.start_date} onChange={(e) => setEduForm((f) => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edu_end">End date</Label>
              <Input id="edu_end" type="date" value={eduForm.end_date} onChange={(e) => setEduForm((f) => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEduOpen(false)}>Cancel</Button>
            <Button type="button" loading={saving} onClick={() => void saveEdu()}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
