export default function PlatformLoading() {
  return (
    <div className="flex flex-col h-full min-h-[60vh] p-4 md:p-6">
      <div className="flex items-center justify-center flex-1">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-light">Loading...</span>
        </div>
      </div>
    </div>
  );
}
