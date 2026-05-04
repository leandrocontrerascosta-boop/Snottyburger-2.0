type SkeletonBlockProps = {
  className?: string;
};

export function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-2xl bg-gradient-to-r from-[#efe7dc] via-[#f7f2ea] to-[#efe7dc] bg-[length:200%_100%] ${className}`}
    />
  );
}
