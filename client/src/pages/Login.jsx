import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
  const { loginUser, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { toast.error('Please enter both email and password'); return; }
    setSubmitting(true);
    const result = await loginUser(formData.email, formData.password);
    setSubmitting(false);
    if (result?.success) {
      toast.success('Welcome back to TraceBack! 👋');
      navigate('/dashboard');
    } else {
      toast.error(result?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {/* Glow blob */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-8 sm:p-10 rounded-3xl glass-panel space-y-7 shadow-2xl border border-slate-200/50 dark:border-slate-800/50">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4">
              <LogIn className="w-7 h-7 text-sky-500" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-xs text-slate-400">Sign in to your TraceBack account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-500">Campus Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email" name="email" value={formData.email}
                  onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
                  placeholder="email@cuchd.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-500">Password</label>
                <Link to="/forgot-password" className="text-xs text-sky-500 hover:text-sky-600 font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                  onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 text-sm mt-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {submitting ? 'Signing in…' : 'Sign In'}
              {!submitting && <ArrowRight className="w-4 h-4 ml-auto" />}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 border-t border-slate-100/60 dark:border-slate-800/60 pt-5">
            New to TraceBack?{' '}
            <Link to="/register" className="text-sky-500 font-semibold hover:underline">Create an account</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
