import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Search, PlusCircle, AlertCircle, CheckCircle, Award, ShieldAlert,
  ArrowRight, Zap, Shield, Users, Clock, Star
} from 'lucide-react';

// Animated counter hook
function useCounter(target, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const features = [
  { icon: Zap, title: 'Smart Matching', desc: 'AI-powered matching between lost & found reports using keywords and metadata.' },
  { icon: Shield, title: 'Verified Claims', desc: 'Secure claim system with identity verification to prevent fraud.' },
  { icon: Users, title: 'Role-Based Access', desc: 'Students, Teachers, Wardens & Guards each have tailored access control.' },
  { icon: Clock, title: 'Real-Time Alerts', desc: 'Instant socket notifications when a match is found for your report.' },
];

const roles = [
  { label: 'Student / Teacher', color: 'sky', desc: 'Log lost/found items, view matches, claim, and chat with finders.' },
  { label: 'Security Guard', color: 'indigo', desc: 'Search, report, manage items, verify claims, coordinate collection.' },
  { label: 'Warden', color: 'emerald', desc: 'Hostel inventory logs, matching status updates, verification approvals.' },
  { label: 'Super Admin', color: 'rose', desc: 'Full governance: delete users, alter roles, approve claims, view analytics.' },
];

const colorMap = {
  sky:     { bg: 'bg-sky-500/10',    text: 'text-sky-500',     border: 'border-sky-500/30' },
  indigo:  { bg: 'bg-indigo-500/10', text: 'text-indigo-500',  border: 'border-indigo-500/30' },
  emerald: { bg: 'bg-emerald-500/10',text: 'text-emerald-500', border: 'border-emerald-500/30' },
  rose:    { bg: 'bg-rose-500/10',   text: 'text-rose-500',    border: 'border-rose-500/30' },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

const Home = () => {
  const [stats, setStats] = useState({ lost: 0, found: 0, returned: 0 });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const fetchGeneralStats = async () => {
      try {
        const [res1, res2] = await Promise.all([
          axios.get('/api/items/lost'),
          axios.get('/api/items/found'),
        ]);
        const lost = res1.data.data.length;
        const found = res2.data.data.length;
        const ret = [
          ...res1.data.data.filter(i => i.status === 'Returned'),
          ...res2.data.data.filter(i => i.status === 'Returned'),
        ].length;
        setStats({ lost, found, returned: ret });
        setTimeout(() => setStarted(true), 300);
      } catch (err) { console.error(err); }
    };
    fetchGeneralStats();
  }, []);

  const lostCount     = useCounter(stats.lost,     1400, started);
  const foundCount    = useCounter(stats.found,    1400, started);
  const returnedCount = useCounter(stats.returned, 1400, started);

  return (
    <div className="space-y-20">

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative rounded-3xl overflow-hidden py-20 px-8 sm:px-14 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12 border border-slate-200/60 dark:border-slate-800/60 shadow-2xl glass-panel glow-card">
        {/* Gradient blobs */}
        <div className="absolute inset-0 hero-gradient -z-0 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Left copy */}
        <motion.div
          className="relative z-10 space-y-6 max-w-2xl"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/25 dark:bg-sky-400/10 dark:text-sky-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            Official CU Lost &amp; Found Portal
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Recover Your<br />
            Valuables with{' '}
            <span className="grad-text">TraceBack</span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
            A smart, unified portal for students, teachers, security personnel, and wardens of Chandigarh University to report, match, and safely retrieve lost or found items in real-time.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link to="/lost-items" className="btn-primary">
              <Search className="w-4 h-4" />
              Search Lost Items
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/found-items" className="btn-secondary bg-white/60 dark:bg-slate-800/60">
              <PlusCircle className="w-4 h-4" />
              Report Found Item
            </Link>
          </div>
        </motion.div>

        {/* Right visual */}
        <motion.div
          className="relative z-10 shrink-0"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="relative w-64 h-64 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-400/20 to-indigo-500/20 backdrop-blur-sm border border-white/20 dark:border-white/10" />
            {/* Floating rings */}
            <div className="absolute inset-4 rounded-2xl border-2 border-sky-400/20 animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-8 rounded-xl border border-indigo-400/20 animate-[spin_14s_linear_infinite_reverse]" />
            <div className="relative text-center space-y-3 p-6">
              <div className="text-6xl">🔍</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">Smart Matching</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">AI-powered recommendation across category, title &amp; keywords</p>
              </div>
              <div className="flex justify-center gap-1 mt-2">
                {[...Array(5)].map((_,i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Animated Statistics ───────────────────────────────── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        {[
          { count: lostCount, label: 'Total Lost Items', icon: AlertCircle, color: 'rose', desc: 'Reported on campus' },
          { count: foundCount, label: 'Items Found', icon: CheckCircle, color: 'emerald', desc: 'Ready for claiming' },
          { count: returnedCount, label: 'Items Recovered', icon: Award, color: 'indigo', desc: 'Successfully returned' },
        ].map(({ count, label, icon: Icon, color, desc }) => (
          <motion.div key={label} variants={itemVariants}
            className="p-6 rounded-2xl glass-panel card-hover text-center space-y-3 relative overflow-hidden group glow-card"
          >
            <div className={`mx-auto w-14 h-14 flex items-center justify-center rounded-2xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-4xl font-extrabold stat-num tabular-nums">{count}</p>
              <p className="text-sm font-semibold mt-0.5">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* ── Features Grid ────────────────────────────────────── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center">
          <span className="text-xs font-bold text-sky-500 uppercase tracking-widest">Why TraceBack?</span>
          <h2 className="text-2xl font-bold mt-1">Built for Chandigarh University</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={itemVariants}
              className="p-6 rounded-2xl glass-panel card-hover space-y-3 group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Info Cards: Roles & Notice ────────────────────────── */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Role Hierarchy */}
        <motion.div variants={itemVariants} className="p-8 rounded-2xl glass-panel space-y-5">
          <div>
            <h2 className="text-lg font-bold">Role Hierarchy &amp; Privileges</h2>
            <p className="text-xs text-slate-400 mt-0.5">Different roles have different access levels across the portal</p>
          </div>
          <div className="space-y-3">
            {roles.map(({ label, color, desc }) => {
              const c = colorMap[color];
              return (
                <div key={label} className={`flex items-start gap-3 p-3 rounded-xl ${c.bg} border ${c.border}`}>
                  <span className={`${c.text} text-xs font-bold shrink-0 mt-0.5 whitespace-nowrap`}>{label}</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div variants={itemVariants} className="p-8 rounded-2xl glass-panel space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Important Notice</h2>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed list-none">
              {[
                'Never hand over items without verifying student IDs or asking detailed verification questions.',
                'Claiming someone else\'s item maliciously will result in administrative warnings or suspension.',
                'Hostels or Security centers hold physical custody of high-value items (laptops, phones, jewelry).',
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-sky-500/10 text-sky-500 text-[10px] font-bold flex items-center justify-center">{i+1}</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs flex gap-2 items-start">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>Always check recent matches and verify physical details on collection. Log claim records directly in this portal!</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/lost-items" className="btn-primary flex-1 justify-center">
              <Search className="w-4 h-4" />
              Browse Lost Items
            </Link>
            <Link to="/register" className="btn-secondary flex-1 justify-center">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {/* ── Footer strip ─────────────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t border-slate-200/60 dark:border-slate-800/60 pt-8 pb-4"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-0.5">
            <p className="text-sm font-bold grad-text">TraceBack – CU Lost &amp; Found Portal</p>
            <p className="text-xs text-slate-400">📧 riyagargofficial@gmail.com &nbsp;|&nbsp; deepakbawa004@gmail.com</p>
            <p className="text-xs text-slate-400">📞 Helpline: 9478095710</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="btn-primary text-xs px-4 py-2">
              📱 Download App
            </a>
            <Link to="/contact" className="btn-secondary text-xs px-4 py-2">Contact Us</Link>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-6">
          © {new Date().getFullYear()} TraceBack · Chandigarh University · All rights reserved
        </p>
      </motion.footer>

    </div>
  );
};

export default Home;
