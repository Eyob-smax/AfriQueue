import { cn } from "@/lib/utils";

interface MaterialIconProps {
  icon: string;
  className?: string;
  size?: number;
}

export function MaterialIcon({ icon, className, size = 24 }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{ fontSize: size }}
    >
      {icon}
    </span>
  );
}
