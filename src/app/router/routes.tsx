
import { Routes, Route, Navigate } from "react-router-dom";

// Admin Layouts and Authentication
import { DashboardLayout } from "../layouts/DashboardLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../../auth/pages/LoginPage";

// Public Pages
import { PublicLeadPage } from "@/modules/lead/pages/PublicLeadPage";
import { PublicLandingPage } from "@/modules/public/pages/PublicLandingPage/PublicLandingPage";
import { ComingSoonPage } from "@/modules/public/pages/UnderConstructionPage";

// Admin Pages
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { CandidatePage } from "@/modules/candidate/pages/CandidatePage";
import { CandidateProfilePage } from "@/modules/candidate/pages/CandidateProfilePage";
import { LeadPage } from "@/modules/lead/pages/LeadPage";
import { FinancePage } from "@/modules/finance/pages/FinancePage";
import { FilesPage } from "@/modules/files/pages/FilesPage";
import { OthersPage } from "@/modules/others/pages/OthersPage";
import { SettingsPage } from "@/modules/settings/pages/SettingsPage";
import { DraftPage } from "@/modules/candidate/pages/DraftPage";

// Admin Testing Pages
import { CandidateDatabaseTestPage } from "@/modules/candidate/pages/CandidateDatabaseTestPage";
import { CandidateEducationTestPage } from "@/modules/candidate/pages/CandidateEducationTestPage";
import { CandidateLanguageTestsPage } from "@/modules/candidate/pages/CandidateLanguageTestsPage";

// Student Portal
import { StudentLayout } from "@/portal/layouts/StudentLayout";
import { StudentProtectedRoute } from "@/portal/router/StudentProtectedRoute";
import { StudentLoginPage } from "@/portal/pages/LoginPage";
import { ProfilePage } from "@/portal/pages/ProfilePage";
import { DocumentsPage } from "@/portal/pages/DocumentsPage";

export function AppRoutes() {
  return (
    <Routes>

      {/* ========================================
          PUBLIC PAGES
      ======================================== */}

      <Route path="/" element={<ComingSoonPage />} />

      <Route
        path="/home-page"
        element={<PublicLandingPage />}
      />

      <Route
        path="/get-started"
        element={<PublicLeadPage />}
      />


      {/* ========================================
          ADMIN AUTHENTICATION
      ======================================== */}

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>


      {/* ========================================
          ADMIN PANEL
      ======================================== */}

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardLayout />}>

          <Route index element={<DashboardPage />} />

          <Route
            path="lead"
            element={<LeadPage />}
          />

          <Route
            path="drafts"
            element={<DraftPage />}
          />

          <Route
            path="candidate"
            element={<CandidatePage />}
          />

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

          <Route
            path="finance"
            element={<FinancePage />}
          />

          <Route
            path="files"
            element={<FilesPage />}
          />

          <Route
            path="others"
            element={<OthersPage />}
          />

          <Route
            path="settings"
            element={<SettingsPage />}
          />

        </Route>
      </Route>


      {/* ========================================
          STUDENT AUTHENTICATION
      ======================================== */}

      <Route
        path="/portal/login"
        element={<StudentLoginPage />}
      />


      {/* ========================================
          STUDENT PORTAL
      ======================================== */}

      <Route element={<StudentProtectedRoute />}>
        <Route path="/portal" element={<StudentLayout />}>

          {/* Default student page */}
          <Route
            index
            element={<Navigate to="/portal/profile" replace />}
          />

          {/* My Profile */}
          <Route
            path="profile"
            element={<ProfilePage />}
          />

          {/* Documents */}
          <Route
            path="documents"
            element={<DocumentsPage />}
          />

          {/* Redirect removed or unknown portal pages */}
          <Route
            path="*"
            element={<Navigate to="/portal/profile" replace />}
          />

        </Route>
      </Route>


      {/* ========================================
          DEFAULT FALLBACK
      ======================================== */}

      <Route
        path="*"
        element={<Navigate to="/portal/login" replace />}
      />

    </Routes>
  );
}
