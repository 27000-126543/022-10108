
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Registration from "@/pages/Registration";
import DemandCollection from "@/pages/DemandCollection";
import RiskAssessment from "@/pages/RiskAssessment";
import DepartmentTriaging from "@/pages/DepartmentTriaging";
import WaitingQueue from "@/pages/WaitingQueue";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout title="导诊看板" subtitle="初诊分诊工作台">
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/registration"
          element={
            <MainLayout title="到院登记" subtitle="新客建档 · 老客复诊">
              <Registration />
            </MainLayout>
          }
        />
        <Route
          path="/demand"
          element={
            <MainLayout title="诉求采集" subtitle="关注部位 · 预算 · 医美史">
              <DemandCollection />
            </MainLayout>
          }
        />
        <Route
          path="/risk"
          element={
            <MainLayout title="风险提示" subtitle="禁忌检查 · 风险评估">
              <RiskAssessment />
            </MainLayout>
          }
        />
        <Route
          path="/triaging"
          element={
            <MainLayout title="科室分流" subtitle="智能分诊 · 医生匹配">
              <DepartmentTriaging />
            </MainLayout>
          }
        />
        <Route
          path="/queue"
          element={
            <MainLayout title="候诊队列" subtitle="实时叫号 · 面诊管理">
              <WaitingQueue />
            </MainLayout>
          }
        />
        <Route
          path="*"
          element={
            <MainLayout title="页面未找到" subtitle="404">
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-6xl font-bold text-neutral-200 mb-4">404</p>
                <p className="text-lg text-neutral-500">页面不存在或已移动</p>
              </div>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}
