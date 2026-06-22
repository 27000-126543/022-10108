
import { create } from 'zustand';
import { Patient, Doctor, QueueItem, DashboardStats, DepartmentType, RiskLevel, PatientStatus, QueueStatus, TimelineRecord, TimelineStep, TIMELINE_STEP_LABELS, DEPARTMENT_LABELS } from '@/types';
import { mockPatients } from '@/data/mockPatients';
import { mockDoctors } from '@/data/mockDoctors';
import { generateQueueNumber, calculateWaitTime } from '@/utils/format';

interface PatientState {
  currentPatient: Patient | null;
  patients: Patient[];
  doctors: Doctor[];
  queues: {
    skin: QueueItem[];
    injection: QueueItem[];
    surgery: QueueItem[];
  };
  stats: DashboardStats;

  setCurrentPatient: (patient: Patient | null) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'status' | 'riskLevel' | 'riskFactors' | 'timeline'>) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  updatePatientDemand: (id: string, data: Partial<Patient>) => void;
  assessRisk: (id: string) => void;
  addToQueue: (patientId: string, department: DepartmentType, doctorId?: string) => void;
  updateQueueItem: (queueId: string, data: Partial<QueueItem>) => void;
  callPatient: (queueId: string) => void;
  startConsultation: (queueId: string, room: string) => void;
  completeConsultation: (queueId: string) => void;
  markNoShow: (patientId: string) => void;
  markRescheduled: (patientId: string) => void;
  calculateStats: () => void;
  getIncompletePatients: () => Patient[];
  sendRouteNotification: (patientId: string, room: string) => boolean;
  remind补充信息: (patientId: string) => boolean;
  addTimelineRecord: (patientId: string, step: TimelineStep, note?: string, handler?: string, handlerRole?: TimelineRecord['handlerRole']) => void;
}

const initialPatients = [...mockPatients];

const buildInitialQueues = (patients: Patient[]) => {
  const queues = {
    skin: [] as QueueItem[],
    injection: [] as QueueItem[],
    surgery: [] as QueueItem[],
  };

  patients.forEach(patient => {
    if (patient.department && patient.queueNumber && 
        (patient.status === 'waiting' || patient.status === 'consulting')) {
      const queueItem: QueueItem = {
        id: `queue-${patient.id}`,
        patientId: patient.id,
        patient,
        queueNumber: patient.queueNumber,
        department: patient.department,
        doctorId: patient.assignedDoctor,
        status: patient.status === 'consulting' ? 'consulting' : 'waiting',
        consultationRoom: patient.consultationRoom,
        waitTime: calculateWaitTime(patient.createdAt),
        createdAt: patient.createdAt,
      };
      queues[patient.department].push(queueItem);
    }
  });

  Object.keys(queues).forEach(key => {
    queues[key as keyof typeof queues].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  });

  return queues;
};

const calculateRiskLevel = (patient: Partial<Patient>): { level: RiskLevel; factors: string[] } => {
  const factors: string[] = [];

  if (patient.isPregnant) {
    factors.push('妊娠期');
  }
  if (patient.isLactating) {
    factors.push('哺乳期');
  }
  if (patient.hasHeartCondition) {
    factors.push('心脏疾病');
  }
  if (patient.hasHypertension) {
    factors.push('高血压');
  }
  if (patient.hasDiabetes) {
    factors.push('糖尿病');
  }
  if (patient.hasKeloid) {
    factors.push('疤痕体质');
  }

  patient.allergies?.forEach(allergy => {
    if (allergy.severity === 'severe') {
      factors.push(`严重${allergy.substance}过敏`);
    } else if (allergy.severity === 'moderate') {
      factors.push(`${allergy.substance}过敏`);
    }
  });

  let level: RiskLevel = 'low';
  
  const highRiskFactors = patient.isPregnant || patient.hasHeartCondition;
  const mediumRiskFactors = patient.isLactating || 
                           patient.hasHypertension || 
                           patient.hasDiabetes || 
                           patient.hasKeloid ||
                           patient.allergies?.some(a => a.severity === 'severe');
  
  if (highRiskFactors) {
    level = 'high';
  } else if (mediumRiskFactors) {
    level = 'medium';
  } else if (patient.allergies && patient.allergies.length > 0) {
    level = 'low';
  }

  return { level, factors };
};

