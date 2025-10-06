import React from 'react';
interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'chart' | 'text';
  count?: number;
  className?: string;
}
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
            <div className="flex justify-between items-start">
              <div className="w-2/3">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="mt-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>;
      case 'table':
        return <div className={`bg-white rounded-lg shadow ${className}`}>
            <div className="border-b border-gray-200 p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
            </div>
            {Array.from({
            length: 5
          }).map((_, i) => <div key={i} className="border-b border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              </div>)}
          </div>;
      case 'chart':
        return <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>;
      case 'text':
        return <div className={className}>
            {Array.from({
            length: count
          }).map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>)}
          </div>;
      default:
        return null;
    }
  };
  return <>{renderSkeleton()}</>;
};