import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, School, ClipboardList,
  BarChart3, FileText, X, SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatRoleLabel } from '@/lib/roles';
import type { Role } from '@/types';
import clsx from 'clsx';

const navItems = [
  { to: '/',           label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/streams',    label: 'Class Streams', icon: School          },
  { to: '/students',   label: 'Students',      icon: Users           },
  { to: '/subjects',   label: 'Subjects',      icon: BookOpen        },
  { to: '/assessments',label: 'Assessments',   icon: ClipboardList   },
  { to: '/results',    label: 'Results',       icon: BarChart3       },
  { to: '/reports',    label: 'Reports',       icon: FileText        },
  { to: '/settings/grading-scales', label: 'Grading Scales', icon: SlidersHorizontal },
];

const navByRole: Record<Role, typeof navItems> = {
  SUPER_ADMIN: navItems,
  ADMIN: navItems,
  TEACHER: [
    navItems[0],
    navItems[1],
    navItems[2],
    navItems[3],
    navItems[4],
    navItems[5],
    navItems[6],
  ],
  STUDENT: [navItems[0]],
};

interface Props { isOpen: boolean; onClose: () => void; }

const Sidebar = ({ isOpen, onClose }: Props) => {
  const { user } = useAuth();
  const visibleNavItems = user ? navByRole[user.role] : [navItems[0]];

  return (
    <aside className={clsx(
      'fixed inset-y-0 left-0 z-30 w-72 text-white flex flex-col transition-transform duration-300',
      'bg-gradient-to-b from-slate-950 via-primary-950 to-primary-900 border-r border-white/10 shadow-2xl shadow-slate-950/40',
      'lg:static lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img
            src="/mortarboard.png"
            alt="Ikonex Academy"
            className="h-11 w-11 object-contain"
          />
          <div>
            <p className="font-bold text-base leading-none tracking-wide text-white">Ikonex</p>
            <p className="text-xs text-primary-200/90 mt-1">Academy SMS</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-primary-200 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="px-6 pt-5">
        <p className="text-[11px] uppercase tracking-[0.28em] text-primary-200/70 font-semibold">Navigation</p>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {visibleNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) => clsx(
              'group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 border',
              isActive
                ? 'bg-white text-slate-950 border-white shadow-lg shadow-black/10'
                : 'text-primary-100 border-transparent hover:bg-white/10 hover:border-white/10 hover:text-white'
            )}
          >
            {({ isActive }) => (
              <>
                <span className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                  isActive ? 'bg-primary-100 text-primary-700' : 'bg-white/10 text-primary-100 group-hover:bg-white/15'
                )}>
                  <Icon size={18} />
                </span>
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-400 to-primary-500 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-accent-500/20">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-primary-200/80 truncate">{user?.role ? formatRoleLabel(user.role) : ''}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
