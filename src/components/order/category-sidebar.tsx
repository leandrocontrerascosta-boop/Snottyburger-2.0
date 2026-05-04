import type { Category, CategoryId } from "@/lib/types/order";

type CategorySidebarProps = {
  categories: Category[];
  activeCategory: CategoryId;
  onSelect: (categoryId: CategoryId) => void;
  floatingOffset: number;
};

export function CategorySidebar({ categories, activeCategory, onSelect, floatingOffset }: CategorySidebarProps) {
  return (
    <aside
      className="sticky top-20 z-20 self-start rounded-[26px] border border-[var(--line)] bg-[var(--surface)]/95 p-3 shadow-[0_18px_40px_rgba(31,22,18,0.05)] backdrop-blur transition-transform duration-200 md:p-4 lg:top-28 lg:h-fit lg:p-5"
      style={{ transform: `translateY(${floatingOffset}px)` }}
    >
      <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={`rounded-full px-4 py-3 text-left text-sm font-medium transition lg:rounded-[18px] ${
                isActive
                  ? "bg-[var(--surface-strong)] text-[var(--brand)] shadow-[inset_3px_0_0_var(--brand)]"
                  : "text-[var(--muted)] hover:bg-white hover:text-[var(--foreground)]"
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}