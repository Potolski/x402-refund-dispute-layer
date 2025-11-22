"use client";

import { useState, useEffect } from "react";
import { MdScience, MdClose } from "react-icons/md";
import { isDemoMode, setDemoMode } from "@/lib/demoData";

interface DemoModeToggleProps {
  onToggle: (enabled: boolean) => void;
}

export function DemoModeToggle({ onToggle }: DemoModeToggleProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isDemoMode());
  }, []);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    setDemoMode(newState);
    onToggle(newState);
    
    // Reload to apply changes
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {enabled && (
        <div className="mb-2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn">
          <MdScience className="text-xl" />
          <span className="font-semibold text-sm">Demo Mode Active</span>
          <button
            onClick={handleToggle}
            className="ml-2 hover:bg-yellow-600 rounded p-1 transition-colors"
          >
            <MdClose />
          </button>
        </div>
      )}
      
      <button
        onClick={handleToggle}
        className={`px-4 py-2 rounded-lg shadow-lg font-semibold flex items-center gap-2 transition-all ${
          enabled
            ? "bg-yellow-500 text-white hover:bg-yellow-600"
            : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
        }`}
      >
        <MdScience className="text-xl" />
        {enabled ? "Exit Demo" : "Demo Mode"}
      </button>
    </div>
  );
}

