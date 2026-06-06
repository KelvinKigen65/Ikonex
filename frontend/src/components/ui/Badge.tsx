import clsx from 'clsx';

interface Props { label: string; color?: 'green' | 'red' | 'blue' | 'yellow' | 'gray'; }

const colorMap = {
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  blue:   'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  gray:   'bg-gray-100 text-gray-700',
};

const Badge = ({ label, color = 'gray' }: Props) => (
  <span className={clsx('badge', colorMap[color])}>{label}</span>
);

export default Badge;