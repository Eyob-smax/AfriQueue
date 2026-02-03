import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";

interface LogoProps {
  showText?: boolean;
  className?: string;
  href?: string;
}

export function Logo({ showText = true, className, href = "/" }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
        <MaterialIcon icon="health_and_safety" size={28} />
      </div>
      {showText && (
        <span className="text-xl font-bold leading-tight tracking-tight text-[#0d1b1a] dark:text-white">
          ArifQueue
        </span>
      )}
    </Link>
  );
}
