"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading";

export default function NewPostRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/community?create=1");
  }, [router]);

  return <LoadingScreen />;
}
