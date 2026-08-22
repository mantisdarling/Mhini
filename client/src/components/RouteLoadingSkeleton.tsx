import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type RouteLoadingSkeletonProps = {
  variant: "portfolio" | "privacy" | "studio";
};

const pulseClass = "bg-muted/70";

export default function RouteLoadingSkeleton({ variant }: RouteLoadingSkeletonProps) {
  if (variant === "studio") return <StudioLoadingSkeleton />;
  if (variant === "privacy") return <PrivacyLoadingSkeleton />;
  return <PortfolioLoadingSkeleton />;
}

function PortfolioLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground" aria-busy="true" aria-label="Loading portfolio">
      <div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between border-b border-border pb-5">
          <Skeleton className={cn("h-4 w-28 rounded-none", pulseClass)} />
          <Skeleton className={cn("h-3 w-32 rounded-none", pulseClass)} />
        </div>
        <section className="grid min-h-[72vh] items-center gap-12 py-20 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <Skeleton className={cn("h-3 w-40 rounded-none", pulseClass)} />
            <Skeleton className={cn("h-20 w-full max-w-4xl rounded-none sm:h-28", pulseClass)} />
            <Skeleton className={cn("h-20 w-4/5 max-w-3xl rounded-none sm:h-28", pulseClass)} />
            <Skeleton className={cn("h-4 w-full max-w-xl rounded-none", pulseClass)} />
            <Skeleton className={cn("h-4 w-3/4 max-w-lg rounded-none", pulseClass)} />
            <div className="flex gap-3 pt-4">
              <Skeleton className={cn("h-11 w-36 rounded-none", pulseClass)} />
              <Skeleton className={cn("h-11 w-28 rounded-none", pulseClass)} />
            </div>
          </div>
          <Skeleton className={cn("aspect-[4/5] w-full max-w-md justify-self-end rounded-none", pulseClass)} />
        </section>
        <div className="grid gap-4 border-t border-border py-12 sm:grid-cols-3">
          {["w-full", "w-11/12", "w-4/5"].map(width => (
            <div key={width} className="space-y-3 border-l border-border pl-4">
              <Skeleton className={cn("h-3 rounded-none", width, pulseClass)} />
              <Skeleton className={cn("h-9 w-2/3 rounded-none", pulseClass)} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function PrivacyLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground sm:px-10" aria-busy="true" aria-label="Loading privacy policy">
      <div className="mx-auto max-w-3xl">
        <Skeleton className={cn("h-3 w-32 rounded-none", pulseClass)} />
        <Skeleton className={cn("mt-16 h-3 w-44 rounded-none", pulseClass)} />
        <Skeleton className={cn("mt-5 h-14 w-full rounded-none sm:h-20", pulseClass)} />
        <div className="mt-10 space-y-6">
          {["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3"].map((width, index) => (
            <Skeleton key={`${width}-${index}`} className={cn("h-4 rounded-none", width, pulseClass)} />
          ))}
        </div>
      </div>
    </main>
  );
}

function StudioLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-6 lg:p-8" aria-busy="true" aria-label="Loading Studio">
      <div className="mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden min-h-[calc(100vh-4rem)] border border-border p-5 lg:block">
          <Skeleton className={cn("h-8 w-32 rounded-none", pulseClass)} />
          <div className="mt-12 space-y-3">
            {["w-full", "w-5/6", "w-full"].map((width, index) => <Skeleton key={`${width}-${index}`} className={cn("h-10 rounded-none", width, pulseClass)} />)}
          </div>
          <Skeleton className={cn("mt-[55vh] h-10 w-full rounded-none", pulseClass)} />
        </aside>
        <section className="space-y-8">
          <div className="flex items-end justify-between gap-6 border-b border-border pb-6">
            <div className="w-full max-w-2xl space-y-4">
              <Skeleton className={cn("h-3 w-52 rounded-none", pulseClass)} />
              <Skeleton className={cn("h-12 w-full max-w-xl rounded-none", pulseClass)} />
              <Skeleton className={cn("h-4 w-4/5 rounded-none", pulseClass)} />
            </div>
            <Skeleton className={cn("hidden h-10 w-40 rounded-none sm:block", pulseClass)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className={cn("h-24 rounded-none", pulseClass)} />)}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Skeleton className={cn("h-[34rem] rounded-none", pulseClass)} />
            <Skeleton className={cn("h-[34rem] rounded-none", pulseClass)} />
          </div>
        </section>
      </div>
    </main>
  );
}
