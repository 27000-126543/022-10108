
import { useState } from 'react';
import { Search, Bell, ChevronDown, Clock, Calendar } from 'lucide-react';

const Header = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useState(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>
          {subtitle && (
            <p className="text-xs text-neutral-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索顾客姓名、手机号..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
                       transition-all duration-200"
          />
        </div>

        <div className="hidden md:flex items-center gap-2 text-neutral-500 text-sm">
          <Calendar size={16} />
          <span>{formatDate(currentTime)}</span>
        </div>

        <div className="flex items-center gap-2 text-primary-700 font-mono text-sm bg-primary-50 px-3 py-1.5 rounded-lg">
          <Clock size={16} />
          <span>{formatTime(currentTime)}</span>
        </div>

        <button className="relative p-2 text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-neutral-200 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-sm font-medium">
            李
          </div>
          <span className="text-sm text-neutral-700 font-medium">李护士</span>
          <ChevronDown size={16} className="text-neutral-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
