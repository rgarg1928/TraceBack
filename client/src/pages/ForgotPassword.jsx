import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft, Send, Loader2, Key, Lock, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [serverOtp, setServerOtp] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'warning');
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
      showToast(err.response?.data?.message || 'Email request failed', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode || !newPassword) {
      showToast('Please fill out all fields', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/auth/reset-password-otp', {
        email,
        code: otpCode,
        password: newPassword
      });
      setSubmitting(false);

      if (res.data.success) {
        showToast('Password reset successfully! Log in with your new password.', 'success');
        navigate('/login');
      }
    } catch (err) {
      setSubmitting(false);
      showToast(err.response?.data?.message || 'Failed to reset password', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="p-8 rounded-3xl glass-panel space-y-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/50">
        {!showOtpScreen ? (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
              <p className="text-xs text-slate-400">Enter your registered email to receive an OTP code</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Registered Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@cuchd.in"
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white py-3 font-semibold text-sm transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Request OTP Code
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
              <p className="text-xs text-slate-400">Enter the verification code sent to <span className="font-semibold">{email}</span></p>
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

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Verification Code</label>
                <div className="relative flex items-center">
                  <Key className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    maxLength="6"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono tracking-widest"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white py-3 font-semibold text-sm transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Verify & Reset Password
              </button>
            </form>

            <button
              onClick={() => {
                setShowOtpScreen(false);
                setOtpCode('');
                setNewPassword('');
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Go Back
            </button>
          </>
        )}

        <div className="flex justify-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
