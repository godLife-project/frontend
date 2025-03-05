import { cn } from "@/lib/utils";

export function Badge({ option, selected, onSelect, renderIcon }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
        "border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        selected
          ? "bg-blue-500 text-white border-transparent"
          : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
      )}
    >
      {renderIcon(option.iconKey, 18, "", selected)}
      <span>{option.name}</span>
    </button>
  );
}