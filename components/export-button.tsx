"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  label?: string;
  filename?: string;
  onExport: () => Promise<void>;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportButton({
  label = "Export",
  onExport,
  variant = "outline",
  size = "sm",
  className,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      await onExport();
    } catch (err) {
      setError(getApiErrorMessage(err, "Export failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant={variant}
        size={size}
        loading={loading}
        onClick={handleClick}
      >
        <Download className="size-4" />
        {label}
      </Button>
      {error ? (
        <p className="mt-1 text-xs text-[#DA3753]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default ExportButton;
