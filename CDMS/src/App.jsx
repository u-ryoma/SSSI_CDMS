import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Logs from "./pages/SystemActivity";

import "./App.css";
import "./style.css";
import Login from "./login/login.jsx";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Customer from "./pages/Customer";
import JobList from "./pages/JobList";
import AccountSettings from "./pages/AccountSettings.jsx";
import AssetMonitoring from "./pages/AssetMonitoring";
import ConcernIncoming from "./pages/ConcernIncoming";
import ConcernOut from "./pages/ConcernOut";
import DeliveryReceipt from "./pages/DeliveryReceipt";
import ForCheckingOIC from "./pages/ForCheckingOIC";
import ForCheckingSig from "./pages/ForCheckingSig";
import ForTyping from "./pages/ForTyping";
import IncomingCalib from "./pages/IncomingCalib";
import InstrumentTag from "./pages/InstrumentTag";
import JobReceipt from "./pages/jobreceipt/index";
import Monitoring from "./pages/Monitoring";
import OnGoingCalib from "./pages/OnGoingCalib";
import OnHoldList from "./pages/OnHoldList";
import PrintAgreement from "./pages/PrintAgreement";
import PrintFinal from "./pages/PrintFinal";
import QtnForCheck from "./pages/QtnForCheck";
import QtnForFile from "./pages/QtnForFile";
import QtnForFollowUp from "./pages/QtnForFollowUp";
import QtnList from "./pages/QtnList";
import RecallSys from "./pages/RecallSys";
import SchedMonitor from "./pages/SchedMonitor";
import SiteCalibration from "./pages/SiteCalibration";
import StandardForCalib from "./pages/StandardForCalib";
import StdForCertification from "./pages/StdForCertification";
import StdForUpdate from "./pages/StdForUpdate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={
              <ProtectedRoute allowedRoles={["admin", "owner"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="customer" element={<Customer />} />
          <Route path="joblist" element={<JobList />} />
          <Route
            path="accounts"
            element={
              <ProtectedRoute allowedRoles={["owner", "admin"]}>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route path="assetmonitoring" element={<AssetMonitoring />} />
          <Route path="concernincoming" element={<ConcernIncoming />} />
          <Route path="concernout" element={<ConcernOut />} />
          <Route path="deliveryreceipt" element={<DeliveryReceipt />} />
          <Route path="forcheckingic" element={<ForCheckingOIC />} />
          <Route path="forcheckingsig" element={<ForCheckingSig />} />
          <Route path="fortyping" element={<ForTyping />} />
          <Route path="incomingcalib" element={<IncomingCalib />} />
          <Route path="instrumenttag" element={<InstrumentTag />} />
          <Route path="jobreceipt" element={<JobReceipt />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="ongoinggcalib" element={<OnGoingCalib />} />
          <Route path="onholdlist" element={<OnHoldList />} />
          <Route path="printagreement" element={<PrintAgreement />} />
          <Route path="printfinal" element={<PrintFinal />} />
          <Route path="qtnforcheck" element={<QtnForCheck />} />
          <Route path="qtnforfile" element={<QtnForFile />} />
          <Route path="qtnforfolowup" element={<QtnForFollowUp />} />
          <Route path="qtnlist" element={<QtnList />} />
          <Route path="recallsys" element={<RecallSys />} />
          <Route path="schedmonitor" element={<SchedMonitor />} />
          <Route path="sitecalibration" element={<SiteCalibration />} />
          <Route path="standardforcalib" element={<StandardForCalib />} />
          <Route path="stdforcertification" element={<StdForCertification />} />
          <Route path="stdforupdate" element={<StdForUpdate />} />
          <Route
            path="systemactivity"
            element={
              <ProtectedRoute allowedRoles={["owner", "admin"]}>
                <Logs />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
