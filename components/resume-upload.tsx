"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
  currentResumeUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  className?: string;
}

function resumeFileName(url?: string | null) {
  if (!url) return null;
  const parts = url.split("/");
  const name = parts[parts.length - 1] ?? url;
  return name.replace(/^\d+_/, "");
}

export function ResumeUpload({ currentResumeUrl, onUpload, className }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const currentName = resumeFileName(currentResumeUrl);

  return (
    <div className={cn("space-y-3", className)}>
      {currentName ? (
        <p className="text-sm text-heading">
          Current resume: <span className="font-medium">{currentName}</span>
        </p>
      ) : (
        <p className="text-subtle text-sm">No resume uploaded yet.</p>
      )}

      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragOver ? "border-[var(--brand-blue)] bg-[color-mix(in_srgb,var(--brand-blue)_8%,transparent)]" : "border-default",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <Upload className="text-subtle mb-3 h-8 w-8" />
        <p className="text-sm font-medium text-heading">Drop your resume here</p>
        <p className="text-subtle mt-1 text-xs">PDF, DOC, or DOCX · max 5MB</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading..." : currentName ? "Replace resume" : "Upload resume"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

export default ResumeUpload;
