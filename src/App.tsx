import { Route, Routes, Navigate } from "react-router-dom";
import { SignInPage } from "@/pages/SignIn/SignInPage";
import { SignUpPage } from "@/pages/SignUp/SignUpPage";
import { ForgotPasswordPage } from "@/pages/ForgotPassword/ForgotPasswordPage";
import { AuthCallbackPage } from "@/pages/AuthCallback/AuthCallbackPage";
import { LandingPage } from "@/pages/Landing/LandingPage";
import { getAuthConfig } from "@/lib/auth-config";
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
  const { user } = useAuth();

  // Identity (and therefore role) resolves asynchronously after login / reload.
  // Render a placeholder until the user is loaded so an admin is not
  // transiently redirected away from /manage/* by a defaulted "customer" role.
  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  const role = user.role;
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

function AuthCenter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {children}
    </div>
  );
}

function AuthApp() {
  const { callbackPath } = getAuthConfig();
  return (
    <Routes>
      <Route index element={<LandingPage />} />
      <Route
        element={
          <AuthCenter>
            <Routes>
              <Route path="sign-in" element={<SignInPage />} />
              <Route path="sign-up" element={<SignUpPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path={callbackPath} element={<AuthCallbackPage />} />
            </Routes>
          </AuthCenter>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthApp />;
  }

  return <AuthenticatedApp />;
}

export default App;
