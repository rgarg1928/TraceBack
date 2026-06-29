import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft, Send, Link as LinkIcon, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetInfo, setResetInfo] = useState(null); // { resetToken, resetUrl }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/auth/forgotpassword', { email });
      setSubmitting(false);

      if (res.data.success) {
        showToast('Password reset link generated!', 'success');
        // Store the info so the user can click it directly to test!
        setResetInfo({
          token: res.data.resetToken,
          url: res.data.resetUrl
        });
      }
    } catch (err) {
      setSubmitting(false);
      showToast(err.response?.data?.message || 'Email request failed', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="p-8 rounded-3xl glass-panel space-y-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-400">Request a recovery link to reset your password</p>
        </div>

        {!resetInfo ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              Request Reset Link
            </button>
          </form>
        ) : (
          <div className="space-y-4 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sm">
            <h3 className="font-bold text-sky-500 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4" />
              Simulation Active
            </h3>
            <p className="text-xs leading-relaxed">
              We generated a reset link for testing. Normally this would be emailed, but you can use it immediately by clicking the button below:
            </p>
            <Link
              to={`/reset-password/${resetInfo.token}`}
              className="w-full text-center block text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-lg transition-colors"
            >
              Go to Password Reset Page
            </Link>
          </div>
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
