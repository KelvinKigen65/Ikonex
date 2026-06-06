import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  positive?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-600',   text: 'text-blue-600' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-600',  text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-600', text: 'text-orange-600' },
};

const StatCard = ({ title, value, icon: Icon, change, positive = true, color = 'blue' }: Props) => {
  const colors = colorMap[color];
  return (
    <div className="card flex items-center gap-4">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', colors.bg)}>
        <Icon size={22} className={colors.text} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={clsx('text-xs font-medium', positive ? 'text-green-600' : 'text-red-600')}>
            {positive ? '↑' : '↓'} {change}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
