import React from "react";

export default function OrderPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-text-primary py-8 px-2">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        {/* Current Orders Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-muted-bg animate-pulse" />
            <span>Current Orders</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="bg-[var(--color-second-bg)] rounded-lg p-4 border border-border flex flex-col gap-3 animate-pulse"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded bg-muted-bg" />
                  <div className="h-4 w-24 rounded bg-muted-bg" />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded bg-muted-bg" />
                  <div className="h-3 w-28 rounded bg-muted-bg" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 rounded bg-muted-bg" />
                  <div className="h-5 w-20 rounded bg-muted-bg" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="h-8 w-28 rounded bg-muted-bg" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Previous Orders Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-muted-bg animate-pulse" />
            <span>Previous Orders</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="bg-[var(--color-second-bg)] rounded-lg p-4 border border-border flex flex-col gap-3 animate-pulse"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded bg-muted-bg" />
                  <div className="h-4 w-24 rounded bg-muted-bg" />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded bg-muted-bg" />
                  <div className="h-3 w-28 rounded bg-muted-bg" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 rounded bg-muted-bg" />
                  <div className="h-5 w-20 rounded bg-muted-bg" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="h-8 w-28 rounded bg-muted-bg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
