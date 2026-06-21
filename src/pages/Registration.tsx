
import { useState } from 'react';
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
  ImagePlus
} from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';
import { Gender } from '@/types';

const Registration = () => {
  const navigate = useNavigate();
  const { addPatient, patients, setCurrentPatient, currentPatient } = usePatientStore();
  
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
    setStep(2);
    setIsNewCustomer(false);
  };

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
      riskLevel: 'low' as const,
      riskFactors: [],
      status: 'registered' as const,
    };

    addPatient(newPatient);
    setStep(3);
  };

  const handleGoToDemand = () => {
    navigate('/demand');
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
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden">
                        {currentPatient?.avatar ? (
                          <img src={currentPatient.avatar} alt="头像" className="w-full h-full object-cover" />
                        ) : (
                          <User size={40} className="text-primary-400" />
                        )}
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg">
                        <Camera size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 text-center mt-2">点击拍照/上传</p>
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
                  <h4 className="font-medium text-neutral-800 mb-3 flex items-center gap-2">
                    <ImagePlus size={18} className="text-primary-600" />
                    身份确认
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-white rounded-xl border border-dashed border-primary-300 text-center hover:border-primary-500 hover:bg-primary-50/50 transition-all">
                      <Camera size={24} className="mx-auto mb-2 text-primary-500" />
                      <p className="text-sm text-neutral-700">拍照确认</p>
                    </button>
                    <button className="p-4 bg-white rounded-xl border border-dashed border-neutral-300 text-center hover:border-neutral-500 hover:bg-neutral-50 transition-all">
                      <Scan size={24} className="mx-auto mb-2 text-neutral-500" />
                      <p className="text-sm text-neutral-700">证件识别</p>
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
                    className="flex-1 btn-primary py-3"
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

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500">姓名</p>
                    <p className="font-medium text-neutral-800">{formData.name || '顾客'}</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500">状态</p>
                    <p className="font-medium text-info-600">待填诉求</p>
                  </div>
                </div>

                <div className="flex gap-4 max-w-md mx-auto">
                  <button
                    onClick={() => setStep(1)}
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
                <span className="text-2xl font-bold text-primary-700">10</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-3 bg-accent-50 rounded-xl">
                  <p className="text-lg font-bold text-accent-600">7</p>
                  <p className="text-xs text-neutral-500">新客</p>
                </div>
                <div className="text-center p-3 bg-info-50 rounded-xl">
                  <p className="text-lg font-bold text-info-600">3</p>
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
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-slide-up">
            <h3 className="text-xl font-semibold text-neutral-800 mb-2 text-center">扫码自助建档</h3>
            <p className="text-sm text-neutral-500 mb-6 text-center">让顾客扫描下方二维码，自助填写信息</p>
            
            <div className="w-64 h-64 mx-auto bg-white border-2 border-neutral-200 rounded-2xl flex items-center justify-center mb-6">
              <div className="text-center">
                <QrCode size={120} className="mx-auto text-primary-800 mb-2" />
                <p className="text-xs text-neutral-400">扫码建档二维码</p>
              </div>
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

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full btn-primary py-3"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;
