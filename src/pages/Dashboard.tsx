
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  UserCheck,
  XCircle,
  ChevronRight,
  MapPin,
  Bell,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Syringe,
  Scissors,
  ArrowUpRight
} from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';
import { STATUS_LABELS, DEPARTMENT_LABELS } from '@/types';
import { formatMinutes, getStatusColor, getRiskColor } from '@/utils/format';

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, patients, queues, getIncompletePatients, markNoShow, markRescheduled, sendRouteNotification } = usePatientStore();

  const incompletePatients = getIncompletePatients();
  
  const waitingPatients = patients.filter(p => p.status === 'waiting');
  const consultingPatients = patients.filter(p => p.status === 'consulting');

  const statCards = [
    {
      title: '今日到院',
      value: stats.todayArrivals,
      icon: <Users size={24} />,
      color: 'primary',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: '候诊中',
      value: stats.waitingCount,
      icon: <Clock size={24} />,
      color: 'info',
      trend: '正常',
      trendUp: null,
    },
    {
      title: '面诊中',
      value: stats.consultingCount,
      icon: <UserCheck size={24} />,
      color: 'success',
      trend: '+3',
      trendUp: true,
    },
    {
      title: '已完成',
      value: stats.completedCount,
      icon: <CheckCircle2 size={24} />,
      color: 'accent',
      trend: '+8%',
      trendUp: true,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; text: string; border: string }> = {
      primary: { bg: 'bg-primary-50', icon: 'text-primary-600', text: 'text-primary-700', border: 'border-primary-100' },
      info: { bg: 'bg-info-50', icon: 'text-info-600', text: 'text-info-700', border: 'border-info-100' },
      success: { bg: 'bg-success-50', icon: 'text-success-600', text: 'text-success-700', border: 'border-success-100' },
      accent: { bg: 'bg-accent-50', icon: 'text-accent-600', text: 'text-accent-700', border: 'border-accent-100' },
      danger: { bg: 'bg-danger-50', icon: 'text-danger-600', text: 'text-danger-700', border: 'border-danger-100' },
      warning: { bg: 'bg-warning-50', icon: 'text-warning-600', text: 'text-warning-700', border: 'border-warning-100' },
    };
    return colors[color] || colors.primary;
  };

  const departmentIcons = {
    skin: <Sparkles size={18} />,
    injection: <Syringe size={18} />,
    surgery: <Scissors size={18} />,
  };

  return (
    <div className="space-y-6">
      {/* 数据概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          return (
            <div
              key={index}
              className="stat-card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-neutral-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} ${colorClasses.icon} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                {stat.trendUp !== null && (
                  <>
                    {stat.trendUp ? (
                      <TrendingUp size={14} className="text-success-500" />
                    ) : (
                      <TrendingDown size={14} className="text-danger-500" />
                    )}
                  </>
                )}
                <span className={`text-xs ${stat.trendUp ? 'text-success-600' : stat.trendUp === false ? 'text-danger-600' : 'text-neutral-500'}`}>
                  {stat.trend}
                </span>
                <span className="text-xs text-neutral-400 ml-auto">较昨日</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：科室队列概览 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 科室候诊队列 */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-neutral-800">候诊队列概览</h3>
              <button 
                onClick={() => navigate('/queue')}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                查看全部 <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['skin', 'injection', 'surgery'] as const).map((dept, index) => {
                const queue = queues[dept];
                const waitingCount = queue.filter(q => q.status === 'waiting').length;
                const consultingCount = queue.filter(q => q.status === 'consulting').length;
                const colorClasses = getColorClasses(dept === 'skin' ? 'success' : dept === 'injection' ? 'info' : 'warning');
                
                return (
                  <div
                    key={dept}
                    className={`p-5 rounded-2xl border ${colorClasses.border} bg-gradient-to-br from-white to-${colorClasses.bg.replace('bg-', '')}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl ${colorClasses.bg} ${colorClasses.icon} flex items-center justify-center`}>
                        {departmentIcons[dept]}
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-800">{DEPARTMENT_LABELS[dept]}</h4>
                        <p className="text-xs text-neutral-500">{queue.length}人在队列</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-2xl font-bold text-neutral-800">{waitingCount}</p>
                        <p className="text-xs text-neutral-500">等待中</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-success-600">{consultingCount}</p>
                        <p className="text-xs text-neutral-500">面诊中</p>
                      </div>
                    </div>

                    {queue.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-neutral-100">
                        <div className="flex -space-x-2">
                          {queue.slice(0, 3).map((item) => (
                            <img
                              key={item.id}
                              src={item.patient.avatar}
                              alt={item.patient.name}
                              className="w-8 h-8 rounded-full border-2 border-white"
                            />
                          ))}
                          {queue.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-xs text-neutral-600">
                              +{queue.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 当前面诊 */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-neutral-800">正在面诊</h3>
              <span className="text-xs text-neutral-500">共 {consultingPatients.length} 位</span>
            </div>

            <div className="space-y-3">
              {consultingPatients.slice(0, 4).map((patient, index) => (
                <div
                  key={patient.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-success-50/50 border border-success-100 hover:bg-success-50 transition-colors"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative">
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-neutral-800">{patient.name}</p>
                      <span className={`badge-${getRiskColor(patient.riskLevel)}`}>
                        {patient.riskLevel === 'low' ? '低风险' : patient.riskLevel === 'medium' ? '中风险' : '高风险'}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">{DEPARTMENT_LABELS[patient.department || 'skin']}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-success-600 font-medium">
                      {patient.consultedAt && formatMinutes(
                        Math.floor((Date.now() - new Date(patient.consultedAt).getTime()) / 60000)
                      )}
                    </p>
                    <p className="text-xs text-neutral-400">{patient.consultationRoom}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (patient.consultationRoom) {
                        sendRouteNotification(patient.id, patient.consultationRoom);
                      }
                    }}
                    className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                    title="发送路线"
                  >
                    <MapPin size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：待办和提醒 */}
        <div className="space-y-6">
          {/* 待办事项 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">待办提醒</h3>
              {incompletePatients.length > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-danger-500 text-white rounded-full">
                  {incompletePatients.length}项
                </span>
              )}
            </div>

            {incompletePatients.length === 0 ? (
              <div className="py-8 text-center text-neutral-400">
                <CheckCircle2 size={40} className="mx-auto mb-2 text-success-400" />
                <p>暂无待办事项</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incompletePatients.slice(0, 5).map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-warning-50/50 border border-warning-100 cursor-pointer hover:bg-warning-50 transition-colors"
                    onClick={() => {
                      if (patient.status === 'registered' || patient.status === 'pending_demand') {
                        navigate('/demand');
                      } else if (patient.status === 'pending_risk') {
                        navigate('/risk');
                      } else {
                        navigate('/triaging');
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
                      <AlertCircle size={18} className="text-warning-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{patient.name}</p>
                      <p className="text-xs text-neutral-500">{STATUS_LABELS[patient.status]}</p>
                    </div>
                    <ArrowUpRight size={16} className="text-neutral-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 耗时统计 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">耗时统计</h3>
              <button className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100">
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">平均候诊时长</span>
                  <span className="text-sm font-medium text-info-600">{formatMinutes(stats.avgWaitTime)}</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-info-400 to-info-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(stats.avgWaitTime / 60 * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">平均面诊时长</span>
                  <span className="text-sm font-medium text-success-600">{formatMinutes(stats.avgConsultTime)}</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-success-400 to-success-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(stats.avgConsultTime / 60 * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">初诊转面诊总耗时</span>
                  <span className="text-lg font-bold text-accent-600">{formatMinutes(stats.avgTotalTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">快捷操作</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/registration')}
                className="p-4 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 transition-colors text-center"
              >
                <UserCheck size={24} className="mx-auto mb-2" />
                <span className="text-sm font-medium">快速登记</span>
              </button>
              <button
                onClick={() => navigate('/queue')}
                className="p-4 rounded-xl bg-success-50 hover:bg-success-100 text-success-700 transition-colors text-center"
              >
                <Bell size={24} className="mx-auto mb-2" />
                <span className="text-sm font-medium">叫号接诊</span>
              </button>
              <button
                onClick={() => navigate('/risk')}
                className="p-4 rounded-xl bg-warning-50 hover:bg-warning-100 text-warning-700 transition-colors text-center"
              >
                <AlertCircle size={24} className="mx-auto mb-2" />
                <span className="text-sm font-medium">风险评估</span>
              </button>
              <button
                onClick={() => navigate('/triaging')}
                className="p-4 rounded-xl bg-accent-50 hover:bg-accent-100 text-accent-700 transition-colors text-center"
              >
                <ArrowUpRight size={24} className="mx-auto mb-2" />
                <span className="text-sm font-medium">科室分诊</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
