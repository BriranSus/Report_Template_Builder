import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TemplateListPage } from './pages/TemplateListPage';
import { BuilderPage } from './pages/BuilderPage';

export default function App() {
  return (
    // Lock entire app to viewport — never taller than screen
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      {/* Content area: sits beside fixed sidebar */}
      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginLeft: 220 }}>
        <Routes>
          <Route path="/" element={<TemplateListPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/builder/:id" element={<BuilderPage />} />
        </Routes>
      </div>
    </div>
  );
}
