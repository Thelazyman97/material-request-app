import React from 'react';
import { RequestStatus } from '../types';

interface StatusBadgeProps {
  status: RequestStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = (s: RequestStatus) => {
    switch (s) {
      case RequestStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case RequestStatus.APPROVED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case RequestStatus.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case RequestStatus.ORDERED:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case RequestStatus.DELIVERED:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles(status)}`}>
      {status.replace('_', ' ')}
    </span>
  );
};