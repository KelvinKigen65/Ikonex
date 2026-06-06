import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, School, ClipboardList,
  BarChart3, FileText, X, GraduationCap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

const navItems = [
  { to: '/',           label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/streams',    label: 'Class Streams', icon: School          },
  { to: '/students',   label: 'Students',      icon: Users           },
  { to: '/subjects',   label: 'Subjects',      icon: BookOpen        },
  { to: '/assessments',label: 'Assessments',   icon: ClipboardList   },
  { to: '/results',    label: 'Results',       icon: BarChart3       },
  { to: '/reports',    label: 'Reports',       icon: FileText        },
];

interface Props { isOpen: boolean; onClose: () => void; }

const Sidebar = ({ isOpen, onClose }: Props) => {
  const { user } = useAuth();

  return (
    <aside className={clsx(
      'fixed inset-y-0 left-0 z-30 w-64 bg-primary-900 text-white flex flex-col transition-transform duration-300',
      'lg:static lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent-500 rounded-lg flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">Ikonex</p>
            <p className="text-xs text-primary-300">Academy SMS</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-primary-300 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-600 text-white'
                : 'text-primary-200 hover:bg-primary-800 hover:text-white'
            )}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-primary-700">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-primary-300 truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
