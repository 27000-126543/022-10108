
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  ClipboardList, 
  AlertTriangle, 
  Stethoscope, 
  Users, 
  QrCode,
  Bell,
  Settings
} from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const Sidebar = () => {
  const location = useLocation();
  const { stats, getIncompletePatients } = usePatientStore();
  
  const incompleteCount = getIncompletePatients().length;

  const navItems: NavItem[] = [
    { path: '/', label: '导诊看板', icon: <LayoutDashboard size={20} /> },
    { path: '/registration', label: '到院登记', icon: <UserPlus size={20} /> },
    { path: '/demand', label: '诉求采集', icon: <ClipboardList size={20} />, badge: incompleteCount },
    { path: '/risk', label: '风险提示', icon: <AlertTriangle size={20} /> },
    { path: '/triaging', label: '科室分流', icon: <Stethoscope size={20} /> },
    { path: '/queue', label: '候诊队列', icon: <Users size={20} />, badge: stats.waitingCount },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-gradient-primary h-screen flex flex-col text-white shrink-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-glow">
            <QrCode size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">医美分诊导诊台</h1>
            <p className="text-xs text-neutral-400">初诊分诊工作台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`sidebar-item relative group ${
              isActive(item.path) ? 'sidebar-item-active' : ''
            }`}
          >
            {isActive(item.path) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-400 rounded-r-full" />
            )}
            <span className={`${isActive(item.path) ? 'text-accent-400' : 'text-neutral-400 group-hover:text-white'}`}>
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-danger-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="sidebar-item">
          <Bell size={20} className="text-neutral-400" />
          <span>通知中心</span>
          <span className="px-2 py-0.5 text-xs font-medium bg-accent-500 text-white rounded-full">
            3
          </span>
        </div>
        <div className="sidebar-item">
          <Settings size={20} className="text-neutral-400" />
          <span>系统设置</span>
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-medium">
            李
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">李护士</p>
            <p className="text-xs text-neutral-400 truncate">分诊护士 · 早班</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
