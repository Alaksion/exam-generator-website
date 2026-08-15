import { Route, Routes, Navigate } from "react-router-dom";
import { SignInScreen } from "@/components/SignInScreen";
import { useAuth } from "@/lib/auth";
import { UiShell } from "@/components/UiShell";
import { CatalogPage } from "@/pages/Catalog/CatalogPage";
import { GeneratePage } from "@/pages/Generate/GeneratePage";
import { ManagementListPage } from "@/pages/ManageCertification/ManagementListPage";
import { NewCertificationPage } from "@/pages/NewCertification/NewCertificationPage";
import { EditCertificationPage } from "@/pages/EditCertification/EditCertificationPage";
import { ExamStatusPage } from "@/pages/ExamStatus/ExamStatusPage";
import { QuizPage } from "@/pages/Quiz/QuizPage";
import { ReviewPage } from "@/pages/Review/ReviewPage";
import { HistoryPage } from "@/pages/History/HistoryPage";

import type { Role } from "@/lib/types";

function AdminRoute({ role, children }: { role: Role; children: React.ReactNode }) {
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AuthenticatedApp() {
  const role = useUserRole();
  return (
    <Routes>
      <Route element={<UiShell />}>
        <Route index element={<CatalogPage />} />
        <Route path="/certifications/:id" element={<GeneratePage />} />
        <Route path="/exams/:id/status" element={<ExamStatusPage />} />
        <Route path="/exams/:id" element={<QuizPage />} />
        <Route path="/exams/:id/results" element={<ReviewPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route
          path="/manage/certifications"
          element={<AdminRoute role={role}><ManagementListPage /></AdminRoute>}
        />
        <Route
          path="/manage/certifications/new"
          element={<AdminRoute role={role}><NewCertificationPage /></AdminRoute>}
        />
        <Route
          path="/manage/certifications/:id/edit"
          element={<AdminRoute role={role}><EditCertificationPage /></AdminRoute>}
        />
      </Route>
    </Routes>
  );
}

function useUserRole(): Role {
  const { user } = useAuth();
  return user?.role ?? "customer";
}

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <SignInScreen />;
  }

  return <AuthenticatedApp />;
}

export default App;
