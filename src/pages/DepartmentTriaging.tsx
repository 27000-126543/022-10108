
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Sparkles, 
  Syringe, 
  Scissors,
  User,
  Users,
  Clock,
  CheckCircle,
  ChevronRight,
  Calendar,
  Star,
  ArrowRight,
  AlertCircle,
  BadgeCheck,
  ShieldCheck,
  AlertTriangle,
  Activity,
  FileText,
  History
} from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';
import { DEPARTMENT_LABELS, DepartmentType, Doctor, RISK_SUGGESTIONS, RISK_LABELS } from '@/types';

const DepartmentTriaging = () => {
  const navigate = useNavigate();
  const { patients, currentPatient, doctors, addToQueue, setCurrentPatient } = usePatientStore();
  
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentType | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const selectedPatient = currentPatient || patients.find(p => 
    p.status === 'pending_triaging' || p.status === 'pending_risk'
  );

  const recommendedDepartment = useMemo((): DepartmentType | null => {
    if (!selectedPatient?.concernedAreas || selectedPatient.concernedAreas.length === 0) {
      return null;
    }
    
    const skinKeywords = ['痘痘痘印', '斑点', '毛孔粗大', '肤色暗沉', '皮肤松弛', '皱纹', '红血丝', '敏感肌'];
    const injectionKeywords = ['玻尿酸', '肉毒素', '瘦脸针', '瘦腿针', '下颌缘提升', '面部轮廓', '苹果肌', '太阳穴', '法令纹', '下巴', '嘴唇', '额头', '线雕', '胶原蛋白'];
    const surgeryKeywords = ['双眼皮', '开眼角', '眼袋', '眼睛', '鼻子', '隆胸', '吸脂', '腰腹', '腿部', '手臂', '背部', '胸部', '双下巴', '面部轮廓手术'];
    
    const areas = selectedPatient.concernedAreas;
    
    let skinScore = 0;
    let injectionScore = 0;
    let surgeryScore = 0;
    
    areas.forEach(area => {
      if (skinKeywords.some(kw => area.includes(kw) || kw.includes(area))) skinScore++;
      if (injectionKeywords.some(kw => area.includes(kw) || kw.includes(area))) injectionScore++;
      if (surgeryKeywords.some(kw => area.includes(kw) || kw.includes(area))) surgeryScore++;
    });
    
    const maxScore = Math.max(skinScore, injectionScore, surgeryScore);
    if (maxScore === 0) return 'skin';
    
    if (skinScore === maxScore) return 'skin';
    if (injectionScore === maxScore) return 'injection';
    return 'surgery';
  }, [selectedPatient]);

  const departmentDoctors = useMemo(() => {
    if (!selectedDepartment) return [];
    return doctors.filter(d => d.department === selectedDepartment && d.isOnline);
  }, [selectedDepartment, doctors]);

  const selectedDoctorData = useMemo(() => {
    if (!selectedDoctor) return null;
    return doctors.find(d => d.id === selectedDoctor);
  }, [selectedDoctor, doctors]);

  const departments = [
    { 
      id: 'skin' as DepartmentType, 
      name: '皮肤美容科', 
      icon: <Sparkles size={24} />, 
      color: 'success',
      description: '光子嫩肤、热玛吉、皮秒、水光针等',
      waitCount: 0
    },
    { 
      id: 'injection' as DepartmentType, 
      name: '注射美容科', 
      icon: <Syringe size={24} />, 
      color: 'info',
      description: '玻尿酸、肉毒素、瘦脸针、线雕等',
      waitCount: 0
    },
    { 
      id: 'surgery' as DepartmentType, 
      name: '整形外科', 
      icon: <Scissors size={24} />, 
      color: 'warning',
      description: '双眼皮、隆鼻、隆胸、吸脂塑形等',
      waitCount: 0
    },
  ];

  const getDepartmentColorClass = (color: string, isSelected: boolean) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      success: {
        bg: isSelected ? 'bg-success-50' : 'bg-white',
        border: isSelected ? 'border-success-400' : 'border-neutral-200',
        text: isSelected ? 'text-success-700' : 'text-neutral-700',
        icon: isSelected ? 'bg-success-500 text-white' : 'bg-success-100 text-success-600',
      },
      info: {
        bg: isSelected ? 'bg-info-50' : 'bg-white',
        border: isSelected ? 'border-info-400' : 'border-neutral-200',
        text: isSelected ? 'text-info-700' : 'text-neutral-700',
        icon: isSelected ? 'bg-info-500 text-white' : 'bg-info-100 text-info-600',
      },
      warning: {
        bg: isSelected ? 'bg-warning-50' : 'bg-white',
        border: isSelected ? 'border-warning-400' : 'border-neutral-200',
        text: isSelected ? 'text-warning-700' : 'text-neutral-700',
        icon: isSelected ? 'bg-warning-500 text-white' : 'bg-warning-100 text-warning-600',
      },
    };
    return colors[color] || colors.success;
  };

  const getSuggestionColorClass = (color: string) => {
    const map: Record<string, { header: string; badge: string; tip: string }> = {
      danger: {
        header: 'bg-gradient-to-r from-danger-50 to-danger-100 border-danger-200',
        badge: 'bg-danger-100 text-danger-700',
        tip: 'text-danger-600',
      },
      warning: {
        header: 'bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200',
        badge: 'bg-warning-100 text-warning-700',
        tip: 'text-warning-600',
      },
    };
    return map[color] || map.warning;
  };

  const handleConfirmTriaging = () => {
    if (selectedPatient && selectedDepartment) {
      addToQueue(selectedPatient.id, selectedDepartment, selectedDoctor || undefined);
      setIsConfirmed(true);
    }
  };

  const handleGoToQueue = () => {
    navigate('/queue');
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimelineStepIcon = (step: string) => {
    switch (step) {
      case 'registered': return <User size={14} />;
      case 'id_verified': return <ShieldCheck size={14} />;
      case 'demand_collected': return <FileText size={14} />;
      case 'risk_assessed': return <AlertTriangle size={14} />;
      case 'triaged': return <Stethoscope size={14} />;
      case 'called': return <Users size={14} />;
      case 'consulting_started': return <Activity size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (!selectedPatient) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-16">
          <Stethoscope size={48} className="mx-auto mb-4 text-neutral-300" />
          <h3 className="text-lg font-medium text-neutral-600 mb-2">暂无待分诊顾客</h3>
          <p className="text-sm text-neutral-400 mb-6">请先从导诊看板或登记页面选择顾客</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            返回导诊看板
          </button>
        </div>
      </div>
    );
  }

  const riskFactorKeys = selectedPatient.riskFactors || [];
  const hasRisk = riskFactorKeys.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* 顾客信息栏 */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          {selectedPatient.avatar ? (
            <img src={selectedPatient.avatar} alt="" className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-medium">
              {selectedPatient.name?.charAt(0) || '顾'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-neutral-800">
                {selectedPatient.name}
              </h2>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                selectedPatient.riskLevel === 'high' ? 'bg-danger-100 text-danger-700' :
                selectedPatient.riskLevel === 'medium' ? 'bg-warning-100 text-warning-700' :
                'bg-success-100 text-success-700'
              }`}>
                {RISK_LABELS[selectedPatient.riskLevel]}
              </span>
              {selectedPatient.idVerified && (
                <span className="px-2 py-0.5 text-xs bg-success-100 text-success-700 rounded-full flex items-center gap-1 font-medium">
                  <ShieldCheck size={12} />
                  已核验
                </span>
              )}
              {selectedPatient.isNew && (
                <span className="px-2 py-0.5 text-xs bg-accent-100 text-accent-700 rounded-full">
                  新客
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              {selectedPatient.phone} · {selectedPatient.age}岁 · {selectedPatient.gender === 'female' ? '女' : '男'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">关注部位</p>
            <p className="font-medium text-primary-600">
              {selectedPatient.concernedAreas?.slice(0, 3).join('、') || '未填写'}
              {selectedPatient.concernedAreas && selectedPatient.concernedAreas.length > 3 && '...'}
            </p>
          </div>
        </div>

        {/* 风险因素标签行 */}
        {hasRisk && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-neutral-500">风险因素：</span>
              {riskFactorKeys.map((factor, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    selectedPatient.riskLevel === 'high' ? 'bg-danger-100 text-danger-700' :
                    'bg-warning-100 text-warning-700'
                  }`}
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：科室选择 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 科室选择 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Stethoscope size={20} className="text-primary-600" />
              选择科室
            </h3>

            {recommendedDepartment && (
              <div className="mb-4 p-3 bg-accent-50 rounded-xl border border-accent-200">
                <div className="flex items-center gap-2">
                  <BadgeCheck size={18} className="text-accent-600" />
                  <p className="text-sm font-medium text-accent-700">
                    智能推荐：{DEPARTMENT_LABELS[recommendedDepartment]}
                    <span className="text-accent-500 font-normal ml-2">（基于关注部位分析）</span>
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const colorClass = getDepartmentColorClass(dept.color, selectedDepartment === dept.id);
                return (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setSelectedDepartment(dept.id);
                      setSelectedDoctor(null);
                      setSelectedTimeSlot(null);
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all text-left ${
                      colorClass.bg
                    } ${
                      colorClass.border
                    } hover:shadow-card`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorClass.icon}`}>
                      {dept.icon}
                    </div>
                    <h4 className={`font-semibold mb-1 ${colorClass.text}`}>{dept.name}</h4>
                    <p className="text-xs text-neutral-500 mb-3">{dept.description}</p>
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <Users size={12} />
                      <span>
                        {doctors.filter(d => d.department === dept.id && d.isOnline).length} 位医生在线
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 医生选择 */}
          {selectedDepartment && (
            <div className="card">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-primary-600" />
                选择医生
                <span className="text-sm font-normal text-neutral-400 ml-2">
                  {DEPARTMENT_LABELS[selectedDepartment]} · {departmentDoctors.length} 位在线
                </span>
              </h3>

              {departmentDoctors.length === 0 ? (
                <div className="py-8 text-center text-neutral-400">
                  <AlertCircle size={32} className="mx-auto mb-2" />
                  <p>当前暂无在线医生</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {departmentDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => {
                        setSelectedDoctor(doctor.id);
                        setSelectedTimeSlot(null);
                      }}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                        selectedDoctor === doctor.id
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <img 
                        src={doctor.avatar} 
                        alt={doctor.name} 
                        className="w-14 h-14 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-neutral-800">{doctor.name}</h4>
                          <span className="text-xs text-neutral-500">{doctor.title}</span>
                          {doctor.isOnline && (
                            <span className="px-2 py-0.5 text-xs bg-success-100 text-success-700 rounded-full">
                              在线
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">
                          专长：{doctor.specialty.join('、')}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            当前 {doctor.currentPatients} 人
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle size={12} />
                            今日已诊 {doctor.todayCompleted} 人
                          </span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedDoctor === doctor.id
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-neutral-300'
                      }`}>
                        {selectedDoctor === doctor.id && (
                          <CheckCircle size={14} className="text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 时段选择 */}
          {selectedDoctor && selectedDoctorData && (
            <div className="card">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary-600" />
                选择时段
              </h3>

              <div className="flex flex-wrap gap-2">
                {selectedDoctorData.availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                      selectedTimeSlot === slot
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-card'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 流转时间线 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <History size={20} className="text-primary-600" />
              顾客流转记录
              <span className="text-xs font-normal text-neutral-400 ml-auto">
                共 {selectedPatient.timeline?.length || 0} 条
              </span>
            </h3>

            <div className="relative pl-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gradient-to-b from-primary-200 via-accent-200 to-neutral-200" />
              
              {(selectedPatient.timeline || []).map((record, index) => (
                <div key={record.id} className="relative pb-5 last:pb-0">
                  <div className={`absolute -left-3.5 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                    index === 0 ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white' : 'bg-white border-2 border-neutral-200 text-neutral-500'
                  }`}>
                    {getTimelineStepIcon(record.step)}
                  </div>
                  <div className={`rounded-xl p-4 ${index === 0 ? 'bg-primary-50/50 border border-primary-100' : 'bg-neutral-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-neutral-800">{record.stepLabel}</p>
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Clock size={11} />
                        {formatTime(record.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {record.handler}
                      </span>
                      <span className="px-2 py-0.5 bg-white rounded-full text-neutral-500">
                        {record.handlerRole}
                      </span>
                    </div>
                    {record.note && (
                      <p className="text-xs text-neutral-500 mt-2 pl-2 border-l-2 border-neutral-200">
                        {record.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：分诊确认 + 风险处理建议 */}
        <div className="space-y-6">
          {/* 高风险提醒 + 处理建议 */}
          {hasRisk && (
            <div className="space-y-3">
              <div className={`card border-l-4 ${
                selectedPatient.riskLevel === 'high'
                  ? 'border-l-danger-500 bg-gradient-to-br from-danger-50/70 to-white'
                  : 'border-l-warning-500 bg-gradient-to-br from-warning-50/70 to-white'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {selectedPatient.riskLevel === 'high' ? (
                    <AlertTriangle size={20} className="text-danger-600" />
                  ) : (
                    <AlertCircle size={20} className="text-warning-600" />
                  )}
                  <h3 className={`text-base font-semibold ${
                    selectedPatient.riskLevel === 'high' ? 'text-danger-700' : 'text-warning-700'
                  }`}>
                    {selectedPatient.riskLevel === 'high' ? '高风险顾客，需重点关注' : '存在风险点，提醒医生'}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {riskFactorKeys.map((factor, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        selectedPatient.riskLevel === 'high'
                          ? 'bg-danger-100 text-danger-700'
                          : 'bg-warning-100 text-warning-700'
                      }`}
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              {riskFactorKeys.map((factor, idx) => {
                const suggestion = RISK_SUGGESTIONS[factor];
                if (!suggestion) return null;
                const colorClass = getSuggestionColorClass(suggestion.color);
                return (
                  <div key={idx} className={`card rounded-xl border ${colorClass.header}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-sm font-semibold ${
                        suggestion.color === 'danger' ? 'text-danger-700' : 'text-warning-700'
                      }`}>
                        {suggestion.title}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClass.badge}`}>
                        #{idx + 1}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {suggestion.tips.map((tip, tipIdx) => (
                        <li key={tipIdx} className={`text-xs flex items-start gap-2 ${colorClass.tip}`}>
                          <span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0 bg-current" />
                          <span className="text-neutral-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* 分诊概览 */}
          <div className="card bg-gradient-to-br from-primary-50 to-accent-50 border-2 border-primary-100">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">分诊确认</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">顾客姓名</span>
                <span className="font-medium text-neutral-800">{selectedPatient.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">身份核验</span>
                {selectedPatient.idVerified ? (
                  <span className="font-medium text-success-600 flex items-center gap-1">
                    <ShieldCheck size={14} />
                    已核验
                  </span>
                ) : (
                  <span className="font-medium text-neutral-400">待核验</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">风险等级</span>
                <span className={`font-medium ${
                  selectedPatient.riskLevel === 'high' ? 'text-danger-600' :
                  selectedPatient.riskLevel === 'medium' ? 'text-warning-600' :
                  'text-success-600'
                }`}>
                  {RISK_LABELS[selectedPatient.riskLevel]}
                </span>
              </div>

              {hasRisk && (
                <div>
                  <span className="text-sm text-neutral-500 block mb-2">风险点数量</span>
                  <div className="flex flex-wrap gap-1">
                    {riskFactorKeys.slice(0, 3).map((factor, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-white rounded-full text-neutral-600 border border-primary-200">
                        {factor}
                      </span>
                    ))}
                    {riskFactorKeys.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-white rounded-full text-neutral-500 border border-neutral-200">
                        +{riskFactorKeys.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-primary-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">分诊科室</span>
                  <span className="font-medium text-neutral-800">
                    {selectedDepartment ? DEPARTMENT_LABELS[selectedDepartment] : '待选择'}
                  </span>
                </div>
                {selectedDoctor && (
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-neutral-500">接诊医生</span>
                    <span className="font-medium text-neutral-800">
                      {selectedDoctorData?.name}
                    </span>
                  </div>
                )}
                {selectedTimeSlot && (
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-neutral-500">预约时段</span>
                    <span className="font-medium text-neutral-800">{selectedTimeSlot}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 预算信息 */}
          {selectedPatient.budgetRange && (
            <div className="card">
              <h4 className="font-medium text-neutral-800 mb-2">预算区间</h4>
              <p className="text-accent-600 font-semibold text-lg">{selectedPatient.budgetRange}</p>
            </div>
          )}

          {/* 关注部位 */}
          {selectedPatient.concernedAreas && selectedPatient.concernedAreas.length > 0 && (
            <div className="card">
              <h4 className="font-medium text-neutral-800 mb-3">关注部位</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPatient.concernedAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-neutral-100 text-neutral-600 rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          {!isConfirmed ? (
            <button
              onClick={handleConfirmTriaging}
              disabled={!selectedDepartment}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认分诊
              <ArrowRight size={20} className="inline ml-2" />
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-5 bg-success-50 rounded-2xl border border-success-200 text-center">
                <CheckCircle size={32} className="mx-auto mb-2 text-success-500" />
                <p className="font-medium text-success-700">分诊完成</p>
                <p className="text-sm text-success-600 mt-1">已加入候诊队列，风险提醒已同步至医生端</p>
              </div>
              <button
                onClick={handleGoToQueue}
                className="w-full btn-accent py-4 text-lg"
              >
                查看候诊队列
                <ChevronRight size={20} className="inline ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentTriaging;