const initialQueues = buildInitialQueues(initialPatients);

const createTimelineRecord = (
  step: TimelineStep,
  handler: string = '系统',
  handlerRole: TimelineRecord['handlerRole'] = '系统',
  note?: string,
): TimelineRecord => ({
  id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  step,
  stepLabel: TIMELINE_STEP_LABELS[step],
  handler,
  handlerRole,
  timestamp: new Date(),
  note,
});

const verifyIdStatus = (patient: Partial<Patient>): Partial<Patient> => {
  const shouldVerify = patient.idPhotoTaken && patient.idOcrDone;
  if (shouldVerify && !patient.idVerified) {
    return { idVerified: true, idVerifiedAt: new Date() };
  }
  return {};
};

const calculateInitialStats = (patients: Patient[]): DashboardStats => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayPatients = patients.filter(p => new Date(p.createdAt) >= today);
  
  let totalWaitTime = 0;
  let waitCount = 0;
  let totalConsultTime = 0;
  let consultCount = 0;
  let totalTime = 0;
  let totalCount = 0;

  patients.forEach(p => {
    if (p.triagedAt && p.createdAt) {
      const wait = (new Date(p.triagedAt).getTime() - new Date(p.createdAt).getTime()) / 60000;
      totalWaitTime += wait;
      waitCount++;
    }
    if (p.completedAt && p.consultedAt) {
      const consult = (new Date(p.completedAt).getTime() - new Date(p.consultedAt).getTime()) / 60000;
      totalConsultTime += consult;
      consultCount++;
    }
    if (p.completedAt && p.createdAt) {
      const total = (new Date(p.completedAt).getTime() - new Date(p.createdAt).getTime()) / 60000;
      totalTime += total;
      totalCount++;
    }
  });

  return {
    todayArrivals: todayPatients.length,
    waitingCount: patients.filter(p => p.status === 'waiting').length,
    consultingCount: patients.filter(p => p.status === 'consulting').length,
    completedCount: patients.filter(p => p.status === 'completed').length,
    noShowCount: patients.filter(p => p.status === 'no_show').length,
    avgWaitTime: waitCount > 0 ? Math.round(totalWaitTime / waitCount) : 0,
    avgConsultTime: consultCount > 0 ? Math.round(totalConsultTime / consultCount) : 0,
    avgTotalTime: totalCount > 0 ? Math.round(totalTime / totalCount) : 0,
  };
};

