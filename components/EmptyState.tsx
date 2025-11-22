"use client";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "inbox" | "lock" | "success" | "error" | "warning";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon = "inbox", action }: EmptyStateProps) {
  const getIllustration = () => {
    switch (icon) {
      case "inbox":
        return (
          <svg className="w-48 h-48 mx-auto mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#F3F4F6" />
            <rect x="50" y="60" width="100" height="80" rx="8" fill="#E5E7EB" />
            <rect x="50" y="60" width="100" height="30" rx="8" fill="#D1D5DB" />
            <path d="M50 90 L100 115 L150 90" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="75" cy="75" r="3" fill="#6B7280" />
            <circle cx="125" cy="75" r="3" fill="#6B7280" />
          </svg>
        );
      case "lock":
        return (
          <svg className="w-48 h-48 mx-auto mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#EEF2FF" />
            <rect x="60" y="90" width="80" height="60" rx="8" fill="#C7D2FE" />
            <path d="M75 90 V75 C75 61.2 86.2 50 100 50 C113.8 50 125 61.2 125 75 V90" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round" />
            <circle cx="100" cy="120" r="8" fill="#7C3AED" />
            <rect x="96" y="120" width="8" height="15" fill="#7C3AED" />
          </svg>
        );
      case "success":
        return (
          <svg className="w-48 h-48 mx-auto mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#D1FAE5" />
            <circle cx="100" cy="100" r="60" fill="#10B981" />
            <path d="M75 100 L90 115 L125 80" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-48 h-48 mx-auto mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#FEE2E2" />
            <circle cx="100" cy="100" r="60" fill="#EF4444" />
            <path d="M80 80 L120 120 M120 80 L80 120" stroke="white" strokeWidth="8" strokeLinecap="round" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-48 h-48 mx-auto mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#FEF3C7" />
            <path d="M100 40 L160 140 L40 140 Z" fill="#F59E0B" />
            <circle cx="100" cy="120" r="5" fill="white" />
            <rect x="96" y="80" width="8" height="30" fill="white" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="text-center py-16 px-4">
      {getIllustration()}
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}

