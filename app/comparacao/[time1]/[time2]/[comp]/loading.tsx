export default function LoadingComparison() {
    return (
      <div className="space-y-4">
        <div className="w-full h-16 bg-[#181818] rounded-lg animate-pulse" />
  
        {/* Resumo */}
        <div className="bg-[#1E1E1E] rounded-lg p-4 space-y-3">
          <div className="w-32 h-6 bg-[#282828] mx-auto rounded animate-pulse" />
          {Array(7)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-12 h-5 bg-[#282828] rounded animate-pulse" />
                <div className="w-32 h-5 bg-[#282828] rounded animate-pulse" />
                <div className="w-12 h-5 bg-[#282828] rounded animate-pulse" />
              </div>
            ))}
        </div>
  
        {/* Ataque */}
        <div className="bg-[#1E1E1E] rounded-lg p-4 space-y-3">
          <div className="w-32 h-6 bg-[#282828] mx-auto rounded animate-pulse" />
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-12 h-5 bg-[#282828] rounded animate-pulse" />
                <div className="w-32 h-5 bg-[#282828] rounded animate-pulse" />
                <div className="w-12 h-5 bg-[#282828] rounded animate-pulse" />
              </div>
            ))}
        </div>
  
        {/* Outros blocos */}
        <div className="bg-[#1E1E1E] rounded-lg p-4 space-y-3">
          <div className="w-32 h-6 bg-[#282828] mx-auto rounded animate-pulse" />
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-12 h-5 bg-[#282828] rounded animate-pulse" />
                <div className="w-32 h-5 bg-[#282828] rounded animate-pulse" />
                <div className="w-12 h-5 bg-[#282828] rounded animate-pulse" />
              </div>
            ))}
        </div>
      </div>
    )
  }
  
  