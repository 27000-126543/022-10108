
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Shield, 
  Baby, 
  Heart,
  CheckCircle,
  XCircle,
  ChevronRight,
  Info,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';
import { RISK_LABELS } from '@/types';
import { getRiskColor } from '@/utils/format';

const RiskAssessment = () => {
  const navigate = useNavigate();
  const { patients, currentPatient, assessRisk, updatePatient } = usePatientStore();
  
  const [isPregnant, setIsPregnant] = useState(false);
  const [isLactating, setIsLactating] = useState(false);
  const [hasHeartCondition, setHasHeartCondition] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [riskFactors, setRiskFactors] = useState<string[]>([]);

  const selectedPatient = currentPatient || patients.find(p => 
    p.status === 'pending_risk' || p.status === 'pending_demand'
  );

  useEffect(() => {
    if (selectedPatient) {
      setIsPregnant(selectedPatient.isPregnant);
      setIsLactating(selectedPatient.isLactating);
      setRiskLevel(selectedPatient.riskLevel);
      setRiskFactors(selectedPatient.riskFactors);
    }
  }, [selectedPatient]);

  useEffect(() => {
    const factors: string[] = [];
    
    if (isPregnant) factors.push('妊娠期');
    if (isLactating) factors.push('哺乳期');
    if (hasHeartCondition) factors.push('心脏疾病');
    
    if (selectedPatient?.allergies) {
      selectedPatient.allergies.forEach(allergy => {
        if (allergy.severity === 'severe') {
          factors.push(`严重${allergy.substance}过敏`);
        } else if (allergy.severity === 'moderate') {
          factors.push(`${allergy.substance}过敏`);
        }
      });
    }

    setRiskFactors(factors);

    let level: 'low' | 'medium' | 'high' = 'low';
    if (isPregnant || hasHeartCondition) {
      level = 'high';
    } else if (isLactating || selectedPatient?.allergies?.some(a => a.severity === 'severe')) {
      level = 'medium';
    } else if (selectedPatient?.allergies && selectedPatient.allergies.length > 0) {
      level = 'low';
    }

    setRiskLevel(level);
  }, [isPregnant, isLactating, hasHeartCondition, selectedPatient]);

  const handleConfirm = () => {
    if (selectedPatient) {
      updatePatient(selectedPatient.id, {
        isPregnant,
        isLactating: isLactating,
        riskLevel,
        riskFactors,
        status: 'pending_triaging',
      });
      setIsConfirmed(true);
    }
  };

  const handleGoToTriaging = () => {
    if (selectedPatient) {
      assessRisk(selectedPatient.id);
    }
    navigate('/triaging');
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle size={32} className="text-danger-500" />;
      case 'medium':
        return <AlertCircle size={32} className="text-warning-500" />;
      default:
        return <CheckCircle2 size={32} className="text-success-500" />;
    }
  };

  const getRiskBgClass = (level: string) => {
    switch (level) {
      case 'high':
        return 'from-danger-50 to-danger-100 border-danger-200';
      case 'medium':
        return 'from-warning-50 to-warning-100 border-warning-200';
      default:
        return 'from-success-50 to-success-100 border-success-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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
          <div className={`px-4 py-2 rounded-xl border-2 ${getRiskBgClass(riskLevel)}`}>
            <div className="flex items-center gap-2">
              {getRiskIcon(riskLevel)}
              <div>
                <p className="text-xs text-neutral-500">风险等级</p>
                <p className={`font-bold ${riskLevel === 'high' ? 'text-danger-600' : riskLevel === 'medium' ? 'text-warning-600' : 'text-success-600'}`}>
                  {RISK_LABELS[riskLevel]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：禁忌项检查 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 特殊时期 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Baby size={20} className="text-primary-600" />
              特殊时期
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsPregnant(!isPregnant)}
                className={`p-5 rounded-2xl border-2 transition-all text-left ${
                  isPregnant
                    ? 'border-danger-400 bg-danger-50 shadow-lg'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isPregnant ? 'bg-danger-500 text-white' : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    <Baby size={20} />
                  </div>
                  <div>
                    <p className={`font-medium ${isPregnant ? 'text-danger-700' : 'text-neutral-700'}`}>
                      妊娠期
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">是否怀孕中</p>
                  </div>
                  {isPregnant && (
                    <CheckCircle size={18} className="text-danger-500 ml-auto" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setIsLactating(!isLactating)}
                className={`p-5 rounded-2xl border-2 transition-all text-left ${
                  isLactating
                    ? 'border-warning-400 bg-warning-50 shadow-lg'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isLactating ? 'bg-warning-500 text-white' : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    <Heart size={20} />
                  </div>
                  <div>
                    <p className={`font-medium ${isLactating ? 'text-warning-700' : 'text-neutral-700'}`}>
                      哺乳期
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">是否正在哺乳</p>
                  </div>
                  {isLactating && (
                    <CheckCircle size={18} className="text-warning-500 ml-auto" />
                  )}
                </div>
              </button>
            </div>

            {(isPregnant || isLactating) && (
              <div className="mt-4 p-4 bg-danger-50 rounded-xl border border-danger-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-danger-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-danger-800">重要提示</p>
                    <p className="text-sm text-danger-600 mt-1">
                      {isPregnant && '妊娠期顾客应避免大部分医美项目，建议分娩后再进行。'}
                      {isLactating && '哺乳期顾客部分项目需谨慎，建议咨询医生后决定。'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 过敏史 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-warning-500" />
              过敏史
            </h3>

            {!selectedPatient?.allergies || selectedPatient.allergies.length === 0 ? (
              <div className="py-8 text-center text-neutral-400">
                <CheckCircle size={40} className="mx-auto mb-2 text-success-400" />
                <p>暂无过敏记录</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedPatient.allergies.map((allergy) => (
                  <div
                    key={allergy.id}
                    className={`p-4 rounded-xl flex items-center gap-3 ${
                      allergy.severity === 'severe'
                        ? 'bg-danger-50 border border-danger-200'
                        : allergy.severity === 'moderate'
                        ? 'bg-warning-50 border border-warning-200'
                        : 'bg-neutral-50 border border-neutral-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      allergy.severity === 'severe'
                        ? 'bg-danger-500 text-white'
                        : allergy.severity === 'moderate'
                        ? 'bg-warning-500 text-white'
                        : 'bg-neutral-400 text-white'
                    }`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">{allergy.substance}</p>
                      <p className="text-xs text-neutral-500">
                        {allergy.severity === 'severe' ? '严重过敏' : allergy.severity === 'moderate' ? '中度过敏' : '轻微过敏'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      allergy.severity === 'severe'
                        ? 'bg-danger-500 text-white'
                        : allergy.severity === 'moderate'
                        ? 'bg-warning-500 text-white'
                        : 'bg-neutral-400 text-white'
                    }`}>
                      {allergy.severity === 'severe' ? '高危' : allergy.severity === 'moderate' ? '中危' : '低危'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 其他禁忌 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-info-500" />
              其他健康问题
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setHasHeartCondition(!hasHeartCondition)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  hasHeartCondition
                    ? 'border-danger-400 bg-danger-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart size={20} className={hasHeartCondition ? 'text-danger-500' : 'text-neutral-400'} />
                  <span className={`font-medium ${hasHeartCondition ? 'text-danger-700' : 'text-neutral-700'}`}>
                    心脏疾病
                  </span>
                </div>
              </button>

              <button className="p-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 transition-all text-left">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-neutral-400" />
                  <span className="font-medium text-neutral-700">高血压</span>
                </div>
              </button>

              <button className="p-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 transition-all text-left">
                <div className="flex items-center gap-3">
                  <Info size={20} className="text-neutral-400" />
                  <span className="font-medium text-neutral-700">糖尿病</span>
                </div>
              </button>

              <button className="p-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 transition-all text-left">
                <div className="flex items-center gap-3">
                  <Info size={20} className="text-neutral-400" />
                  <span className="font-medium text-neutral-700">疤痕体质</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：风险评估结果 */}
        <div className="space-y-6">
          {/* 风险概览 */}
          <div className={`card bg-gradient-to-br ${getRiskBgClass(riskLevel)} border-2`}>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">风险评估结果</h3>
            
            <div className="text-center py-4">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                riskLevel === 'high' ? 'bg-danger-500' : riskLevel === 'medium' ? 'bg-warning-500' : 'bg-success-500'
              }`}>
                {getRiskIcon(riskLevel)}
              </div>
              <p className={`text-2xl font-bold ${
                riskLevel === 'high' ? 'text-danger-700' : riskLevel === 'medium' ? 'text-warning-700' : 'text-success-700'
              }`}>
                {RISK_LABELS[riskLevel]}
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                {riskFactors.length} 项风险因素
              </p>
            </div>

            {riskFactors.length > 0 && (
              <div className="space-y-2 mt-4">
                {riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <XCircle size={14} className={
                      riskLevel === 'high' ? 'text-danger-500' : riskLevel === 'medium' ? 'text-warning-500' : 'text-success-500'
                    } />
                    <span className="text-neutral-700">{factor}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 处理建议 */}
          <div className="card">
            <h4 className="font-medium text-neutral-800 mb-3">处理建议</h4>
            <div className="space-y-2 text-sm text-neutral-600">
              {riskLevel === 'high' && (
                <>
                  <p>• 建议暂缓医美项目</p>
                  <p>• 需医生进行详细评估</p>
                  <p>• 充分告知风险并签署知情同意书</p>
                  <p>• 建议咨询相关专科医生</p>
                </>
              )}
              {riskLevel === 'medium' && (
                <>
                  <p>• 谨慎选择项目类型</p>
                  <p>• 需告知顾客相关风险</p>
                  <p>• 建议选择低风险项目</p>
                  <p>• 术中术后密切观察</p>
                </>
              )}
              {riskLevel === 'low' && (
                <>
                  <p>• 可正常进行医美项目</p>
                  <p>• 按标准流程操作即可</p>
                  <p>• 术前常规告知注意事项</p>
                </>
              )}
            </div>
          </div>

          {/* 护士确认 */}
          {!isConfirmed ? (
            <button
              onClick={handleConfirm}
              className="w-full btn-primary py-4 text-lg"
            >
              确认风险评估
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-success-50 rounded-xl border border-success-200 text-center">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-success-500" />
                <p className="font-medium text-success-700">已确认风险评估</p>
              </div>
              <button
                onClick={handleGoToTriaging}
                className="w-full btn-accent py-4 text-lg"
              >
                进入科室分诊
                <ChevronRight size={20} className="inline ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;
