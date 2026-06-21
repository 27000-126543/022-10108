
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  if (phone.length === 11) {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
  }
  return phone;
};

export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
};

export const generateQueueNumber = (department: string, index: number): string => {
  const prefixes: Record<string, string> = {
    skin: 'P',
    injection: 'Z',
    surgery: 'W',
  };
  const prefix = prefixes[department] || 'Q';
  return `${prefix}${String(index).padStart(3, '0')}`;
};

export const calculateWaitTime = (createdAt: Date): number => {
  const now = new Date();
  const diff = now.getTime() - new Date(createdAt).getTime();
  return Math.floor(diff / 60000);
};

export const getRiskColor = (level: string): string => {
  const colors: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
  };
  return colors[level] || 'neutral';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    registered: 'info',
    pending_demand: 'warning',
    pending_risk: 'warning',
    pending_triaging: 'warning',
    waiting: 'info',
    consulting: 'success',
    completed: 'success',
    no_show: 'danger',
    rescheduled: 'neutral',
  };
  return colors[status] || 'neutral';
};

export const getDepartmentIcon = (department: string): string => {
  const icons: Record<string, string> = {
    skin: 'Sparkles',
    injection: 'Syringe',
    surgery: 'Scissors',
  };
  return icons[department] || 'User';
};

export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};
