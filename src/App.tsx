import { Route, Routes } from "react-router-dom";
import { ApiKeyGate } from "@/components/ApiKeyGate";
import { useAuth } from "@/lib/auth";
import { UiShell } from "@/components/UiShell";
import { CatalogPage } from "@/pages/Catalog/CatalogPage";
import { ManagementListPage } from "@/pages/ManageCertification/ManagementListPage";
import { NewCertificationPage } from "@/pages/NewCertification/NewCertificationPage";
import { ExamStatusPage } from "@/pages/ExamStatus/ExamStatusPage";
import { QuizPage } from "@/pages/Quiz/QuizPage";
import { ReviewPage } from "@/pages/Review/ReviewPage";
import { HistoryPage } from "@/pages/History/HistoryPage";

function AuthenticatedApp() {
  return (
    <Routes>
      <Route element={<UiShell />}>
        <Route index element={<CatalogPage />} />
        <Route path="/exams/:id/status" element={<ExamStatusPage />} />
        <Route path="/exams/:id" element={<QuizPage />} />
        <Route path="/exams/:id/results" element={<ReviewPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/manage/certifications" element={<ManagementListPage />} />
        <Route
          path="/manage/certifications/new"
          element={<NewCertificationPage />}
        />
      </Route>
    </Routes>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <ApiKeyGate />;
  }

  return <AuthenticatedApp />;
}

export default App;
