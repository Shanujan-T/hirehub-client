import type { AxiosRequestConfig } from "axios";
import apiClient from "./api-client";

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function extractFilename(
  contentDisposition: string | undefined,
  fallback: string,
): string {
  if (!contentDisposition) return fallback;
  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i.exec(
    contentDisposition,
  );
  if (match?.[1]) {
    return match[1].replace(/['"]/g, "").trim();
  }
  return fallback;
}

export async function downloadFromApi(
  url: string,
  fallbackFilename: string,
  config?: AxiosRequestConfig,
): Promise<void> {
  const response = await apiClient.get<Blob>(url, {
    ...config,
    responseType: "blob",
  });

  const filename = extractFilename(
    response.headers["content-disposition"],
    fallbackFilename,
  );

  downloadBlob(response.data, filename);
}
