/**
 * Skeleton loading components — one per page layout.
 * Uses animate-pulse to give a perceived-instant feel while data loads.
 */

const Bone = ({ className = '' }) => (
  <div className={`bg-gray-100 dark:bg-slate-800 rounded animate-pulse ${className}`} />
);

// ── Stat card skeleton (Dashboard) ─────────────────────────
const StatCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 space-y-3">
    <div className="flex justify-between items-center">
      <Bone className="h-4 w-24" />
      <Bone className="h-8 w-8 rounded-xl" />
    </div>
    <Bone className="h-8 w-16" />
    <Bone className="h-3 w-32" />
  </div>
);

// ── Objective card skeleton ─────────────────────────────────
const ObjectiveCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
    <div className="h-36 bg-gray-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
      <Bone className="h-16 w-16 rounded-2xl" />
    </div>
    <div className="p-5 space-y-3">
      <Bone className="h-4 w-3/4" />
      <Bone className="h-3 w-full" />
      <Bone className="h-3 w-2/3" />
      <div className="flex justify-between pt-2 border-t border-gray-50 dark:border-slate-800">
        <Bone className="h-3 w-20" />
        <Bone className="h-3 w-24" />
      </div>
    </div>
  </div>
);

// ── Schedule item skeleton ──────────────────────────────────
const ScheduleItem = () => (
  <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 animate-pulse">
    <Bone className="h-10 w-10 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Bone className="h-4 w-1/3" />
      <Bone className="h-3 w-1/2" />
    </div>
    <Bone className="h-8 w-24 rounded-lg" />
  </div>
);

// ── Analytics card skeleton ─────────────────────────────────
const AnalyticsCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 space-y-4">
    <Bone className="h-4 w-32" />
    <Bone className="h-40 w-full rounded-xl" />
  </div>
);

// ── Note card skeleton ──────────────────────────────────────
const NoteCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 space-y-3 animate-pulse">
    <div className="flex justify-between">
      <Bone className="h-4 w-2/5" />
      <Bone className="h-4 w-16" />
    </div>
    <Bone className="h-3 w-full" />
    <Bone className="h-3 w-4/5" />
    <Bone className="h-3 w-3/5" />
  </div>
);

// ── Full page skeletons ─────────────────────────────────────

export const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <StatCard key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 space-y-4">
        <Bone className="h-4 w-32" />
        <Bone className="h-48 w-full rounded-xl animate-pulse" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <StatCard key={i} />)}
      </div>
    </div>
  </div>
);

export const ObjectivesSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between items-center">
      <Bone className="h-8 w-40" />
      <Bone className="h-10 w-36 rounded-xl" />
    </div>
    <div className="flex gap-3">
      <Bone className="h-10 flex-1 rounded-xl" />
      <Bone className="h-10 w-32 rounded-xl" />
      <Bone className="h-10 w-32 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => <ObjectiveCard key={i} />)}
    </div>
  </div>
);

export const ScheduleSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between items-center">
      <Bone className="h-8 w-36" />
      <Bone className="h-10 w-40 rounded-xl" />
    </div>
    {/* Day tabs */}
    <div className="flex gap-2 overflow-x-auto pb-1">
      {[...Array(7)].map((_, i) => <Bone key={i} className="h-10 w-24 rounded-xl flex-shrink-0" />)}
    </div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => <ScheduleItem key={i} />)}
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between items-center">
      <Bone className="h-8 w-28" />
      <Bone className="h-10 w-40 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <StatCard key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => <AnalyticsCard key={i} />)}
    </div>
  </div>
);

export const NotesSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between items-center">
      <Bone className="h-8 w-24" />
      <Bone className="h-10 w-32 rounded-xl" />
    </div>
    <Bone className="h-10 w-full rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => <NoteCard key={i} />)}
    </div>
  </div>
);

export const AIAssistantSkeleton = () => (
  <div className="space-y-6 p-6">
    <Bone className="h-8 w-48" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Bone className="h-64 w-full rounded-2xl" />
        <Bone className="h-14 w-full rounded-xl" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <AnalyticsCard key={i} />)}
      </div>
    </div>
  </div>
);
