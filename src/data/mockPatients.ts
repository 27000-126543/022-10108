
import { Patient, TimelineRecord, TimelineStep } from '@/types';

const now = new Date();

const minutesAgo = (minutes: number) => {
  const date = new Date(now);
  date.setMinutes(date.getMinutes() - minutes);
  return date;
};

const buildTimelineRecord = (
  step: TimelineStep,
  minutesOffset: number,
  handler: string = '系统',
  handlerRole: TimelineRecord['handlerRole'] = '系统',
  note?: string,
): TimelineRecord => ({
  id: `tl-mock-${step}-${minutesOffset}-${Math.random().toString(36).slice(2, 6)}`,
  step,
  stepLabel: step === 'registered' ? '到院登记'
    : step === 'demand_collected' ? '诉求采集完成'
    : step === 'risk_assessed' ? '风险评估完成'
    : step === 'triaged' ? '科室分诊完成'
    : step === 'called' ? '已叫号'
    : step === 'consulting_started' ? '开始面诊'
    : step === 'completed' ? '面诊完成'
    : step === 'no_show' ? '标记爽约'
    : step === 'rescheduled' ? '已改约'
    : '身份核验通过',
  handler,
  handlerRole,
  timestamp: minutesAgo(minutesOffset),
  note,
});

const buildTimelineForPatient = (patient: Partial<Patient>, registeredMinutes: number, status: Patient['status']): TimelineRecord[] => {
  const timeline: TimelineRecord[] = [];
  let minuteCursor = registeredMinutes;

  timeline.push(buildTimelineRecord('registered', minuteCursor, '前台小王', '前台', '到院完成登记'));

  if (patient.idVerified) {
    minuteCursor = Math.max(minuteCursor - 3, 1);
    timeline.push(buildTimelineRecord('id_verified', minuteCursor, '前台小王', '前台', '拍照+证件核验完成'));
  }

  if (status !== 'registered' && status !== 'pending_demand') {
    minuteCursor = Math.max(minuteCursor - 5, 1);
    timeline.push(buildTimelineRecord('demand_collected', minuteCursor, '前台小王', '前台', '诉求信息采集完成'));
  }

  if (status === 'pending_triaging' || status === 'waiting' || status === 'consulting' || status === 'completed') {
    minuteCursor = Math.max(minuteCursor - 8, 1);
    const note = patient.riskFactors && patient.riskFactors.length > 0
      ? `风险评估完成，共${patient.riskFactors.length}项风险点`
      : '风险评估完成，无异常';
    timeline.push(buildTimelineRecord('risk_assessed', minuteCursor, '护士小李', '护士', note));
  }

  if (status === 'waiting' || status === 'consulting' || status === 'completed') {
    minuteCursor = Math.max(minuteCursor - 10, 1);
    const deptName = patient.department === 'skin' ? '皮肤美容科'
      : patient.department === 'injection' ? '注射美容科'
      : patient.department === 'surgery' ? '整形外科' : '';
    timeline.push(buildTimelineRecord('triaged', minuteCursor, '分诊台', '分诊台', `分配至${deptName}`));

    minuteCursor = Math.max(minuteCursor - 15, 1);
    timeline.push(buildTimelineRecord('called', minuteCursor, '护士小李', '护士', `叫号就诊`));
  }

  if (status === 'consulting' || status === 'completed') {
    minuteCursor = Math.max(minuteCursor - 20, 1);
    timeline.push(buildTimelineRecord('consulting_started', minuteCursor, '接诊医生', '医生', '进入诊室开始面诊'));
  }

  if (status === 'completed') {
    minuteCursor = Math.max(minuteCursor - 30, 1);
    timeline.push(buildTimelineRecord('completed', minuteCursor, '接诊医生', '医生', '面诊完成，已给出方案建议'));
  }

  if (status === 'no_show') {
    minuteCursor = Math.max(minuteCursor - 15, 1);
    timeline.push(buildTimelineRecord('no_show', minuteCursor, '护士小李', '护士', '候诊超时未到，标记爽约'));
  }

  if (status === 'rescheduled') {
    minuteCursor = Math.max(minuteCursor - 15, 1);
    timeline.push(buildTimelineRecord('rescheduled', minuteCursor, '前台小王', '前台', '顾客申请改约，已重新安排时间'));
  }

  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return timeline;
};

