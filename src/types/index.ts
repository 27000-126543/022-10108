
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
