import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import useAppStore from './stores/useAppStore';
import { useEffect } from 'react';

function App() {
  const { isDarkMode } = useAppStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="automation" element={<div className="p-8"><h1 className="text-2xl font-bold">Automation</h1><p className="mt-4 text-textMuted">Coming soon...</p></div>} />
          <Route path="files" element={<div className="p-8"><h1 className="text-2xl font-bold">Files</h1><p className="mt-4 text-textMuted">Coming soon...</p></div>} />
          <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings</h1><p className="mt-4 text-textMuted">Coming soon...</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
