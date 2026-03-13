"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  icon: Icon,
  className = ""
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: any;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#5f2299]/20 ${
          open ? "border-[#5f2299] ring-2 ring-[#5f2299]/20" : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className={`truncate flex items-center gap-2 ${!selectedOption ? "text-slate-400" : "text-slate-800"}`}>
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        className={`absolute z-30 top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl shadow-[#5f2299]/10 overflow-hidden transition-all duration-200 origin-top transform ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                value === opt.value
                  ? "bg-[#5f2299]/10 text-[#5f2299]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span className="block truncate">{opt.label}</span>
              {value === opt.value && <Check className="w-4 h-4 text-[#5f2299] shrink-0" />}
            </button>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-4 text-sm text-slate-400 text-center">No options available</div>
          )}
        </div>
      </div>
    </div>
  );
}
