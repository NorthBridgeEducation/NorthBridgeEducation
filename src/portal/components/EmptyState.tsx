
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed px-5 py-10 text-center">

      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
        <Icon
          className="size-6 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-base font-semibold">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {children && (
        <div className="mt-5">
          {children}
        </div>
      )}

    </div>
  );
}
