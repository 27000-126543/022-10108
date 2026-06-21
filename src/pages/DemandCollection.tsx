
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  DollarSign, 
  History, 
  AlertTriangle,
  Plus,
  Trash2,
  ChevronRight,
  Check,
  Star,
  Sparkles
} from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';
import { CONCERNED_AREAS, BUDGET_RANGES, ALLERGY_SUBSTANCES, COMMON_PROCEDURES } from '@/types';
import { AllergySeverity, EffectRating } from '@/types';

const DemandCollection = () => {
  const navigate = useNavigate();
  const { patients, currentPatient, updatePatientDemand, setCurrentPatient } = usePatientStore();
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(currentPatient?.concernedAreas || []);
  const [selectedBudget, setSelectedBudget] = useState(currentPatient?.budgetRange || '');
  const [medicalHistory, setMedicalHistory] = useState(currentPatient?.medicalHistory || []);
  const [allergies, setAllergies] = useState(currentPatient?.allergies || []);
  const [newProcedure, setNewProcedure] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newEffect, setNewEffect] = useState<EffectRating>('good');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    currentPatient?.allergies?.map(a => a.substance) || []
  );

  const tabs = [
    { id: 0, title: '关注部位', icon: <Sparkles size={18} /> },
    { id: 1, title: '预算区间', icon: <DollarSign size={18} /> },
    { id: 2, title: '医美史', icon: <History size={18} /> },
    { id: 3, title: '过敏史', icon: <AlertTriangle size={18} /> },
  ];

  const selectedPatient = currentPatient || patients.find(p => p.status === 'registered' || p.status === 'pending_demand');

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleAddHistory = () => {
    if (!newProcedure) return;
    const newItem = {
      id: `mh-${Date.now()}`,
      procedure: newProcedure,
      institution: newInstitution,
      date: newDate,
      effect: newEffect,
    };
    setMedicalHistory([...medicalHistory, newItem]);
    setNewProcedure('');
    setNewInstitution('');
    setNewDate('');
  };

  const handleRemoveHistory = (id: string) => {
    setMedicalHistory(medicalHistory.filter(h => h.id !== id));
  };

  const handleAllergyToggle = (substance: string) => {
    setSelectedAllergies(prev => 
      prev.includes(substance)
        ? prev.filter(a => a !== substance)
        : [...prev, substance]
    );
  };

  const handleSaveAndNext = () => {
    const allergyList = selectedAllergies.map(substance => ({
      id: `al-${Date.now()}-${substance}`,
      substance,
      severity: 'mild' as AllergySeverity,
    }));

    if (selectedPatient) {
      updatePatientDemand(selectedPatient.id, {
        concernedAreas: selectedAreas,
        budgetRange: selectedBudget,
        medicalHistory,
        allergies: allergyList,
      });
    }
    
    navigate('/risk');
  };

  const effectLabels: Record<EffectRating, { label: string; color: string }> = {
    good: { label: '效果好', color: 'text-success-600 bg-success-50' },
    average: { label: '一般', color: 'text-warning-600 bg-warning-50' },
    poor: { label: '效果差', color: 'text-danger-600 bg-danger-50' },
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 顾客信息栏 */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          {selectedPatient?.avatar ? (
            <img src={selectedPatient.avatar} alt="" className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-medium">
              {selectedPatient?.name?.charAt(0) || '顾'}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neutral-800">
              {selectedPatient?.name || '未选择顾客'}
            </h2>
            <p className="text-sm text-neutral-500">
              {selectedPatient?.phone} · {selectedPatient?.age}岁 · {selectedPatient?.gender === 'female' ? '女' : '男'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">当前进度</p>
            <p className="font-medium text-accent-600">诉求采集中</p>
          </div>
        </div>
      </div>

      {/* 选项卡 */}
      <div className="card mb-6">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-800 to-primary-900 text-white shadow-card'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tab.icon}
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="card mb-6 min-h-[400px]">
        {activeTab === 0 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">选择关注部位</h3>
            <p className="text-sm text-neutral-500 mb-6">可多选，选择顾客想要改善的部位</p>
            
            <div className="flex flex-wrap gap-2">
              {CONCERNED_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => handleAreaToggle(area)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedAreas.includes(area)
                      ? 'bg-gradient-to-r from-accent-400 to-accent-500 text-white shadow-glow'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {selectedAreas.includes(area) && <Check size={14} className="inline mr-1" />}
                  {area}
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-accent-50 rounded-xl">
              <p className="text-sm text-accent-700">
                已选择 <span className="font-bold">{selectedAreas.length}</span> 个关注部位
              </p>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">预算区间</h3>
            <p className="text-sm text-neutral-500 mb-6">选择顾客的预计预算范围</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BUDGET_RANGES.map((budget) => (
                <button
                  key={budget}
                  onClick={() => setSelectedBudget(budget)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    selectedBudget === budget
                      ? 'border-accent-400 bg-accent-50 shadow-glow'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <DollarSign 
                    size={24} 
                    className={`mx-auto mb-2 ${
                      selectedBudget === budget ? 'text-accent-500' : 'text-neutral-400'
                    }`} 
                  />
                  <p className={`font-medium ${
                    selectedBudget === budget ? 'text-accent-700' : 'text-neutral-700'
                  }`}>
                    {budget}
                  </p>
                </button>
              ))}
            </div>

            {selectedBudget && (
              <div className="mt-6 p-4 bg-success-50 rounded-xl">
                <p className="text-sm text-success-700">
                  已选择预算：<span className="font-bold">{selectedBudget}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">过往医美史</h3>
            <p className="text-sm text-neutral-500 mb-6">记录顾客之前做过的医美项目</p>

            {/* 添加新记录 */}
            <div className="p-5 bg-neutral-50 rounded-2xl mb-6">
              <h4 className="font-medium text-neutral-700 mb-4">添加历史记录</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">项目</label>
                  <select
                    value={newProcedure}
                    onChange={(e) => setNewProcedure(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">选择项目</option>
                    {COMMON_PROCEDURES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">机构</label>
                  <input
                    type="text"
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    placeholder="医疗机构"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">时间</label>
                  <input
                    type="month"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">效果</label>
                  <select
                    value={newEffect}
                    onChange={(e) => setNewEffect(e.target.value as EffectRating)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="good">效果好</option>
                    <option value="average">一般</option>
                    <option value="poor">效果差</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleAddHistory}
                disabled={!newProcedure}
                className="btn-primary py-2 text-sm"
              >
                <Plus size={16} className="inline mr-1" />
                添加记录
              </button>
            </div>

            {/* 历史记录列表 */}
            {medicalHistory.length === 0 ? (
              <div className="py-12 text-center text-neutral-400">
                <History size={40} className="mx-auto mb-2" />
                <p>暂无医美历史记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-xl
                             hover:border-primary-200 transition-all"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Star size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-800">{item.procedure}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${effectLabels[item.effect].color}`}>
                          {effectLabels[item.effect].label}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        {item.institution || '未填机构'} · {item.date || '未填时间'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveHistory(item.id)}
                      className="p-2 text-neutral-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">过敏史</h3>
            <p className="text-sm text-neutral-500 mb-6">选择顾客已知的过敏物质</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {ALLERGY_SUBSTANCES.map((substance) => (
                <button
                  key={substance}
                  onClick={() => handleAllergyToggle(substance)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedAllergies.includes(substance)
                      ? 'bg-gradient-to-r from-danger-400 to-danger-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {selectedAllergies.includes(substance) && <Check size={14} className="inline mr-1" />}
                  {substance}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-warning-200 bg-warning-50/50">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-warning-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning-800">温馨提示</p>
                  <p className="text-sm text-warning-600 mt-1">
                    过敏史是重要的安全评估依据，请务必准确填写。如有其他过敏物质，请在备注中说明。
                  </p>
                </div>
              </div>
            </div>

            {selectedAllergies.length > 0 && (
              <div className="mt-6 p-4 bg-danger-50 rounded-xl">
                <p className="text-sm text-danger-700">
                  已记录 <span className="font-bold">{selectedAllergies.length}</span> 项过敏史
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/registration')}
          className="px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-all"
        >
          返回登记
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
            disabled={activeTab === 0}
            className="px-6 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-all disabled:opacity-50"
          >
            上一步
          </button>
          <button
            onClick={handleSaveAndNext}
            className="btn-primary py-3 px-8"
          >
            下一步：风险评估
            <ChevronRight size={18} className="inline ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemandCollection;
