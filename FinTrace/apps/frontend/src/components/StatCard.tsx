import { Card, CardContent } from './Card';
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 ${change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from yesterday
            </p>
          )}
        </div>
        {icon && <div className="text-3xl text-purple-400">{icon}</div>}
      </div>
    </Card>
  );
};
