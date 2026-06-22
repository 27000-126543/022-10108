
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  QrCode,
  Camera,
  Phone,
  User,
  Calendar,
  CheckCircle,
  ChevronRight,
  Search,
  Scan,
  ImagePlus,
  ShieldCheck,
  Clock,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';
import { Gender, Patient } from '@/types';

const Registration = () => {
  const navigate = useNavigate();
  const { addPatient, patients, setCurrentPatient, currentPatient, updatePatient } = usePatientStore();

  const [phone, setPhone] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'female' as Gender,
  });
  const [searchResult, setSearchResult] = useState<typeof patients>([]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(currentPatient?.idPhotoTaken || false);
  const [ocrDone, setOcrDone] = useState(currentPatient?.idOcrDone || false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [qrScanning, setQrScanning] = useState(false);
  const [qrProgress, setQrProgress] = useState(0);
  const [tempPatient, setTempPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (currentPatient) {
      setPhotoTaken(currentPatient.idPhotoTaken || false);
      setOcrDone(currentPatient.idOcrDone || false);
    }
  }, [currentPatient]);

  const handlePhoneSearch = () => {
    if (phone.length < 7) return;
    const results = patients.filter(p => p.phone.includes(phone));
    setSearchResult(results);
    if (results.length > 0) {
      setIsNewCustomer(false);
    }
  };

  const handleSelectCustomer = (patient: typeof patients[0]) => {
    setCurrentPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
    });
    setPhotoTaken(patient.idPhotoTaken || false);
    setOcrDone(patient.idOcrDone || false);
    setStep(2);
    setIsNewCustomer(false);
  };

  const simulatePhotoCapture = () => {
    setPhotoLoading(true);
    setTimeout(() => {
      setPhotoLoading(false);
      setPhotoTaken(true);
      if (currentPatient) {
        updatePatient(currentPatient.id, { idPhotoTaken: true });
      }
      setShowPhotoModal(false);
    }, 1500);
  };

  const simulateOcrScan = () => {
    setOcrLoading(true);
    setTimeout(() => {
      setOcrLoading(false);
      setOcrDone(true);
      if (!formData.name) {
        setFormData({
          ...formData,
          name: '身份证姓名示例',
          age: Math.floor(Math.random() * 30 + 20).toString(),
        });
      }
      if (currentPatient) {
        updatePatient(currentPatient.id, { idOcrDone: true });
      }
      setShowOcrModal(false);
    }, 2000);
  };

  const isIdVerified = photoTaken && ocrDone;

  const handleQuickRegister = () => {
    if (!formData.name || !formData.age) return;

    const newPatient = {
      name: formData.name,
      phone: phone || '138****0000',
      age: parseInt(formData.age),
      gender: formData.gender,
      isNew: true,
      concernedAreas: [],
      budgetRange: '待定',
      medicalHistory: [],
      allergies: [],
      isPregnant: false,
      isLactating: false,
      hasHypertension: false,
      hasDiabetes: false,
      hasKeloid: false,
      hasHeartCondition: false,
      idVerified: isIdVerified,
      idPhotoTaken: photoTaken,
      idOcrDone: ocrDone,
      idVerifiedAt: isIdVerified ? new Date() : undefined,
      riskLevel: 'low' as const,
      riskFactors: [],
      status: 'pending_demand' as const,
    };

    addPatient(newPatient);
    setStep(3);
  };

  const handleGoToDemand = () => {
    navigate('/demand');
  };

  const simulateQrScanFlow = () => {
    setQrScanning(true);
    setQrProgress(0);

    const interval = setInterval(() => {
      setQrProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
      const newPatientData = {
        name: `扫码用户${randomSuffix}`,
        phone: `138${randomSuffix}${randomSuffix.toString().slice(0, 3)}`,
        age: Math.floor(Math.random() * 25 + 20),
        gender: 'female' as Gender,
        isNew: true,
        concernedAreas: ['鼻子', '皮肤松弛'],
        budgetRange: '10000-20000元',
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
        riskLevel: 'low' as const,
        riskFactors: [],
        status: 'pending_risk' as const,
      };

      addPatient(newPatientData);
      setTempPatient({ ...newPatientData, id: `p-${Date.now()}` } as Patient);
      setQrScanning(false);
    }, 4500);
  };

  const handleCloseQrModal = () => {
    setShowQrModal(false);
    setQrProgress(0);
    setQrScanning(false);
    setTempPatient(null);
  };

  const handleGoToRisk = () => {
    handleCloseQrModal();
    navigate('/risk');
  };

  const steps = [
    { num: 1, title: '手机号验证' },
    { num: 2, title: '基本信息' },
    { num: 3, title: '登记完成' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* 步骤指示器 */}
      <div className="card mb-6">
        <div className="flex items-center justify-center gap-4">
          {steps.map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                  step >= s.num
                    ? 'bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-glow'
                    : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {step > s.num ? <CheckCircle size={20} /> : s.num}
                </div>
                <span className={`font-medium ${
                  step >= s.num ? 'text-neutral-800' : 'text-neutral-400'
                }`}>
                  {s.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                  step > s.num ? 'bg-accent-400' : 'bg-neutral-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧表单 */}
        <div className="lg:col-span-2">
          <div className="card">
            {step === 1 && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold text-neutral-800 mb-6">手机号快速登记</h3>

                <div className="mb-6">
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setIsNewCustomer(true)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                        isNewCustomer
                          ? 'bg-gradient-to-r from-primary-800 to-primary-900 text-white shadow-card'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      <UserPlus size={18} className="inline mr-2" />
                      新客登记
                    </button>
                    <button
                      onClick={() => setIsNewCustomer(false)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                        !isNewCustomer
                          ? 'bg-gradient-to-r from-accent-400 to-accent-600 text-white shadow-glow'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      <User size={18} className="inline mr-2" />
                      老客复诊
                    </button>
                  </div>
                </div>

                <div className="relative mb-6">
                  <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (e.target.value.length >= 7) {
                        handlePhoneSearch();
                      }
                    }}
                    onBlur={handlePhoneSearch}
                    placeholder="请输入手机号码"
                    className="w-full pl-12 pr-4 py-4 text-lg border border-neutral-200 rounded-2xl
                             focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                             transition-all duration-200"
                    maxLength={11}
                  />
                </div>

                {!isNewCustomer && searchResult.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-neutral-500 mb-3">搜索到 {searchResult.length} 位顾客</p>
                    <div className="space-y-2">
                      {searchResult.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => handleSelectCustomer(patient)}
                          className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 cursor-pointer
                                   hover:border-primary-300 hover:bg-primary-50/50 transition-all"
                        >
                          <img
                            src={patient.avatar}
                            alt={patient.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-neutral-800">{patient.name}</p>
                              {patient.isNew && (
                                <span className="px-2 py-0.5 text-xs bg-accent-100 text-accent-700 rounded-full">
                                  新客
                                </span>
                              )}
                              {patient.idVerified && (
                                <span className="px-2 py-0.5 text-xs bg-success-100 text-success-700 rounded-full flex items-center gap-1">
                                  <ShieldCheck size={10} />
                                  已核验
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-500">{patient.phone}</p>
                          </div>
                          <ChevronRight size={20} className="text-neutral-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 btn-primary py-4 text-lg"
                  >
                    {isNewCustomer ? '继续填写信息' : '确认选择'}
                  </button>
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="px-6 py-4 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-xl
                             font-medium hover:from-success-600 hover:to-success-700 transition-all
                             flex items-center gap-2"
                  >
                    <QrCode size={20} />
                    扫码建档
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold text-neutral-800 mb-6">填写基本信息</h3>

                <div className="flex gap-6 mb-8">
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24">
                      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden ${
                        photoTaken 
                          ? 'bg-gradient-to-br from-success-100 to-success-200' 
                          : 'bg-gradient-to-br from-primary-100 to-primary-200'
                      }`}>
                        {photoTaken ? (
                          <div className="text-center">
                            <CheckCircle size={32} className="mx-auto mb-1 text-success-600" />
                            <p className="text-xs text-success-700 font-medium">已拍照</p>
                          </div>
                        ) : currentPatient?.avatar ? (
                          <img src={currentPatient.avatar} alt="头像" className="w-full h-full object-cover" />
                        ) : (
                          <User size={40} className="text-primary-400" />
                        )}
                      </div>
                      <button 
                        onClick={() => setShowPhotoModal(true)}
                        className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                          photoTaken 
                            ? 'bg-success-500 text-white' 
                            : 'bg-primary-500 text-white hover:bg-primary-600'
                        }`}
                      >
                        <Camera size={16} />
                      </button>
                    </div>
                    <p className={`text-xs text-center mt-2 ${
                      photoTaken ? 'text-success-600 font-medium' : 'text-neutral-500'
                    }`}>
                      {photoTaken ? '已完成拍摄' : '点击拍照/上传'}
                    </p>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-neutral-600 mb-2">姓名</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="请输入姓名"
                          className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl
                                   focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                                   transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-2">年龄</label>
                      <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          placeholder="年龄"
                          className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl
                                   focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                                   transition-all"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-neutral-600 mb-2">性别</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setFormData({ ...formData, gender: 'female' })}
                          className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                            formData.gender === 'female'
                              ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          女
                        </button>
                        <button
                          onClick={() => setFormData({ ...formData, gender: 'male' })}
                          className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                            formData.gender === 'male'
                              ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          男
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 身份确认 */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-neutral-800 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-primary-600" />
                      身份确认
                    </h4>
                    <span className={`text-sm font-medium flex items-center gap-1 ${
                      isIdVerified ? 'text-success-600' : 'text-neutral-400'
                    }`}>
                      {isIdVerified ? (
                        <>
                          <CheckCircle size={14} />
                          身份已核验
                        </>
                      ) : '待核验'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => photoTaken ? null : setShowPhotoModal(true)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        photoTaken
                          ? 'bg-success-50 border-success-300'
                          : 'bg-white border-dashed border-primary-300 hover:border-primary-500 hover:bg-primary-50/50'
                      }`}
                    >
                      {photoTaken ? (
                        <div className="animate-fade-in">
                          <CheckCircle size={24} className="mx-auto mb-2 text-success-500" />
                          <p className="text-sm text-success-700 font-medium">已拍照确认</p>
                          <p className="text-xs text-success-500 mt-1">面部照片已采集</p>
                        </div>
                      ) : (
                        <div>
                          <Camera size={24} className="mx-auto mb-2 text-primary-500" />
                          <p className="text-sm text-neutral-700">拍照确认</p>
                          <p className="text-xs text-neutral-400 mt-1">采集面部照片</p>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => ocrDone ? null : setShowOcrModal(true)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        ocrDone
                          ? 'bg-success-50 border-success-300'
                          : 'bg-white border-dashed border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      {ocrDone ? (
                        <div className="animate-fade-in">
                          <CheckCircle size={24} className="mx-auto mb-2 text-success-500" />
                          <p className="text-sm text-success-700 font-medium">已完成识别</p>
                          <p className="text-xs text-success-500 mt-1">证件信息已读取</p>
                        </div>
                      ) : (
                        <div>
                          <Scan size={24} className="mx-auto mb-2 text-neutral-500" />
                          <p className="text-sm text-neutral-700">证件识别</p>
                          <p className="text-xs text-neutral-400 mt-1">自动读取身份信息</p>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-all"
                  >
                    上一步
                  </button>
                  <button
                    onClick={handleQuickRegister}
                    disabled={!formData.name || !formData.age}
                    className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    完成登记，下一步
                    <ChevronRight size={18} className="inline ml-1" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-lg">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">登记成功</h3>
                <p className="text-neutral-500 mb-8">顾客信息已录入系统，请引导顾客填写诉求</p>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500">姓名</p>
                    <p className="font-medium text-neutral-800">{formData.name || '顾客'}</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500">状态</p>
                    <p className="font-medium text-info-600">待填诉求</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500 mb-1">身份核验</p>
                    <div className="flex items-center justify-center gap-1">
                      {isIdVerified ? (
                        <>
                          <ShieldCheck size={14} className="text-success-600" />
                          <span className="font-medium text-success-700">已核验</span>
                        </>
                      ) : (
                        <span className="font-medium text-neutral-500">待核验</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500 mb-1">信息完成度</p>
                    <div className="flex items-center justify-center">
                      <div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden mr-2">
                        <div
                          className={`h-full rounded-full ${
                            isIdVerified ? 'bg-success-500' : 'bg-primary-500'
                          }`}
                          style={{ width: isIdVerified ? '100%' : '60%' }}
                        />
                      </div>
                      <span className="font-medium text-neutral-700 text-sm">
                        {isIdVerified ? '100%' : '60%'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 max-w-md mx-auto">
                  <button
                    onClick={() => {
                      setStep(1);
                      setFormData({ name: '', age: '', gender: 'female' });
                      setPhone('');
                      setPhotoTaken(false);
                      setOcrDone(false);
                    }}
                    className="flex-1 px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-all"
                  >
                    继续登记
                  </button>
                  <button
                    onClick={handleGoToDemand}
                    className="flex-1 btn-primary py-3"
                  >
                    采集诉求
                    <ChevronRight size={18} className="inline ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧快捷操作 */}
        <div className="space-y-6">
          <div className="card">
            <h4 className="font-medium text-neutral-800 mb-4">今日登记统计</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">今日到院</span>
                <span className="text-2xl font-bold text-primary-700">{patients.length}</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-3 bg-accent-50 rounded-xl">
                  <p className="text-lg font-bold text-accent-600">
                    {patients.filter(p => p.isNew).length}
                  </p>
                  <p className="text-xs text-neutral-500">新客</p>
                </div>
                <div className="text-center p-3 bg-info-50 rounded-xl">
                  <p className="text-lg font-bold text-info-600">
                    {patients.filter(p => !p.isNew).length}
                  </p>
                  <p className="text-xs text-neutral-500">老客</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="font-medium text-neutral-800 mb-4">快捷操作</h4>
            <div className="space-y-2">
              <button
                onClick={() => setShowQrModal(true)}
                className="w-full p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl text-left
                         hover:from-success-100 hover:to-success-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">扫码建档</p>
                    <p className="text-xs text-neutral-500">顾客扫码自助填写</p>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 bg-gradient-to-r from-info-50 to-info-100 rounded-xl text-left
                               hover:from-info-100 hover:to-info-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">搜索老客</p>
                    <p className="text-xs text-neutral-500">手机号/姓名查询</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 扫码建档弹窗 */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-neutral-800">扫码自助建档</h3>
              <button
                onClick={handleCloseQrModal}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
              >
                <X size={18} />
              </button>
            </div>
            
            {!qrScanning && !tempPatient && (
              <>
                <p className="text-sm text-neutral-500 mb-6 text-center">让顾客扫描下方二维码，自助填写信息</p>

                <div className="w-64 h-64 mx-auto bg-white border-2 border-neutral-200 rounded-2xl flex items-center justify-center mb-6 relative">
                  <div className="text-center">
                    <QrCode size={120} className="mx-auto text-primary-800 mb-2" />
                    <p className="text-xs text-neutral-400">扫码建档二维码</p>
                  </div>
                  <div className="absolute inset-2 border-2 border-dashed border-success-300 rounded-xl" />
                </div>

                <div className="flex gap-2 mb-6">
                  <div className="flex-1 p-3 bg-neutral-50 rounded-lg text-center">
                    <p className="text-xs text-neutral-500">有效期</p>
                    <p className="font-medium text-neutral-700">30分钟</p>
                  </div>
                  <div className="flex-1 p-3 bg-neutral-50 rounded-lg text-center">
                    <p className="text-xs text-neutral-500">填写预计</p>
                    <p className="font-medium text-neutral-700">3-5分钟</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={simulateQrScanFlow}
                    className="flex-1 py-3 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-xl
                             font-medium hover:from-success-600 hover:to-success-700 transition-all
                             flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    模拟顾客扫码
                  </button>
                  <button
                    onClick={handleCloseQrModal}
                    className="px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50"
                  >
                    关闭
                  </button>
                </div>
              </>
            )}

            {qrScanning && !tempPatient && (
              <div className="py-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-success-200" />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-success-500 border-t-transparent animate-spin"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-success-600">{qrProgress}%</span>
                  </div>
                </div>
                <p className="text-neutral-700 font-medium mb-1">顾客正在填写资料...</p>
                <p className="text-sm text-neutral-500">等待顾客提交</p>
              </div>
            )}

            {tempPatient && (
              <div className="animate-fade-in">
                <div className="p-5 bg-success-50 rounded-xl border border-success-200 text-center mb-6">
                  <CheckCircle size={48} className="mx-auto mb-3 text-success-500" />
                  <p className="font-semibold text-success-800 mb-1">顾客建档成功！</p>
                  <p className="text-sm text-success-600">资料已自动同步到系统</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-500">顾客姓名</span>
                    <span className="font-medium text-neutral-800">{tempPatient.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-500">联系电话</span>
                    <span className="font-medium text-neutral-800">{tempPatient.phone}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-500">当前状态</span>
                    <span className="px-2 py-0.5 text-xs bg-info-100 text-info-700 rounded-full font-medium">
                      待风险评估
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-500">关注部位</span>
                    <span className="font-medium text-primary-700 text-sm">
                      {tempPatient.concernedAreas.join('、')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleGoToRisk}
                    className="flex-1 btn-primary py-3"
                  >
                    进入风险评估
                    <ChevronRight size={18} className="inline ml-1" />
                  </button>
                  <button
                    onClick={handleCloseQrModal}
                    className="px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50"
                  >
                    稍后处理
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 拍照弹窗 */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">拍照确认身份</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden">
              {photoLoading ? (
                <div className="text-center">
                  <Loader2 size={48} className="mx-auto mb-2 text-primary-600 animate-spin" />
                  <p className="text-sm text-neutral-600">正在拍照...</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white border-4 border-dashed border-primary-300 flex items-center justify-center">
                    <User size={48} className="text-primary-300" />
                  </div>
                  <p className="text-neutral-500">请将面部置于框内</p>
                  <div className="absolute inset-4 border-2 border-primary-400/50 rounded-2xl" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={simulatePhotoCapture}
                disabled={photoLoading}
                className="flex-1 py-3 bg-gradient-to-r from-primary-700 to-primary-800 text-white rounded-xl
                         font-medium hover:from-primary-800 hover:to-primary-900 transition-all
                         flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Camera size={18} />
                {photoLoading ? '处理中...' : '确认拍摄'}
              </button>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 证件识别弹窗 */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">证件识别</h3>
              <button
                onClick={() => setShowOcrModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden">
              {ocrLoading ? (
                <div className="text-center">
                  <Loader2 size={48} className="mx-auto mb-2 text-success-600 animate-spin" />
                  <p className="text-sm text-neutral-600">正在识别证件信息...</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-32 h-24 mx-auto mb-4 rounded-xl bg-white border-2 border-dashed border-neutral-300 flex items-center justify-center">
                    <Scan size={40} className="text-neutral-300" />
                  </div>
                  <p className="text-neutral-500">请将身份证正面置于框内</p>
                  <div className="absolute inset-4 border-2 border-success-400/50 rounded-2xl" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={simulateOcrScan}
                disabled={ocrLoading}
                className="flex-1 py-3 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-xl
                         font-medium hover:from-success-600 hover:to-success-700 transition-all
                         flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {ocrLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> 识别中...</>
                ) : (
                  <><Upload size={18} /> 开始识别</>
                )}
              </button>
              <button
                onClick={() => setShowOcrModal(false)}
                className="px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;
