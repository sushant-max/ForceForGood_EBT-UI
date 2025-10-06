import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}
export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onRetry,
  className = ''
}) => {
  return <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md ${className}`} role="alert" aria-live="assertive">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          <p className="text-sm mt-1">
            Please try again or contact support if the issue persists.
          </p>
        </div>
        {onRetry && <button onClick={onRetry} className="ml-4 flex items-center text-sm font-medium text-red-700 hover:text-red-800 focus:outline-none" aria-label="Retry">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </button>}
      </div>
    </div>;
};