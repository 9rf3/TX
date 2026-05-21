export default function AdminLoading() {
  return (
    <div className="relative min-h-full overflow-hidden bg-[#070b16] px-3 py-4 sm:px-4 md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.12),transparent_40%),radial-gradient(circle_at_85%_16%,rgba(6,182,212,0.08),transparent_38%)]" />
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="h-9 w-56 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-4 w-40 rounded bg-white/5 animate-pulse mt-2" />
          </div>
          <div className="h-6 w-28 rounded-full bg-white/5 animate-pulse" />
        </div>

        <div className="flex gap-2 border-b border-white/10 pb-0">
          {["Overview", "Users", "Courses", "Categories", "Moderation"].map((tab) => (
            <div key={tab} className="h-10 w-24 rounded-t-lg bg-white/5 animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-5 w-16 rounded-full bg-white/5 animate-pulse" />
              </div>
              <div className="h-8 w-20 rounded bg-white/5 animate-pulse" />
              <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-white/5 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-36 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-5 rounded bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
