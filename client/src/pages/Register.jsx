import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Phone, UserCheck, Loader2, ArrowLeft, Key, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';

const ROLES = ['Student','Teacher','Security Guard','Warden'];

const InputField = ({ label, icon: Icon, type = 'text', name, value, onChange, placeholder, required, children }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5 text-slate-500">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      {children ? children : (
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500 transition-all"
          required={required} />
      )}
    </div>
  </div>
);

const Register = () => {
  const { registerUser, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name:'',email:'',password:'',contactNumber:'',role:'Student' });
  const [submitting, setSubmitting] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name,email,password,contactNumber } = formData;
    if (!name||!email||!password||!contactNumber) { toast.error('Please fill all required fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/auth/send-otp', { email });
      if (res.data.success) {
        setServerOtp(res.data.otp);
        setShowOtpScreen(true);
        toast.success('Verification code sent to your email! 📧');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send verification code'); }
    finally { setSubmitting(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) { toast.error('Please enter the verification code'); return; }
    setSubmitting(true);
    try {
      const verifyRes = await axios.post('/api/auth/verify-otp', { email: formData.email, code: otpCode });
      if (verifyRes.data.success) {
        const result = await registerUser(formData);
        if (result?.success) {
          toast.success('Account created! Welcome to TraceBack 🎉');
          navigate('/dashboard');
        } else { toast.error(result?.message || 'Registration failed'); }
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid or expired OTP code'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-8 sm:p-10 rounded-3xl glass-panel shadow-2xl border border-slate-200/50 dark:border-slate-800/50">
          <AnimatePresence mode="wait">
            {!showOtpScreen ? (
              <motion.div key="register" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }} className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                    <User className="w-7 h-7 text-indigo-500" />
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight">Create Account</h1>
                  <p className="text-xs text-slate-400">Join the CU Lost &amp; Found Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <InputField label="Full Name *" icon={User} name="name" value={formData.name} onChange={handleChange} placeholder="Riya Garg" required />
                  <InputField label="Campus Email *" icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@cuchd.in" required />
                  <InputField label="Contact Number *" icon={Phone} name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="9876543210" required />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-slate-500">Role *</label>
                      <div className="relative">
                        <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select name="role" value={formData.role} onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500 transition-all appearance-none" required>
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-slate-500">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500 transition-all" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 mt-2">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {submitting ? 'Sending Code…' : 'Continue'}
                  </button>
                </form>

                <div className="text-center text-xs text-slate-400 border-t border-slate-100/60 dark:border-slate-800/60 pt-4">
                  Already have an account?{' '}
                  <Link to="/login" className="text-sky-500 font-semibold hover:underline">Sign in</Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-6">
                {/* OTP header */}
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Key className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight">Verify Your Email</h1>
                  <p className="text-xs text-slate-400">
                    We sent a 6-digit code to{' '}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{formData.email}</span>
                  </p>
                </div>

                {/* Show simulation OTP */}
                {serverOtp && (
                  <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/25 space-y-1">
                    <span className="text-xs font-bold text-sky-500 flex items-center gap-1.5"><Key className="w-3.5 h-3.5" />Dev Mode – Simulation Code</span>
                    <p className="text-xs text-sky-400">Use code: <span className="font-mono font-extrabold text-lg tracking-[0.3em] text-sky-500">{serverOtp}</span></p>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-slate-500 text-center">Enter 6-digit Verification Code</label>
                    <input type="text" maxLength="6" value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0 0 0 0 0 0"
                      className="w-full text-center text-3xl font-mono tracking-[0.6em] py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500 transition-all"
                      required />
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-3 font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {submitting ? 'Verifying…' : 'Verify & Register'}
                  </button>
                </form>

                <button onClick={() => { setShowOtpScreen(false); setOtpCode(''); }}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 py-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" /> Go back
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
