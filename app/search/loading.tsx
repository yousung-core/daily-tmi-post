export default function SearchLoading() {
  return (
    <div className="animate-pulse">
      {/* 검색 헤더 스켈레톤 */}
      <div className="mb-8 pb-4 border-b-2 border-parchment-400">
        <div className="h-8 bg-parchment-300 rounded w-64 mb-2" />
        <div className="h-4 bg-parchment-200 rounded w-40" />
      </div>

      {/* 검색 결과 스켈레톤 */}
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
  );
}
