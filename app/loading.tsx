// app/loading.tsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 h-screen flex flex-col items-center justify-center bg-[#f4f6f8]">
      <div className="w-16 h-16 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-[#5f2299]/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#5f2299] border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-[#5f2299] font-medium tracking-wide animate-pulse">
        Loading workspace...
      </p>
    </div>
  );
}