interface RawPatient extends Omit<Patient, 'timeline'> {
  registeredMinutesAgo: number;
}

const rawPatients: RawPatient[] = [
  {
    id: 'p-001',
    name: '林雨晴',
    phone: '138****1234',
    age: 28,
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linyuqing',
    isNew: true,
    concernedAreas: ['鼻子', '法令纹', '苹果肌'],
    budgetRange: '20000-50000元',
    medicalHistory: [
      {
        id: 'mh-001',
        procedure: '水光针',
        institution: 'XX美容院',
        date: '2024-03-15',
        effect: 'good',
        note: '效果不错，维持了约3个月',
      },
    ],
    allergies: [
      {
        id: 'al-001',
        substance: '青霉素',
        severity: 'moderate',
      },
    ],
    isPregnant: false,
    isLactating: false,
    hasHypertension: false,
    hasDiabetes: false,
    hasKeloid: false,
    hasHeartCondition: false,
    idVerified: true,
    idPhotoTaken: true,
    idOcrDone: true,
    idVerifiedAt: minutesAgo(50),
    riskLevel: 'low',
    riskFactors: ['青霉素过敏'],
    status: 'waiting',
    department: 'injection',
    assignedDoctor: 'doc-004',
    consultationRoom: '注射室 3号',
    queueNumber: 'Z003',
    createdAt: minutesAgo(45),
    triagedAt: minutesAgo(30),
    notes: '想做鼻子综合改善',
    registeredMinutesAgo: 45,
  },
  {
    id: 'p-002',
    name: '陈思琪',
    phone: '139****5678',
    age: 35,
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chensiqi',
    isNew: false,
    concernedAreas: ['皱纹', '皮肤松弛', '下颌线'],
    budgetRange: '50000-100000元',
    medicalHistory: [
      {
        id: 'mh-002',
        procedure: '热玛吉',
        institution: '本院',
        date: '2024-01-10',
        effect: 'good',
      },
      {
        id: 'mh-003',
        procedure: '肉毒素除皱',
        institution: '本院',
        date: '2024-05-20',
        effect: 'good',
      },
    ],
    allergies: [],
    isPregnant: false,
    isLactating: false,
    hasHypertension: true,
    hasDiabetes: false,
    hasKeloid: false,
    hasHeartCondition: false,
    idVerified: true,
    idPhotoTaken: true,
    idOcrDone: true,
    idVerifiedAt: minutesAgo(90),
    riskLevel: 'medium',
    riskFactors: ['高血压'],
    status: 'consulting',
    department: 'skin',
    assignedDoctor: 'doc-001',
    consultationRoom: '皮肤诊室 2号',
    queueNumber: 'P002',
    createdAt: minutesAgo(80),
    triagedAt: minutesAgo(60),
    consultedAt: minutesAgo(15),
    registeredMinutesAgo: 80,
  },
  {
    id: 'p-003',
    name: '王梦瑶',
    phone: '136****9012',
    age: 25,
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangmengyao',
    isNew: true,
    concernedAreas: ['眼睛', '鼻子', '面部轮廓'],
    budgetRange: '30000-50000元',
    medicalHistory: [],
    allergies: [],
    isPregnant: false,
    isLactating: false,
    hasHypertension: false,
    hasDiabetes: false,
    hasKeloid: false,
    hasHeartCondition: false,
    idVerified: false,
    idPhotoTaken: false,
    idOcrDone: false,
    riskLevel: 'low',
    riskFactors: [],
    status: 'waiting',
    department: 'surgery',
    assignedDoctor: 'doc-007',
    consultationRoom: '整形诊室 1号',
    queueNumber: 'W001',
    createdAt: minutesAgo(60),
    triagedAt: minutesAgo(40),
    registeredMinutesAgo: 60,
  },
  {
    id: 'p-004',
    name: '张婷婷',
    phone: '137****3456',
    age: 31,
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangtingting',
    isNew: false,
    concernedAreas: ['斑点', '肤色暗沉', '毛孔粗大'],
    budgetRange: '10000-20000元',
    medicalHistory: [
      {
        id: 'mh-004',
        procedure: '光子嫩肤',
        institution: '本院',
        date: '2024-02-28',
        effect: 'average',
        note: '有改善但不明显',
      },
    ],
    allergies: [
      {
        id: 'al-002',
        substance: '花粉',
        severity: 'mild',
      },
    ],
    isPregnant: true,
    isLactating: false,
    hasHypertension: false,
    hasDiabetes: false,
    hasKeloid: false,
    hasHeartCondition: false,
    idVerified: true,
    idPhotoTaken: true,
    idOcrDone: true,
    idVerifiedAt: minutesAgo(25),
    riskLevel: 'high',
    riskFactors: ['妊娠期', '花粉过敏'],
    status: 'pending_risk',
    department: 'skin',
    createdAt: minutesAgo(20),
    notes: '怀孕3个月，需谨慎评估',
    registeredMinutesAgo: 20,
  },
  {
    id: 'p-005',
    name: '李雅琴',
    phone: '135****7890',
    age: 42,
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liyaqin',
    isNew: false,
    concernedAreas: ['皱纹', '皮肤松弛', '法令纹', '苹果肌'],
    budgetRange: '100000元以上',
    medicalHistory: [
      {
        id: 'mh-005',
        procedure: '超声刀',
        institution: '韩国XX医院',
        date: '2023-11-15',
        effect: 'good',
      },
      {
        id: 'mh-006',
        procedure: '玻尿酸填充',
        institution: '本院',
        date: '2024-04-10',
        effect: 'good',
      },
    ],
    allergies: [],
    isPregnant: false,
    isLactating: false,
    hasHypertension: false,
    hasDiabetes: true,
    hasKeloid: false,
    hasHeartCondition: false,
    idVerified: true,
    idPhotoTaken: true,
    idOcrDone: true,
    idVerifiedAt: minutesAgo(30),
    riskLevel: 'medium',
    riskFactors: ['糖尿病'],
    status: 'waiting',
    department: 'injection',
    queueNumber: 'Z004',
    createdAt: minutesAgo(25),
    triagedAt: minutesAgo(10),
    registeredMinutesAgo: 25,
  },
  {
    id: 'p-006',
    name: '赵子涵',
    phone: '158****2345',
    age: 22,
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoziHan',
    isNew: true,
    concernedAreas: ['痘痘痘印', '毛孔粗大'],
    budgetRange: '5000-10000元',
    medicalHistory: [],
    allergies: [],
    isPregnant: false,
    isLactating: false,
    hasHypertension: false,
    hasDiabetes: false,
    hasKeloid: true,
    hasHeartCondition: false,
    idVerified: false,
    idPhotoTaken: false,
    idOcrDone: false,
    riskLevel: 'low',
    riskFactors: [],
    status: 'pending_demand',
    createdAt: minutesAgo(10),
    registeredMinutesAgo: 10,
  },
  {
    id: 'p-007',
    name: '周佳丽',
    phone: '186****6789',
    age: 29,
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhoujiali',
    isNew: true,
    concernedAreas: ['胸部', '腰腹', '腿部'],
    budgetRange: '50000-100000元',
    medicalHistory: [],
    allergies: [
      {
        id: 'al-003',
        substance: '麻药',
        severity: 'severe',
        note: '曾出现过敏反应',
      },
    ],
    isPregnant: false,
    isLactating: false,
    hasHypertension: false,
    hasDiabetes: false,
    hasKeloid: false,
    hasHeartCondition: false,
    idVerified: false,
    idPhotoTaken: false,
    idOcrDone: false,
    riskLevel: 'medium',
    riskFactors: ['麻药过敏'],
    status: 'pending_triaging',
    createdAt: minutesAgo(35),
    registeredMinutesAgo: 35,
  },
  {
    id: 'p-008',
    name: '孙婉如',
    phone: '152****0123',
    age: 33,
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunwanru',
    isNew: false,
    concernedAreas: ['瘦脸针', '下颌线'],
    budgetRange: '5000-10000元',
    medicalHistory: [
      {
        id: 'mh-007',
        procedure: '瘦脸针',
        institution: '本院',
        date: '2024-03-05',
        effect: 'good',
      },
    ],
    allergies: [],
    isPregnant: false,
    isLactating: true,
    hasHypertension: false,
    hasDiabetes: false,
    hasKeloid: false,
    hasHeartCondition: false,
    idVerified: true,
    idPhotoTaken: true,
    idOcrDone: true,
    idVerifiedAt: minutesAgo(55),
    riskLevel: 'medium',
    riskFactors: ['哺乳期'],
    status: 'waiting',
    department: 'injection',
    queueNumber: 'Z005',
    createdAt: minutesAgo(50),
    triagedAt: minutesAgo(35),
    registeredMinutesAgo: 50,
  },
  {
    id: 'p-009',
    name: '吴俊熙',
    phone: '188****4567',
    age: 30,
    gender: 'male',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wujunxi',
    isNew: true,
    concernedAreas: ['痘痘痘印', '皮肤松弛', '双下巴'],
    budgetRange: '20000-50000元',
    medicalHistory: [],
    allergies: [],
    isPregnant: false,
    isLactating: false,
    hasHypertension: false,
    hasDiabetes: false,
    hasKeloid: false,
    hasHeartCondition: false,
    idVerified: true,
    idPhotoTaken: true,
    idOcrDone: false,
    idVerifiedAt: minutesAgo(75),
    riskLevel: 'low',
    riskFactors: [],
    status: 'consulting',
    department: 'skin',
    assignedDoctor: 'doc-002',
    consultationRoom: '皮肤诊室 1号',
    queueNumber: 'P003',
    createdAt: minutesAgo(70),
    triagedAt: minutesAgo(50),
    consultedAt: minutesAgo(20),
    registeredMinutesAgo: 70,
  },
  {
    id: 'p-010',
    name: '黄丽娜',
    phone: '139****8901',
    age: 38,
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=huanglina',
    isNew: false,
    concernedAreas: ['线雕', '面部年轻化'],
    budgetRange: '30000-50000元',
    medicalHistory: [
      {
        id: 'mh-008',
        procedure: '线雕提升',
        institution: '本院',
        date: '2023-08-20',
        effect: 'good',
      },
    ],
    allergies: [],
    isPregnant: false,
    isLactating: false,
    hasHypertension: false,
    hasDiabetes: false,
    hasKeloid: false,
    hasHeartCondition: false,
    idVerified: true,
    idPhotoTaken: true,
    idOcrDone: true,
    idVerifiedAt: minutesAgo(125),
    riskLevel: 'low',
    riskFactors: [],
    status: 'completed',
    department: 'injection',
    assignedDoctor: 'doc-005',
    consultationRoom: '注射室 2号',
    queueNumber: 'Z001',
    createdAt: minutesAgo(120),
    triagedAt: minutesAgo(100),
    consultedAt: minutesAgo(80),
    completedAt: minutesAgo(30),
    registeredMinutesAgo: 120,
  },
];

export const mockPatients: Patient[] = rawPatients.map(({ registeredMinutesAgo, ...rest }) => ({
  ...rest,
  timeline: buildTimelineForPatient(rest, registeredMinutesAgo, rest.status),
}));

export const getPatientById = (id: string) => {
  return mockPatients.find(p => p.id === id);
};

export const getPatientsByStatus = (status: string) => {
  return mockPatients.filter(p => p.status === status);
};

export const getPatientsByDepartment = (department: string) => {
  return mockPatients.filter(p => p.department === department);
};