export const usePatientStore = create<PatientState>((set, get) => ({
  currentPatient: null,
  patients: initialPatients,
  doctors: mockDoctors,
  queues: initialQueues,
  stats: calculateInitialStats(initialPatients),

  setCurrentPatient: (patient) => set({ currentPatient: patient }),

  addPatient: (patientData) => {
    const verifyPatch = verifyIdStatus(patientData);
    const initialTimeline: TimelineRecord[] = [
      createTimelineRecord('registered', '前台小王', '前台', '到院完成登记'),
    ];
    if (patientData.idPhotoTaken && patientData.idOcrDone && verifyPatch.idVerified) {
      initialTimeline.push(createTimelineRecord('id_verified', '前台小王', '前台', '拍照+证件核验完成'));
    }
    if (patientData.concernedAreas && patientData.concernedAreas.length > 0) {
      initialTimeline.push(createTimelineRecord('demand_collected', '前台小王', '前台', '扫码建档自带诉求'));
    }

    const newPatient: Patient = {
      ...patientData,
      ...verifyPatch,
      id: `p-${Date.now()}`,
      createdAt: new Date(),
      status: 'registered',
      riskLevel: 'low',
      riskFactors: [],
      concernedAreas: patientData.concernedAreas || [],
      medicalHistory: patientData.medicalHistory || [],
      allergies: patientData.allergies || [],
      isPregnant: patientData.isPregnant || false,
      isLactating: patientData.isLactating || false,
      hasHypertension: patientData.hasHypertension || false,
      hasDiabetes: patientData.hasDiabetes || false,
      hasKeloid: patientData.hasKeloid || false,
      hasHeartCondition: patientData.hasHeartCondition || false,
      idVerified: patientData.idVerified || verifyPatch.idVerified || false,
      idPhotoTaken: patientData.idPhotoTaken || false,
      idOcrDone: patientData.idOcrDone || false,
      idVerifiedAt: verifyPatch.idVerifiedAt || patientData.idVerifiedAt,
      budgetRange: patientData.budgetRange || '待定',
      timeline: initialTimeline,
    };

    set((state) => ({
      patients: [...state.patients, newPatient],
      currentPatient: newPatient,
    }));

    get().calculateStats();
  },

  updatePatient: (id, data) => {
    const patient = get().patients.find(p => p.id === id);
    let extraUpdates: Partial<Patient> = {};
    const newTimeline = patient ? [...patient.timeline] : [];

    if ((data.idPhotoTaken !== undefined || data.idOcrDone !== undefined)) {
      const mergedPhoto = data.idPhotoTaken ?? patient?.idPhotoTaken;
      const mergedOcr = data.idOcrDone ?? patient?.idOcrDone;
      if (mergedPhoto && mergedOcr && !patient?.idVerified) {
        extraUpdates = { idVerified: true, idVerifiedAt: new Date() };
        newTimeline.push(createTimelineRecord('id_verified', '前台小王', '前台', '拍照+证件核验完成'));
      }
    }

    set((state) => ({
      patients: state.patients.map(p => 
        p.id === id ? { ...p, ...data, ...extraUpdates, timeline: newTimeline.length > 0 && newTimeline !== p.timeline ? newTimeline : p.timeline } : p
      ),
      currentPatient: state.currentPatient?.id === id 
        ? { ...state.currentPatient, ...data, ...extraUpdates, timeline: newTimeline.length > 0 ? newTimeline : state.currentPatient.timeline }
        : state.currentPatient,
    }));
    get().calculateStats();
  },

  updatePatientDemand: (id, data) => {
    const patient = get().patients.find(p => p.id === id);
    const newTimeline = patient 
      ? [...patient.timeline, createTimelineRecord('demand_collected', '前台小王', '前台', '诉求信息采集完成')]
      : [];

    set((state) => ({
      patients: state.patients.map(p => 
        p.id === id ? { ...p, ...data, status: 'pending_risk', timeline: newTimeline.length > 0 ? newTimeline : p.timeline } : p
      ),
      currentPatient: state.currentPatient?.id === id 
        ? { ...state.currentPatient, ...data, status: 'pending_risk', timeline: newTimeline.length > 0 ? newTimeline : state.currentPatient.timeline }
        : state.currentPatient,
    }));
  },

  assessRisk: (id) => {
    const patient = get().patients.find(p => p.id === id);
    if (!patient) return;

    const { level, factors } = calculateRiskLevel(patient);
    const newTimeline = [...patient.timeline, createTimelineRecord(
      'risk_assessed', '护士小李', '护士', factors.length > 0 ? `风险评估完成，共${factors.length}项风险点` : '风险评估完成，无异常'
    )];

    set((state) => ({
      patients: state.patients.map(p => 
        p.id === id ? { ...p, riskLevel: level, riskFactors: factors, status: 'pending_triaging', timeline: newTimeline } : p
      ),
      currentPatient: state.currentPatient?.id === id 
        ? { ...state.currentPatient, riskLevel: level, riskFactors: factors, status: 'pending_triaging', timeline: newTimeline }
        : state.currentPatient,
    }));
  },

  addToQueue: (patientId, department, doctorId) => {
    const patient = get().patients.find(p => p.id === patientId);
    if (!patient) return;

    const deptQueue = get().queues[department];
    const nextIndex = deptQueue.length + 1;
    const queueNumber = generateQueueNumber(department, nextIndex);

    const queueItem: QueueItem = {
      id: `queue-${Date.now()}`,
      patientId,
      patient: { ...patient, status: 'waiting' },
      queueNumber,
      department,
      doctorId,
      status: 'waiting',
      waitTime: 0,
      createdAt: new Date(),
    };

    const consultationRooms: Record<DepartmentType, string[]> = {
      skin: ['皮肤诊室 1号', '皮肤诊室 2号', '皮肤诊室 3号'],
      injection: ['注射室 1号', '注射室 2号', '注射室 3号'],
      surgery: ['整形诊室 1号', '整形诊室 2号'],
    };

    const availableRooms = consultationRooms[department];
    const roomIndex = nextIndex % availableRooms.length;

    const newTimeline = [...patient.timeline, createTimelineRecord(
      'triaged', '分诊台', '分诊台', `分配至${DEPARTMENT_LABELS[department]}`
    )];

    set((state) => ({
      queues: {
        ...state.queues,
        [department]: [...state.queues[department], queueItem],
      },
      patients: state.patients.map(p => 
        p.id === patientId 
          ? { ...p, status: 'waiting', department, queueNumber, assignedDoctor: doctorId, triagedAt: new Date(), consultationRoom: availableRooms[roomIndex], timeline: newTimeline }
          : p
      ),
      currentPatient: state.currentPatient?.id === patientId 
        ? { ...state.currentPatient, status: 'waiting', department, queueNumber, assignedDoctor: doctorId, triagedAt: new Date(), consultationRoom: availableRooms[roomIndex], timeline: newTimeline }
        : state.currentPatient,
    }));

    get().calculateStats();
  },

  updateQueueItem: (queueId, data) => {
    set((state) => {
      const newQueues = { ...state.queues };
      (Object.keys(newQueues) as DepartmentType[]).forEach(dept => {
        newQueues[dept] = newQueues[dept].map(item => 
          item.id === queueId ? { ...item, ...data } : item
        );
      });
      return { queues: newQueues };
    });
  },

  callPatient: (queueId) => {
    const state = get();
    let department: DepartmentType | null = null;
    let queueItem: QueueItem | null = null;

    (Object.keys(state.queues) as DepartmentType[]).forEach(dept => {
      const item = state.queues[dept].find(q => q.id === queueId);
      if (item) {
        department = dept;
        queueItem = item;
      }
    });

    if (!department || !queueItem) return;

    const patientId = queueItem.patientId;
    const patient = state.patients.find(p => p.id === patientId);
    const newTimeline = patient 
      ? [...patient.timeline, createTimelineRecord('called', '护士小李', '护士', `叫号就诊，号码${queueItem!.queueNumber}`)]
      : [];

    set((state) => ({
      queues: {
        ...state.queues,
        [department!]: state.queues[department!].map(item => 
          item.id === queueId ? { ...item, status: 'called' as QueueStatus, calledAt: new Date() } : item
        ),
      },
      patients: newTimeline.length > 0
        ? state.patients.map(p => p.id === patientId ? { ...p, timeline: newTimeline } : p)
        : state.patients,
    }));
  },

  startConsultation: (queueId, room) => {
    const state = get();
    let department: DepartmentType | null = null;
    let patientId: string | null = null;

    (Object.keys(state.queues) as DepartmentType[]).forEach(dept => {
      const item = state.queues[dept].find(q => q.id === queueId);
      if (item) {
        department = dept;
        patientId = item.patientId;
      }
    });

    if (!department || !patientId) return;

    const patient = state.patients.find(p => p.id === patientId);
    const doctorName = state.doctors.find(d => d.id === state.queues[department!].find(q => q.id === queueId)?.doctorId)?.name || '接诊医生';
    const newTimeline = patient 
      ? [...patient.timeline, createTimelineRecord('consulting_started', doctorName, '医生', `进入${room}开始面诊`)]
      : [];

    set((state) => ({
      queues: {
        ...state.queues,
        [department!]: state.queues[department!].map(item => 
          item.id === queueId ? { ...item, status: 'consulting' as QueueStatus, consultationRoom: room, consultingAt: new Date() } : item
        ),
      },
      patients: state.patients.map(p => 
        p.id === patientId 
          ? { ...p, status: 'consulting' as PatientStatus, consultationRoom: room, consultedAt: new Date(), timeline: newTimeline.length > 0 ? newTimeline : p.timeline }
          : p
      ),
    }));

    get().calculateStats();
  },

  completeConsultation: (queueId) => {
    const state = get();
    let department: DepartmentType | null = null;
    let patientId: string | null = null;

    (Object.keys(state.queues) as DepartmentType[]).forEach(dept => {
      const item = state.queues[dept].find(q => q.id === queueId);
      if (item) {
        department = dept;
        patientId = item.patientId;
      }
    });

    if (!department || !patientId) return;

    const patient = state.patients.find(p => p.id === patientId);
    const newTimeline = patient 
      ? [...patient.timeline, createTimelineRecord('completed', '接诊医生', '医生', '面诊完成，已给出方案建议')]
      : [];

    set((state) => ({
      queues: {
        ...state.queues,
        [department!]: state.queues[department!].map(item => 
          item.id === queueId ? { ...item, status: 'completed' as QueueStatus, completedAt: new Date() } : item
        ),
      },
      patients: state.patients.map(p => 
        p.id === patientId 
          ? { ...p, status: 'completed' as PatientStatus, completedAt: new Date(), timeline: newTimeline.length > 0 ? newTimeline : p.timeline }
          : p
      ),
    }));

    get().calculateStats();
  },

  markNoShow: (patientId) => {
    set((state) => {
      const patient = state.patients.find(p => p.id === patientId);
      const newQueues = { ...state.queues };
      
      if (patient?.department) {
        newQueues[patient.department] = newQueues[patient.department].filter(
          q => q.patientId !== patientId
        );
      }

      const newTimeline = patient 
        ? [...patient.timeline, createTimelineRecord('no_show', '护士小李', '护士', '候诊超时未到，标记爽约')]
        : [];
      
      return {
        patients: state.patients.map(p => 
          p.id === patientId ? { ...p, status: 'no_show' as PatientStatus, timeline: newTimeline.length > 0 ? newTimeline : p.timeline } : p
        ),
        queues: newQueues,
      };
    });
    get().calculateStats();
  },

  markRescheduled: (patientId) => {
    set((state) => {
      const patient = state.patients.find(p => p.id === patientId);
      const newQueues = { ...state.queues };
      
      if (patient?.department) {
        newQueues[patient.department] = newQueues[patient.department].filter(
          q => q.patientId !== patientId
        );
      }

      const newTimeline = patient 
        ? [...patient.timeline, createTimelineRecord('rescheduled', '前台小王', '前台', '顾客申请改约，已重新安排时间')]
        : [];
      
      return {
        patients: state.patients.map(p => 
          p.id === patientId ? { ...p, status: 'rescheduled' as PatientStatus, timeline: newTimeline.length > 0 ? newTimeline : p.timeline } : p
        ),
        queues: newQueues,
      };
    });
    get().calculateStats();
  },

  addTimelineRecord: (patientId, step, note, handler = '系统', handlerRole = '系统') => {
    set((state) => ({
      patients: state.patients.map(p => 
        p.id === patientId 
          ? { ...p, timeline: [...p.timeline, createTimelineRecord(step, handler, handlerRole, note)] }
          : p
      ),
      currentPatient: state.currentPatient?.id === patientId
        ? { ...state.currentPatient, timeline: [...state.currentPatient.timeline, createTimelineRecord(step, handler, handlerRole, note)] }
        : state.currentPatient,
    }));
  },

  calculateStats: () => {
    const { patients } = get();
    set({ stats: calculateInitialStats(patients) });
  },

  getIncompletePatients: () => {
    const { patients } = get();
    return patients.filter(p => 
      p.status === 'registered' || 
      p.status === 'pending_demand' ||
      p.status === 'pending_risk' ||
      p.status === 'pending_triaging'
    );
  },

  sendRouteNotification: (patientId, room) => {
    const patient = get().patients.find(p => p.id === patientId);
    if (!patient) return false;
    console.log(`已向 ${patient.name} 发送面诊室路线：${room}`);
    return true;
  },

  remind补充信息: (patientId) => {
    const patient = get().patients.find(p => p.id === patientId);
    if (!patient) return false;
    console.log(`已提醒 ${patient.name} 补充缺失信息`);
    return true;
  },
}));
