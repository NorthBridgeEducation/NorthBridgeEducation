import { Routes, Route, Navigate } from "react-router-dom";

import { DashboardLayout } from "../layouts/DashboardLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../../auth/pages/LoginPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { PublicLeadPage } from "@/modules/lead/pages/PublicLeadPage";
// import { PublicLandingPage } from "@/modules/public/pages/PublicLandingPage";
import { ComingSoonPage } from "@/modules/public/pages/UnderConstructionPage";
import { CandidatePage } from "@/modules/candidate/pages/CandidatePage";
import { LeadPage } from "@/modules/lead/pages/LeadPage";
import { FinancePage } from "@/modules/finance/pages/FinancePage";
import { FilesPage } from "../../modules/files/pages/FilesPage";
import { OthersPage } from "../../modules/others/pages/OthersPage";
import { SettingsPage } from "../../modules/settings/pages/SettingsPage";
import { CandidateProfilePage } from "@/modules/candidate/pages/CandidateProfilePage";

// testing
import { DraftPage } from "@/modules/candidate/pages/DraftPage";
import { CandidateDatabaseTestPage } from "@/modules/candidate/pages/CandidateDatabaseTestPage";
import { CandidateEducationTestPage } from "@/modules/candidate/pages/CandidateEducationTestPage";
import { CandidateLanguageTestsPage } from "@/modules/candidate/pages/CandidateLanguageTestsPage";
import { LanguageTestsPage } from "@/portal/pages/LanguageTestsPage";
// Student Portal
import { StudentLayout } from "@/portal/layouts/StudentLayout";
import { StudentProtectedRoute } from "@/portal/router/StudentProtectedRoute";
import { StudentLoginPage } from "@/portal/pages/LoginPage";
import { ProfilePage } from "@/portal/pages/ProfilePage";
import { ApplicationPage } from "@/portal/pages/ApplicationPage";
import { DocumentsPage } from "@/portal/pages/DocumentsPage";
import { PaymentsPage } from "@/portal/pages/PaymentsPage";
import { NotificationsPage } from "@/portal/pages/NotificationsPage";
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
      {/* <Route path="/" element={<PublicLandingPage />} /> */}
      <Route path="/" element={<ComingSoonPage/>} />
      {/* Protected application */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="lead" element={<LeadPage />} />
          <Route path="drafts" element={<DraftPage />} />
          <Route path="candidate" element={<CandidatePage />} />
          <Route
             path="candidate/:candidateId"
             element={<CandidateProfilePage />}
          />
          <Route
            path="candidate-database-test"
            element={<CandidateDatabaseTestPage />}
          />
          <Route
            path="candidate-education-test"
            element={<CandidateEducationTestPage />}
          />

          <Route
            path="candidate-language-tests"
            element={<CandidateLanguageTestsPage />}
          />

          <Route path="finance" element={<FinancePage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="others" element={<OthersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
     
      {/* Student authentication */}
      <Route path="/portal/login" element={<StudentLoginPage />} />

      {/* Student application */}
      <Route element={<StudentProtectedRoute />}>
        <Route path="/portal" element={<StudentLayout />}>
          <Route
            index
            element={<Navigate to="/portal/profile" replace />}
          />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="application" element={<ApplicationPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="language-tests" element={<LanguageTestsPage />} />
        </Route>
      </Route>


      {/* Default route */}
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}