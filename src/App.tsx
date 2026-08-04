import { Route, Routes } from "react-router-dom";
import { ApiKeyGate } from "@/components/ApiKeyGate";
import { useAuth } from "@/lib/auth";
import { UiShell } from "@/components/UiShell";
import { CatalogPage } from "@/pages/Catalog/CatalogPage";
import { ManagementListPage } from "@/pages/ManageCertification/ManagementListPage";
import { NewCertificationPage } from "@/pages/NewCertification/NewCertificationPage";
import { ExamStatusPage } from "@/pages/ExamStatus/ExamStatusPage";

function AuthenticatedApp() {
  return (
    <Routes>
      <Route element={<UiShell />}>
        <Route index element={<CatalogPage />} />
        <Route path="/exams/:id/status" element={<ExamStatusPage />} />
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
