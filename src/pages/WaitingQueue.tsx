
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Sparkles,
  Syringe,
  Scissors,
  Clock,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Play,
  PhoneCall,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  Filter,
  X as XIcon,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  History,
  User,
  Stethoscope,
  Activity,
  FileText
} from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';
import { DEPARTMENT_LABELS, DepartmentType, QueueStatus, RiskLevel } from '@/types';
import { formatMinutes } from '@/utils/format';
import { RISK_LABELS, STATUS_LABELS } from '@/types';

const WaitingQueue = () => {
  const navigate = useNavigate();
  const { queues, patients, doctors, callPatient, startConsultation, completeConsultation, markNoShow, markRescheduled, sendRouteNotification, setCurrentPatient } = usePatientStore();

  const [activeDepartment, setActiveDepartment] = useState<DepartmentType | 'all'>('all');
  const [activeRiskFilter, setActiveRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<'queue' | 'no_show' | 'rescheduled'>('queue');
  const [expandedQueue, setExpandedQueue] = useState<string | null>(null);
  const [sentRoutes, setSentRoutes] = useState<Set<string>>(new Set());

  const getQueueItems = () => {
    if (activeDepartment === 'all') {
      return [...queues.skin, ...queues.injection, ...queues.surgery];
    }
    return queues[activeDepartment];
  };

  const noShowPatients = patients.filter(p => p.status === 'no_show');
  const rescheduledPatients = patients.filter(p => p.status === 'rescheduled');

  const allQueueItems = useMemo(() => {
    let items = getQueueItems();
    if (activeRiskFilter !== 'all') {
      items = items.filter(item => item.patient.riskLevel === activeRiskFilter);
    }
    return items;
  }, [activeDepartment, activeRiskFilter, queues]);

  const highRiskItems = useMemo(() => 
    allQueueItems.filter(item => item.patient.riskLevel === 'high'),
    [allQueueItems]
  );

  const waitingItems = allQueueItems.filter(item => item.status === 'waiting');
  const calledItems = allQueueItems.filter(item => item.status === 'called');
  const consultingItems = allQueueItems.filter(item => item.status === 'consulting');

  const departments = [
    { id: 'all' as const, name: '全部', icon: <Users size={18} />, count: queues.skin.length + queues.injection.length + queues.surgery.length },
    { id: 'skin' as const, name: '皮肤美容科', icon: <Sparkles size={18} />, count: queues.skin.length, color: 'success' },
    { id: 'injection' as const, name: '注射美容科', icon: <Syringe size={18} />, count: queues.injection.length, color: 'info' },
    { id: 'surgery' as const, name: '整形外科', icon: <Scissors size={18} />, count: queues.surgery.length, color: 'warning' },
  ];

  const riskFilters: { id: RiskLevel | 'all'; name: string; icon: any; color: string }[] = [
    { id: 'all', name: '全部风险', icon: <Filter size={16} />, color: 'neutral' },
    { id: 'high', name: '高风险', icon: <AlertTriangle size={16} />, color: 'danger' },
    { id: 'medium', name: '中风险', icon: <AlertCircle size={16} />, color: 'warning' },
    { id: 'low', name: '低风险', icon: <CheckCircle size={16} />, color: 'success' },
  ];

  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return '未分配';
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : '未分配';
  };

  const getDepartmentIcon = (dept: DepartmentType) => {
    const icons = {
      skin: <Sparkles size={16} />,
      injection: <Syringe size={16} />,
      surgery: <Scissors size={16} />,
    };
    return icons[dept];
  };

  const getStatusBadge = (status: QueueStatus) => {
    const badges: Record<QueueStatus, { label: string; className: string }> = {
      waiting: { label: '候诊中', className: 'bg-info-100 text-info-700' },
      called: { label: '已叫号', className: 'bg-warning-100 text-warning-700' },
      consulting: { label: '面诊中', className: 'bg-success-100 text-success-700' },
      completed: { label: '已完成', className: 'bg-neutral-100 text-neutral-700' },
    };
    return badges[status];
  };

  const getRiskBadge = (riskLevel: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      low: { label: '低风险', className: 'bg-success-100 text-success-700' },
      medium: { label: '中风险', className: 'bg-warning-100 text-warning-700' },
      high: { label: '高风险', className: 'bg-danger-100 text-danger-700' },
    };
    return badges[riskLevel] || badges.low;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimelineStepIcon = (step: string) => {
    switch (step) {
      case 'registered': return <User size={12} />;
      case 'id_verified': return <ShieldCheck size={12} />;
      case 'demand_collected': return <FileText size={12} />;
      case 'risk_assessed': return <AlertTriangle size={12} />;
      case 'triaged': return <Stethoscope size={12} />;
      case 'called': return <Users size={12} />;
      case 'consulting_started': return <Activity size={12} />;
      case 'completed': return <CheckCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const handleCallPatient = (queueId: string) => {
    callPatient(queueId);
  };

  const handleStartConsultation = (queueId: string, room: string) => {
    startConsultation(queueId, room);
  };

  const handleCompleteConsultation = (queueId: string) => {
    completeConsultation(queueId);
  };

  const handleSendRoute = (patientId: string, room: string) => {
    sendRouteNotification(patientId, room);
    setSentRoutes(prev => new Set(prev).add(patientId));
  };

  const handleMarkNoShow = (patientId: string) => {
    markNoShow(patientId);
  };

  const handleMarkRescheduled = (patientId: string) => {
    markRescheduled(patientId);
  };

  const renderTimeline = (timeline: any[] = []) => {
    if (timeline.length === 0) return null;
    return (
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <p className="text-xs font-medium text-neutral-500 mb-3 flex items-center gap-1">
          <History size={12} />
          流转记录
        </p>
        <div className="relative pl-5">
          <div className="absolute left-1.5 top-1 bottom-1 w-px bg-neutral-200" />
          {timeline.slice(0, 6).map((record: any, rIdx: number) => (
            <div key={record.id} className="relative pb-3 last:pb-0">
              <div className={`absolute -left-2.5 w-4 h-4 rounded-full flex items-center justify-center z-10 ${
                rIdx === 0 ? 'bg-primary-500 text-white' : 'bg-white border border-neutral-300 text-neutral-400'
              }`}>
                {getTimelineStepIcon(record.step)}
              </div>
              <div className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700 font-medium">{record.stepLabel}</span>
                  <span className="text-neutral-400">{formatTime(record.timestamp)}</span>
                </div>
                <span className="text-neutral-400">{record.handler} · {record.handlerRole}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const QueueCard = ({ item, index, isHighlighted = false }: { item: any; index: number; isHighlighted?: boolean }) => {
    const isExpanded = expandedQueue === item.id;
    const statusBadge = getStatusBadge(item.status);
    const riskBadge = getRiskBadge(item.patient.riskLevel);

    return (
      <div className={`card transition-all ${isExpanded ? 'shadow-card' : ''} ${
        isHighlighted ? 'ring-2 ring-danger-300 ring-offset-1' : ''
      }`}>
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setExpandedQueue(isExpanded ? null : item.id)}
        >
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center ${
            item.patient.riskLevel === 'high' 
              ? 'from-danger-100 to-danger-200' 
              : 'from-primary-100 to-accent-100'
          }`}>
            <span className={`text-2xl font-bold ${
              item.patient.riskLevel === 'high' ? 'text-danger-700' : 'text-primary-700'
            }`}>{item.queueNumber}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-neutral-800 truncate">{item.patient.name}</h4>
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${riskBadge.className}`}>
                {riskBadge.label}
              </span>
              {item.patient.idVerified && (
                <span className="px-2 py-0.5 text-xs bg-success-100 text-success-700 rounded-full flex items-center gap-1">
                  <ShieldCheck size={10} />
                  已核验
                </span>
              )}
              {item.patient.riskLevel === 'high' && (
                <span className="px-2 py-0.5 text-xs bg-danger-500 text-white rounded-full animate-pulse flex items-center gap-1">
                  <AlertTriangle size={10} />
                  需优先处理
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-500 flex-wrap">
              <span className="flex items-center gap-1">
                {getDepartmentIcon(item.department)}
                <span>{DEPARTMENT_LABELS[item.department]}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                等待 {formatMinutes(item.waitTime)}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {getDoctorName(item.doctorId)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {item.status === 'waiting' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCallPatient(item.id);
                }}
                className={`py-2 px-4 text-sm rounded-xl font-medium transition-all ${
                  item.patient.riskLevel === 'high'
                    ? 'bg-gradient-to-r from-danger-500 to-danger-600 text-white hover:from-danger-600 hover:to-danger-700'
                    : 'btn-primary'
                }`}
              >
                <PhoneCall size={16} className="inline mr-1" />
                {item.patient.riskLevel === 'high' ? '优先叫号' : '叫号'}
              </button>
            )}
            {item.status === 'called' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartConsultation(item.id, item.patient.consultationRoom || '1号诊室');
                }}
                className="btn-accent py-2 px-4 text-sm"
              >
                <Play size={16} className="inline mr-1" />
                开始面诊
              </button>
            )}
            {item.status === 'consulting' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteConsultation(item.id);
                }}
                className="btn-secondary py-2 px-4 text-sm"
              >
                <CheckCircle size={16} className="inline mr-1" />
                完成
              </button>
            )}
            {isExpanded ? (
              <ChevronUp size={20} className="text-neutral-400" />
            ) : (
              <ChevronDown size={20} className="text-neutral-400" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-neutral-100 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">联系电话</p>
                <p className="text-sm font-medium text-neutral-700">{item.patient.phone}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">年龄性别</p>
                <p className="text-sm font-medium text-neutral-700">
                  {item.patient.age}岁 · {item.patient.gender === 'female' ? '女' : '男'}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">预算区间</p>
                <p className="text-sm font-medium text-accent-600">{item.patient.budgetRange || '未填写'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">面诊室</p>
                <p className="text-sm font-medium text-neutral-700 flex items-center gap-1">
                  <MapPin size={14} />
                  {item.patient.consultationRoom || '待分配'}
                </p>
              </div>
            </div>

            {item.patient.riskFactors && item.patient.riskFactors.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-neutral-500 mb-2">风险因素</p>
                <div className="flex flex-wrap gap-1">
                  {item.patient.riskFactors.map((factor: string, i: number) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        item.patient.riskLevel === 'high' ? 'bg-danger-100 text-danger-600' :
                        item.patient.riskLevel === 'medium' ? 'bg-warning-100 text-warning-600' :
                        'bg-success-100 text-success-600'
                      }`}
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {item.patient.concernedAreas && item.patient.concernedAreas.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-neutral-500 mb-2">关注部位</p>
                <div className="flex flex-wrap gap-1">
                  {item.patient.concernedAreas.map((area: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {renderTimeline(item.patient.timeline)}

            <div className="mt-4 flex items-center gap-2">
              {item.status === 'waiting' && (
                <>
                  <button
                    onClick={() => handleSendRoute(item.patientId, item.patient.consultationRoom || '')}
                    className="btn-secondary py-2 px-4 text-sm"
                  >
                    <Send size={16} className="inline mr-1" />
                    {sentRoutes.has(item.patientId) ? '已发送路线' : '发送路线'}
                  </button>
                  <button
                    onClick={() => handleMarkNoShow(item.patientId)}
                    className="px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  >
                    <XCircle size={16} className="inline mr-1" />
                    标记爽约
                  </button>
                  <button
                    onClick={() => handleMarkRescheduled(item.patientId)}
                    className="px-4 py-2 text-sm text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                  >
                    <Calendar size={16} className="inline mr-1" />
                    改约
                  </button>
                </>
              )}
              {item.status === 'consulting' && item.patient.consultationRoom && (
                <button
                  onClick={() => handleSendRoute(item.patientId, item.patient.consultationRoom)}
                  className="btn-secondary py-2 px-4 text-sm"
                >
                  <Send size={16} className="inline mr-1" />
                  发送面诊室路线
                </button>
              )}
              <button
                onClick={() => {
                  setCurrentPatient(item.patient);
                  navigate('/triaging');
                }}
                className="ml-auto px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                查看详情
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SpecialStatusCard = ({ patient, type }: { patient: any; type: 'no_show' | 'rescheduled' }) => {
    const riskBadge = getRiskBadge(patient.riskLevel);
    const isExpanded = expandedQueue === `${type}-${patient.id}`;

    return (
      <div className={`card transition-all ${isExpanded ? 'shadow-card' : ''}`}>
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setExpandedQueue(isExpanded ? null : `${type}-${patient.id}`)}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            type === 'no_show'
              ? 'bg-gradient-to-br from-danger-100 to-danger-200'
              : 'bg-gradient-to-br from-warning-100 to-warning-200'
          }`}>
            {type === 'no_show' ? (
              <XCircle size={28} className="text-danger-500" />
            ) : (
              <RefreshCw size={28} className="text-warning-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-neutral-800 truncate">{patient.name}</h4>
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                type === 'no_show' ? 'bg-danger-100 text-danger-700' : 'bg-warning-100 text-warning-700'
              }`}>
                {STATUS_LABELS[patient.status]}
              </span>
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${riskBadge.className}`}>
                {riskBadge.label}
              </span>
              {patient.idVerified && (
                <span className="px-2 py-0.5 text-xs bg-success-100 text-success-700 rounded-full flex items-center gap-1">
                  <ShieldCheck size={10} />
                  已核验
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Phone size={14} />
                {patient.phone}
              </span>
              {patient.department && (
                <span className="flex items-center gap-1">
                  {getDepartmentIcon(patient.department)}
                  <span>{DEPARTMENT_LABELS[patient.department]}</span>
                </span>
              )}
            </div>
          </div>

          {isExpanded ? (
            <ChevronUp size={20} className="text-neutral-400" />
          ) : (
            <ChevronDown size={20} className="text-neutral-400" />
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-neutral-100 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">年龄性别</p>
                <p className="text-sm font-medium text-neutral-700">
                  {patient.age}岁 · {patient.gender === 'female' ? '女' : '男'}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">预算区间</p>
                <p className="text-sm font-medium text-accent-600">{patient.budgetRange || '未填写'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">到院时间</p>
                <p className="text-sm font-medium text-neutral-700">
                  {new Date(patient.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">接诊医生</p>
                <p className="text-sm font-medium text-neutral-700">
                  {getDoctorName(patient.assignedDoctor)}
                </p>
              </div>
            </div>

            {patient.riskFactors && patient.riskFactors.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-neutral-500 mb-2">风险因素</p>
                <div className="flex flex-wrap gap-1">
                  {patient.riskFactors.map((factor: string, i: number) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        patient.riskLevel === 'high' ? 'bg-danger-100 text-danger-600' :
                        patient.riskLevel === 'medium' ? 'bg-warning-100 text-warning-600' :
                        'bg-success-100 text-success-600'
                      }`}
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.concernedAreas && patient.concernedAreas.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-neutral-500 mb-2">关注部位</p>
                <div className="flex flex-wrap gap-1">
                  {patient.concernedAreas.map((area: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {renderTimeline(patient.timeline)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-info-100 flex items-center justify-center">
              <Users size={24} className="text-info-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{allQueueItems.length}</p>
              <p className="text-sm text-neutral-500">队列中</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-danger-100 flex items-center justify-center">
              <AlertTriangle size={24} className="text-danger-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{highRiskItems.length}</p>
              <p className="text-sm text-neutral-500">高风险</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center">
              <Clock size={24} className="text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{waitingItems.length}</p>
              <p className="text-sm text-neutral-500">等待叫号</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
              <Play size={24} className="text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{consultingItems.length}</p>
              <p className="text-sm text-neutral-500">面诊中</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
              <CheckCircle size={24} className="text-accent-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">
                {patients.filter(p => p.status === 'completed').length}
              </p>
              <p className="text-sm text-neutral-500">已完成</p>
            </div>
          </div>
        </div>
      </div>

      {/* 状态筛选标签 */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-neutral-500" />
            <span className="font-medium text-neutral-700">状态筛选</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveFilter('queue')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeFilter === 'queue'
                ? 'bg-gradient-to-r from-primary-700 to-primary-800 text-white shadow-card'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Users size={18} />
            <span>候诊队列</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeFilter === 'queue'
                ? 'bg-white/20 text-white'
                : 'bg-neutral-200 text-neutral-600'
            }`}>
              {allQueueItems.length}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter('no_show')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeFilter === 'no_show'
                ? 'bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-card'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <XCircle size={18} />
            <span>已爽约</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeFilter === 'no_show'
                ? 'bg-white/20 text-white'
                : 'bg-neutral-200 text-neutral-600'
            }`}>
              {noShowPatients.length}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter('rescheduled')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeFilter === 'rescheduled'
                ? 'bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-card'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <RefreshCw size={18} />
            <span>已改约</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeFilter === 'rescheduled'
                ? 'bg-white/20 text-white'
                : 'bg-neutral-200 text-neutral-600'
            }`}>
              {rescheduledPatients.length}
            </span>
          </button>
        </div>
      </div>

      {/* 风险等级 + 科室筛选（仅候诊队列显示） */}
      {activeFilter === 'queue' && (
        <div className="space-y-4 mb-6">
          {/* 高风险预警区 */}
          {highRiskItems.length > 0 && (
            <div className="card border-2 border-danger-200 bg-gradient-to-br from-danger-50/50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-danger-500 flex items-center justify-center animate-pulse">
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-danger-700">高风险顾客 · 优先关注</h3>
                    <p className="text-xs text-danger-600">共 {highRiskItems.length} 位高风险顾客需要优先处理</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 text-sm bg-danger-500 text-white rounded-full font-medium">
                  {RISK_LABELS['high']} · {highRiskItems.length}
                </span>
              </div>
              <div className="space-y-3">
                {highRiskItems.map((item, index) => (
                  <QueueCard key={item.id} item={item} index={index} isHighlighted />
                ))}
              </div>
            </div>
          )}

          {/* 风险筛选 + 科室筛选 */}
          <div className="card space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">风险等级筛选</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {riskFilters.map((rf) => {
                  const count = rf.id === 'all' 
                    ? allQueueItems.length 
                    : allQueueItems.filter(i => i.patient.riskLevel === rf.id).length;
                  const colorMap: Record<string, { active: string; badge: string }> = {
                    neutral: {
                      active: 'bg-gradient-to-r from-neutral-700 to-neutral-800 text-white shadow-card',
                      badge: 'bg-white/20 text-white',
                    },
                    danger: {
                      active: 'bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-card',
                      badge: 'bg-white/20 text-white',
                    },
                    warning: {
                      active: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-card',
                      badge: 'bg-white/20 text-white',
                    },
                    success: {
                      active: 'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-card',
                      badge: 'bg-white/20 text-white',
                    },
                  };
                  const styles = colorMap[rf.color];
                  return (
                    <button
                      key={rf.id}
                      onClick={() => setActiveRiskFilter(rf.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        activeRiskFilter === rf.id
                          ? styles.active
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {rf.icon}
                      <span>{rf.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        activeRiskFilter === rf.id
                          ? styles.badge
                          : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope size={16} className="text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">科室筛选</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setActiveDepartment(dept.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                      activeDepartment === dept.id
                        ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-card'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {dept.icon}
                    <span>{dept.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      activeDepartment === dept.id
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {dept.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容区 */}
        <div className="lg:col-span-2 space-y-6">
          {activeFilter === 'queue' && (
            <>
              {/* 等待叫号 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                    <Clock size={20} className="text-warning-500" />
                    等待叫号
                    <span className="text-sm font-normal text-neutral-400">({waitingItems.length})</span>
                  </h3>
                </div>
                {waitingItems.length === 0 ? (
                  <div className="card text-center py-12">
                    <CheckCircle size={40} className="mx-auto mb-2 text-success-300" />
                    <p className="text-neutral-400">暂无等待顾客</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {waitingItems
                      .sort((a, b) => {
                        const order = { high: 0, medium: 1, low: 2 } as const;
                        return order[a.patient.riskLevel] - order[b.patient.riskLevel];
                      })
                      .map((item, index) => (
                      <QueueCard key={item.id} item={item} index={index} />
                    ))}
                  </div>
                )}
              </div>

              {/* 已叫号 */}
              {calledItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                      <PhoneCall size={20} className="text-info-500" />
                      已叫号
                      <span className="text-sm font-normal text-neutral-400">({calledItems.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {calledItems.map((item, index) => (
                      <QueueCard key={item.id} item={item} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* 面诊中 */}
              {consultingItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                      <Play size={20} className="text-success-500" />
                      面诊中
                      <span className="text-sm font-normal text-neutral-400">({consultingItems.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {consultingItems.map((item, index) => (
                      <QueueCard key={item.id} item={item} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeFilter === 'no_show' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                  <XCircle size={20} className="text-danger-500" />
                  今日爽约顾客
                  <span className="text-sm font-normal text-neutral-400">({noShowPatients.length})</span>
                </h3>
              </div>
              {noShowPatients.length === 0 ? (
                <div className="card text-center py-12">
                  <CheckCircle size={40} className="mx-auto mb-2 text-success-300" />
                  <p className="text-neutral-400">暂无爽约顾客</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {noShowPatients.map((patient, index) => (
                    <SpecialStatusCard key={patient.id} patient={patient} type="no_show" />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeFilter === 'rescheduled' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                  <RefreshCw size={20} className="text-warning-500" />
                  已改约顾客
                  <span className="text-sm font-normal text-neutral-400">({rescheduledPatients.length})</span>
                </h3>
              </div>
              {rescheduledPatients.length === 0 ? (
                <div className="card text-center py-12">
                  <CheckCircle size={40} className="mx-auto mb-2 text-success-300" />
                  <p className="text-neutral-400">暂无改约顾客</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rescheduledPatients.map((patient, index) => (
                    <SpecialStatusCard key={patient.id} patient={patient} type="rescheduled" />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右侧：科室概览 */}
        <div className="space-y-6">
          {/* 风险分布 */}
          {activeFilter === 'queue' && (
            <div className="card">
              <h3 className="font-semibold text-neutral-800 mb-4">风险分布</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-danger-50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-danger-600" />
                    <span className="text-sm text-neutral-700">高风险</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 bg-danger-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-danger-500 rounded-full transition-all"
                        style={{ 
                          width: allQueueItems.length > 0 
                            ? `${(highRiskItems.length / allQueueItems.length) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                    <span className="font-bold text-danger-700 w-8 text-right">{highRiskItems.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-warning-50">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-warning-600" />
                    <span className="text-sm text-neutral-700">中风险</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 bg-warning-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-warning-500 rounded-full transition-all"
                        style={{ 
                          width: allQueueItems.length > 0 
                            ? `${(allQueueItems.filter(i => i.patient.riskLevel === 'medium').length / allQueueItems.length) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                    <span className="font-bold text-warning-700 w-8 text-right">
                      {allQueueItems.filter(i => i.patient.riskLevel === 'medium').length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-success-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success-600" />
                    <span className="text-sm text-neutral-700">低风险</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 bg-success-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success-500 rounded-full transition-all"
                        style={{ 
                          width: allQueueItems.length > 0 
                            ? `${(allQueueItems.filter(i => i.patient.riskLevel === 'low').length / allQueueItems.length) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                    <span className="font-bold text-success-700 w-8 text-right">
                      {allQueueItems.filter(i => i.patient.riskLevel === 'low').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 各科室候诊人数 */}
          {activeFilter === 'queue' && (
            <div className="card">
              <h3 className="font-semibold text-neutral-800 mb-4">科室候诊概览</h3>
              <div className="space-y-4">
                {(['skin', 'injection', 'surgery'] as DepartmentType[]).map((dept) => {
                  const deptQueue = queues[dept];
                  const waitingCount = deptQueue.filter(q => q.status === 'waiting').length;
                  const consultingCount = deptQueue.filter(q => q.status === 'consulting').length;
                  const highRiskCount = deptQueue.filter(q => q.patient.riskLevel === 'high').length;

                  return (
                    <div key={dept} className="p-3 rounded-xl bg-neutral-50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-600">
                          {getDepartmentIcon(dept)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-neutral-800 text-sm">{DEPARTMENT_LABELS[dept]}</p>
                        </div>
                        <span className="text-lg font-bold text-neutral-700">{deptQueue.length}</span>
                      </div>
                      <div className="flex gap-4 text-xs flex-wrap">
                        <span className="text-neutral-500">
                          等待 <span className="font-medium text-warning-600">{waitingCount}</span>
                        </span>
                        <span className="text-neutral-500">
                          面诊 <span className="font-medium text-success-600">{consultingCount}</span>
                        </span>
                        {highRiskCount > 0 && (
                          <span className="text-neutral-500">
                            高风险 <span className="font-medium text-danger-600">{highRiskCount}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 今日统计汇总 */}
          <div className="card">
            <h3 className="font-semibold text-neutral-800 mb-4">今日状态统计</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-info-50">
                <span className="text-sm text-neutral-600">队列中</span>
                <span className="font-bold text-info-700">{allQueueItems.length} 人</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-success-50">
                <span className="text-sm text-neutral-600">已完成</span>
                <span className="font-bold text-success-700">
                  {patients.filter(p => p.status === 'completed').length} 人
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-danger-50">
                <span className="text-sm text-neutral-600">爽约</span>
                <span className="font-bold text-danger-700">{noShowPatients.length} 人</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-warning-50">
                <span className="text-sm text-neutral-600">改约</span>
                <span className="font-bold text-warning-700">{rescheduledPatients.length} 人</span>
              </div>
            </div>
          </div>

          {/* 在线医生 */}
          <div className="card">
            <h3 className="font-semibold text-neutral-800 mb-4">在线医生</h3>
            <div className="space-y-3">
              {doctors.filter(d => d.isOnline).slice(0, 5).map((doctor) => (
                <div key={doctor.id} className="flex items-center gap-3">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-neutral-800 text-sm truncate">{doctor.name}</p>
                      <span className="w-2 h-2 rounded-full bg-success-500 shrink-0" />
                    </div>
                    <p className="text-xs text-neutral-500 truncate">{doctor.title}</p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {doctor.currentPatients}人
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="card">
            <h3 className="font-semibold text-neutral-800 mb-4">快捷操作</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/registration')}
                className="w-full p-3 rounded-xl text-left hover:bg-neutral-50 transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Users size={16} className="text-primary-600" />
                </div>
                <span className="text-sm font-medium text-neutral-700">快速登记</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full p-3 rounded-xl text-left hover:bg-neutral-50 transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                  <MapPin size={16} className="text-accent-600" />
                </div>
                <span className="text-sm font-medium text-neutral-700">导诊看板</span>
              </button>
              <button
                onClick={() => navigate('/triaging')}
                className="w-full p-3 rounded-xl text-left hover:bg-neutral-50 transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center">
                  <Stethoscope size={16} className="text-warning-600" />
                </div>
                <span className="text-sm font-medium text-neutral-700">科室分诊</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingQueue;
