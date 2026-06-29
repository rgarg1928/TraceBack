import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, Phone, UserCheck, Loader2, ArrowLeft, Key } from 'lucide-react';

const Register = () => {
  const { registerUser, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    role: 'Student'
  });
  const [submitting, setSubmitting] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [serverOtp, setServerOtp] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, contactNumber, role } = formData;

    if (!name || !email || !password || !contactNumber) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/auth/send-otp', { email });
      setSubmitting(false);
      if (res.data.success) {
        setServerOtp(res.data.otp);
        setShowOtpScreen(true);
        showToast('Verification code sent!', 'success');
      }
    } catch (err) {
      setSubmitting(false);
      showToast(err.response?.data?.message || 'Failed to send verification code', 'error');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      showToast('Please enter the verification code', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const verifyRes = await axios.post('/api/auth/verify-otp', { email: formData.email, code: otpCode });
      if (verifyRes.data.success) {
        const result = await registerUser(formData);
        setSubmitting(false);
        if (result && result.success) {
          showToast('Account registered successfully! Welcome.', 'success');
          navigate('/dashboard');
        } else {
          showToast(result?.message || 'Registration failed', 'error');
        }
      }
    } catch (err) {
      setSubmitting(false);
      showToast(err.response?.data?.message || 'Invalid or expired OTP code', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto py-4">
      <div className="p-8 rounded-3xl glass-panel space-y-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/50">
        {!showOtpScreen ? (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
              <p className="text-xs text-slate-400">Register for the CU Lost & Found Portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Full Name *</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Riya Garg"
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Campus Email *</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@cuchd.in"
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Contact Number *</label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Role *</label>
                  <div className="relative flex items-center">
                    <UserCheck className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none appearance-none"
                      required
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Security Guard">Security Guard</option>
                      <option value="Warden">Warden</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Password *</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white py-3 font-semibold text-sm shadow-lg shadow-sky-500/20 transition-all active:scale-95 cursor-pointer mt-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                Create Account
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100/50 dark:border-slate-800/50">
              Already registered?{' '}
              <Link to="/login" className="text-sky-500 font-semibold hover:underline">
                Sign In Here
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Verify Email</h1>
              <p className="text-xs text-slate-400">We sent a 6-digit verification code to <span className="font-semibold text-slate-200">{formData.email}</span></p>
            </div>

            {serverOtp && (
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-500 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  [Simulation Code]
                </span>
                <p>Use code: <span className="font-mono font-extrabold text-sm tracking-wider">{serverOtp}</span> to verify instantly.</p>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400 text-center">Enter Verification Code</label>
                <input
                  type="text"
                  maxLength="6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-2xl font-mono tracking-widest p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white py-3 font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer mt-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                Verify & Register
              </button>
            </form>

            <button
              onClick={() => {
                setShowOtpScreen(false);
                setOtpCode('');
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
