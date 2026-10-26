import { HaritaPazariSkeleton } from "@/components/harita-pazari/harita-pazari-client";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 h-10 w-64 animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none" />
      <HaritaPazariSkeleton />
    </div>
  );
}
