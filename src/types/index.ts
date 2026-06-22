
export type Gender = 'male' | 'female';

export type PatientStatus = 
  | 'registered' 
  | 'pending_demand'
  | 'pending_risk' 
  | 'pending_triaging' 
  | 'waiting' 
  | 'consulting' 
  | 'completed' 
  | 'no_show' 
  | 'rescheduled';

export type DepartmentType = 'skin' | 'injection' | 'surgery';

export type RiskLevel = 'low' | 'medium' | 'high';

export type AllergySeverity = 'mild' | 'moderate' | 'severe';

export type EffectRating = 'good' | 'average' | 'poor';

export type QueueStatus = 'waiting' | 'called' | 'consulting' | 'completed';

export type TimelineStep =
  | 'registered'
  | 'demand_collected'
  | 'risk_assessed'
  | 'triaged'
  | 'called'
  | 'consulting_started'
  | 'completed'
  | 'no_show'
  | 'rescheduled'
  | 'id_verified';

export interface TimelineRecord {
  id: string;
  step: TimelineStep;
  stepLabel: string;
  handler: string;
  handlerRole: '前台' | '护士' | '分诊台' | '医生' | '系统';
  timestamp: Date;
  note?: string;
}

export interface MedicalHistory {
  id: string;
  procedure: string;
  institution: string;
  date: string;
  effect: EffectRating;
  note?: string;
}

export interface Allergy {
  id: string;
  substance: string;
  severity: AllergySeverity;
  note?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  avatar?: string;
  isNew: boolean;
  concernedAreas: string[];
  budgetRange: string;
  medicalHistory: MedicalHistory[];
  allergies: Allergy[];
  isPregnant: boolean;
  isLactating: boolean;
  hasHypertension: boolean;
  hasDiabetes: boolean;
  hasKeloid: boolean;
  hasHeartCondition: boolean;
  idVerified: boolean;
  idPhotoTaken: boolean;
  idOcrDone: boolean;
  idVerifiedAt?: Date;
  riskLevel: RiskLevel;
  riskFactors: string[];
  status: PatientStatus;
  department?: DepartmentType;
  assignedDoctor?: string;
  consultationRoom?: string;
  queueNumber?: string;
  createdAt: Date;
  triagedAt?: Date;
  consultedAt?: Date;
  completedAt?: Date;
  notes?: string;
  timeline: TimelineRecord[];
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  department: DepartmentType;
  avatar: string;
  availableSlots: string[];
  isOnline: boolean;
  currentPatients: number;
  todayCompleted: number;
  specialty: string[];
}

export interface QueueItem {
  id: string;
  patientId: string;
  patient: Patient;
  queueNumber: string;
  department: DepartmentType;
  doctorId?: string;
  status: QueueStatus;
  consultationRoom?: string;
  waitTime: number;
  createdAt: Date;
  calledAt?: Date;
  consultingAt?: Date;
  completedAt?: Date;
}

export interface DashboardStats {
  todayArrivals: number;
  waitingCount: number;
  consultingCount: number;
  completedCount: number;
  noShowCount: number;
  avgWaitTime: number;
  avgConsultTime: number;
  avgTotalTime: number;
  totalRevenue?: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface ConsultationRoom {
  id: string;
  name: string;
  department: DepartmentType;
  occupied: boolean;
  currentPatient?: string;
}

export const DEPARTMENT_LABELS: Record<DepartmentType, string> = {
  skin: '皮肤美容科',
  injection: '注射美容科',
  surgery: '整形外科',
};

export const DEPARTMENT_COLORS: Record<DepartmentType, string> = {
  skin: 'success',
  injection: 'info',
  surgery: 'warning',
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

export const STATUS_LABELS: Record<PatientStatus, string> = {
  registered: '已登记',
  pending_demand: '待填诉求',
  pending_risk: '待风险评估',
  pending_triaging: '待分诊',
  waiting: '候诊中',
  consulting: '面诊中',
  completed: '已完成',
  no_show: '已爽约',
  rescheduled: '已改约',
};

export const CONCERNED_AREAS = [
  '面部轮廓', '眼睛', '鼻子', '嘴唇', '下巴', '苹果肌',
  '额头', '太阳穴', '法令纹', '皱纹', '皮肤松弛', '痘痘痘印',
  '斑点', '毛孔粗大', '肤色暗沉', '胸部', '腰腹', '腿部',
  '手臂', '背部', '双下巴', '下颌线',
];

export const BUDGET_RANGES = [
  '5000元以下',
  '5000-10000元',
  '10000-20000元',
  '20000-50000元',
  '50000-100000元',
  '100000元以上',
  '待定',
];

export const ALLERGY_SUBSTANCES = [
  '青霉素', '头孢', '麻药', '玻尿酸', '肉毒素',
  '胶原蛋白', '金属', '花粉', '海鲜', '花生',
  '鸡蛋', '牛奶',
];

export const COMMON_PROCEDURES = [
  '双眼皮手术', '隆鼻', '玻尿酸填充', '肉毒素除皱',
  '光子嫩肤', '热玛吉', '超声刀', '水光针',
  '点阵激光', '皮秒激光', '吸脂', '隆胸',
  '线雕', '瘦脸针', '下颌缘提升',
];

export const RISK_SUGGESTIONS: Record<string, { title: string; color: string; tips: string[] }> = {
  '妊娠期': {
    title: '妊娠期禁忌',
    color: 'danger',
    tips: [
      '严禁进行任何有创医美操作',
      '推迟至哺乳期结束后再面诊',
      '可提供术后恢复期参考资料',
    ],
  },
  '哺乳期': {
    title: '哺乳期注意',
    color: 'warning',
    tips: [
      '避免使用麻药和口服药物',
      '激光、光子类项目需谨慎评估',
      '注射类项目建议哺乳期结束后进行',
    ],
  },
  '心脏疾病': {
    title: '心脏疾病高风险',
    color: 'danger',
    tips: [
      '需提供近期心内科检查报告',
      '操作前必须心电图检查',
      '建议在心电监护下进行操作',
      '严禁全麻，慎用局麻药含肾上腺素',
    ],
  },
  '高血压': {
    title: '高血压提醒',
    color: 'warning',
    tips: [
      '操作前测量血压，高于150/90需推迟',
      '确认患者规律服用降压药',
      '避免使用含肾上腺素的局麻药',
      '术中监测血压变化',
    ],
  },
  '糖尿病': {
    title: '糖尿病提醒',
    color: 'warning',
    tips: [
      '术前需检测空腹血糖（控制在8mmol/L以下）',
      '确认规律用药，注意低血糖预防',
      '有创项目需预防性使用抗生素',
      '加强术后伤口护理，预防感染',
    ],
  },
  '疤痕体质': {
    title: '疤痕体质提示',
    color: 'warning',
    tips: [
      '尽量选择非手术/微创方案',
      '手术项目需签署疤痕增生知情同意',
      '术后提前使用抗疤痕药物',
      '可配合激光预防疤痕增生',
    ],
  },
};

export const TIMELINE_STEP_LABELS: Record<TimelineStep, string> = {
  registered: '到院登记',
  demand_collected: '诉求采集完成',
  risk_assessed: '风险评估完成',
  triaged: '科室分诊完成',
  called: '已叫号',
  consulting_started: '开始面诊',
  completed: '面诊完成',
  no_show: '标记爽约',
  rescheduled: '已改约',
  id_verified: '身份核验通过',
};

