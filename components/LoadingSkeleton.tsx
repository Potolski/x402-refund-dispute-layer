"use client";

export function PaymentCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-10"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
        <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
      </div>
    </div>
  );
}

export function PaymentListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <PaymentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DisputeCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>

      <div className="space-y-3 mb-4 pb-4 border-b">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>

      <div className="flex gap-3">
        <div className="h-12 bg-gray-200 rounded-lg flex-1"></div>
        <div className="h-12 bg-gray-200 rounded-lg flex-1"></div>
      </div>
    </div>
  );
}

