export default function CategoryLoading() {
  return (
    <div className="animate-pulse">
      {/* 네비게이션 */}
      <div className="h-4 bg-parchment-300 rounded w-32 mb-6" />

      {/* 카테고리 헤더 */}
      <div className="text-center mb-8 pb-6 border-b-2 border-parchment-400">
        <div className="h-14 w-14 bg-parchment-200 rounded-full mx-auto mb-4" />
        <div className="h-8 bg-parchment-300 rounded w-48 mx-auto mb-3" />
        <div className="h-4 bg-parchment-200 rounded w-64 mx-auto" />
      </div>

      {/* 기사 수 */}
      <div className="text-center mb-6">
        <div className="h-4 bg-parchment-200 rounded w-24 mx-auto" />
      </div>

      {/* 기사 목록 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-parchment-100 border border-parchment-400 p-4">
            <div className="aspect-[16/10] bg-parchment-200 mb-3" />
            <div className="h-5 bg-parchment-300 rounded w-3/4 mb-2" />
            <div className="h-4 bg-parchment-200 rounded w-full mb-2" />
            <div className="h-3 bg-parchment-200 rounded w-1/3 mt-3 pt-3 border-t border-parchment-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
