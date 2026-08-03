export default function FeedbackLoading() {
  return (
    <>
      <header className="px-5 pt-5 pb-4">
        <span className="text-sm text-stone-500">← 메인으로</span>
      </header>
      <div className="flex flex-col gap-2 mx-5 mt-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-12 bg-amber-100/50 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </>
  );
}
