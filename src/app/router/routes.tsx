import { Routes, Route, Navigate } from "react-router-dom";

import { DashboardLayout } from "../layouts/DashboardLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../../auth/pages/LoginPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { PublicLeadPage } from "@/modules/lead/pages/PublicLeadPage";
import { PublicLandingPage } from "@/modules/public/pages/PublicLandingPage";
import { CandidatePage } from "@/modules/candidate/pages/CandidatePage";
import { LeadPage } from "@/modules/lead/pages/LeadPage";
import { FinancePage } from "@/modules/finance/pages/FinancePage";
import { FilesPage } from "../../modules/files/pages/FilesPage";
import { OthersPage } from "../../modules/others/pages/OthersPage";
import { SettingsPage } from "../../modules/settings/pages/SettingsPage";
// function ModulePlaceholder({ title }: { title: string }) {
//   return (
//     <div className="space-y-2">
//       <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
//       <p className="text-sm text-muted-foreground">
//         The {title} module is ready for development.
//       </p>

//       <div className="mt-6 rounded-xl border border-dashed p-10 text-center">
//         <p className="text-sm text-muted-foreground">
//           {title} content will appear here.
//         </p>
//       </div>
//     </div>
//   );
// }

// function LoginPage() {
//   return <ModulePlaceholder title="Login" />;
// }

export function AppRoutes() {
  return (
    <Routes>
      {/* Authentication */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      {/* Public pages - no authentication required */}
      <Route path="/get-started" element={<PublicLeadPage />} />
      <Route path="/" element={<PublicLandingPage />} />
      {/* Protected application */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="lead" element={<LeadPage />} />
          <Route path="candidate" element={<CandidatePage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="others" element={<OthersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Default route */}
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}