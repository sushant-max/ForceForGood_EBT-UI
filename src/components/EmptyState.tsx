import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';
interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = <FolderOpen className="h-12 w-12 text-gray-400" />,
  className = ''
}) => {
  return <div className={`bg-white rounded-lg shadow p-8 text-center ${className}`} aria-live="polite">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {actionLabel && onAction && <button onClick={onAction} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#466EE5] hover:bg-[#3355cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#466EE5]">
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </button>}
    </div>;
};