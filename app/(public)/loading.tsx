export default function Loading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 animate-pulse">
      <div className="space-y-12">
        {/* 헤드라인 배너 스켈레톤 */}
        <div className="py-4 border-b-2 border-parchment-400">
          <div className="h-4 bg-parchment-300 rounded w-48" />
        </div>

        {/* 메인 기사 스켈레톤 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-parchment-100 border border-parchment-400 p-6">
            <div className="aspect-[16/10] bg-parchment-200 mb-4" />
            <div className="h-3 bg-parchment-300 rounded w-20 mb-3" />
            <div className="h-6 bg-parchment-300 rounded w-3/4 mb-2" />
            <div className="h-4 bg-parchment-200 rounded w-full mb-2" />
            <div className="h-4 bg-parchment-200 rounded w-2/3" />
          </div>
          <div className="bg-parchment-100 border border-parchment-400 p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="py-3 border-t border-parchment-300 first:border-t-0">
                <div className="h-3 bg-parchment-300 rounded w-16 mb-2" />
                <div className="h-5 bg-parchment-300 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* 최신 기사 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-parchment-100 border border-parchment-400 p-4">
              <div className="aspect-[16/10] bg-parchment-200 mb-3" />
              <div className="h-3 bg-parchment-300 rounded w-16 mb-2" />
              <div className="h-5 bg-parchment-300 rounded w-3/4 mb-2" />
              <div className="h-4 bg-parchment-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* 사이드바 스켈레톤 */}
      <div className="hidden lg:block">
        <div className="bg-parchment-100 border border-parchment-400 p-6">
          <div className="h-10 bg-parchment-200 rounded mb-4 mx-auto w-10" />
          <div className="h-5 bg-parchment-300 rounded w-3/4 mx-auto mb-3" />
          <div className="h-4 bg-parchment-200 rounded w-full mb-2" />
          <div className="h-10 bg-parchment-300 rounded w-full" />
        </div>
      </div>
    </div>
  );
}
