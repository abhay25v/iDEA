import { Card } from './Card';
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-blue-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from yesterday
            </p>
          )}
        </div>
        {icon && <div className="text-3xl text-blue-500 opacity-80">{icon}</div>}
      </div>
    </Card>
  );
};
