import { HeartPulse } from "lucide-react";

export function Logo() {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-2">
        <div className="bg-primary p-2 rounded-lg">
          <HeartPulse className="text-white w-7 h-7" />
        </div>
        <span className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
          AfriCare
        </span>
      </div>
    </div>
  );
}
