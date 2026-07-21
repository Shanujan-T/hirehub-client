"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { ImportResult } from "@/types";

interface ImportDialogProps {
  title?: string;
  description?: string;
  accept?: string;
  triggerLabel?: string;
  onImport: (file: File) => Promise<ImportResult>;
  onSuccess?: (result: ImportResult) => void;
}

export function ImportDialog({
  title = "Import CSV",
  description = "Upload a CSV file to import records.",
  accept = ".csv,text/csv",
  triggerLabel = "Import",
  onImport,
  onSuccess,
}: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setError(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  async function handleSubmit() {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const importResult = await onImport(file);
      setResult(importResult);
      onSuccess?.(importResult);
    } catch (err) {
      setError(getApiErrorMessage(err, "Import failed."));
    } finally {
      setLoading(false);
    }
  }

  const created =
    result?.imported_count ?? result?.created_count ?? result?.created ?? 0;
  const skipped = result?.skipped ?? 0;

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        {triggerLabel}
      </Button>

      <Modal open={open} onClose={handleClose} title={title}>
        <div className="space-y-4">
          <p className="text-sm text-subtle">
            {description}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#0C44B7] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#133099]"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
              setResult(null);
            }}
          />

          {error ? (
            <p className="text-sm text-[#DA3753]" role="alert">
              {error}
            </p>
          ) : null}

          {result ? (
            <div className="rounded-md border border-default bg-surface-muted p-3 text-sm">
              {result.message ? <p className="mb-1">{result.message}</p> : null}
              <p>Created: {created}</p>
              {result.updated_count != null ? (
                <p>Updated: {result.updated_count}</p>
              ) : null}
              {skipped > 0 ? <p>Skipped: {skipped}</p> : null}
              {result.errors?.length ? (
                <ul className="mt-2 list-disc pl-5 text-[#DA3753]">
                  {result.errors.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              {result ? "Close" : "Cancel"}
            </Button>
            {!result ? (
              <Button
                type="button"
                loading={loading}
                disabled={!file}
                onClick={handleSubmit}
              >
                Upload
              </Button>
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ImportDialog;
