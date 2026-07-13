import { motion } from 'framer-motion';
import { Activity, MessageSquare, Zap, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Conversations', value: '124', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Automations Run', value: '45', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Time Saved', value: '12h', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-4xl font-bold tracking-tight text-textMain">Welcome back, Karthi</h1>
          <p className="text-textMuted text-lg">Here's what's happening in your OmniAI workspace today.</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-6 flex items-start justify-between hover:border-textMuted/30 transition-colors">
              <div>
                <p className="text-textMuted font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-textMain">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-8 relative overflow-hidden group cursor-pointer hover:border-primary/40 transition-all"
            onClick={() => navigate('/chat')}
          >
            <div className="relative z-10">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-textMain mb-2">New Chat</h2>
              <p className="text-textMuted max-w-sm mb-6">
                Start a new conversation with OmniAI. Analyze documents, write code, or just brainstorm ideas.
              </p>
              <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                Start chatting <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface border border-border rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-textMain">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <MessageSquare className="w-5 h-5 text-textMuted group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 truncate">
                    <h4 className="text-textMain font-medium truncate group-hover:text-primary transition-colors">Analysis of Q3 Financial Report</h4>
                    <p className="text-textMuted text-sm">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
