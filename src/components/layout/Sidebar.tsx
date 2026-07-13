import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Workflow, FolderOpen, Settings, PanelLeftClose, PanelLeft, Bot } from 'lucide-react';
import useAppStore from '../../stores/useAppStore';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: Workflow, label: 'Automation', path: '/automation' },
  { icon: FolderOpen, label: 'Files', path: '/files' },
];

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <motion.aside
      animate={{ width: isSidebarOpen ? 260 : 80 }}
      className="h-screen bg-surface border-r border-border flex flex-col transition-all duration-300 relative z-20"
    >
      <div className="flex items-center justify-between p-4 mb-4">
        <div className="flex items-center gap-3 overflow-hidden" title="OmniAI">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-xl text-textMain tracking-tight whitespace-nowrap"
              >
                OmniAI
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/5 text-textMuted hover:text-textMain transition-colors hidden md:block absolute -right-4 top-6 bg-surface border border-border z-30"
          title="Toggle Sidebar"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group overflow-hidden",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/25" 
                  : "text-textMuted hover:bg-white/5 hover:text-textMain"
              )
            }
            title={!isSidebarOpen ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 mt-auto">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group overflow-hidden",
              isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/25" 
                : "text-textMuted hover:bg-white/5 hover:text-textMain"
            )
          }
          title={!isSidebarOpen ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </div>
    </motion.aside>
  );
}
