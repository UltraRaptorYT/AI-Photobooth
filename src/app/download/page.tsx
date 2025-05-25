import { Suspense } from "react";
import DownloadClient from "@/components/DownloadClient"; // Move logic there

export default function DownloadPage() {
  return (
    <Suspense fallback={<div>Loading download page...</div>}>
      <DownloadClient />
    </Suspense>
  );
}
