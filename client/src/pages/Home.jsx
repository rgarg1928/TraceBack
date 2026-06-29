import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, PlusCircle, AlertCircle, CheckCircle, ShieldAlert, Award } from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    returned: 0
  });

  useEffect(() => {
    const fetchGeneralStats = async () => {
      try {
        const res = await axios.get('/api/items/lost');
        const res2 = await axios.get('/api/items/found');
        
        const lostCount = res.data.data.length;
        const foundCount = res2.data.data.length;
        
        const returnedLost = res.data.data.filter(i => i.status === 'Returned').length;
        const returnedFound = res2.data.data.filter(i => i.status === 'Returned').length;
        
        setStats({
          lost: lostCount,
          found: foundCount,
          returned: returnedLost + returnedFound
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchGeneralStats();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl py-16 px-8 sm:px-12 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8 border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-900/50 via-slate-900 to-slate-950 -z-10" />
        <div className="space-y-6 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Official CU Lost & Found Portal
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Recover Your Valuables with <span className="text-sky-400">TraceBack</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            A smart, unified portal for students, teachers, security personnel, and wardens of Chandigarh University to coordinate, report, matching, and safely retrieve lost or found items across campus in real-time.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link
              to="/lost-items"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-6 py-3 font-semibold text-sm text-white shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              Search Lost Items
            </Link>
            <Link
              to="/found-items"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white px-6 py-3 font-semibold text-sm border border-slate-700 transition-all hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              Report Found Item
            </Link>
          </div>
        </div>

        {/* Visual Badge/Illustration */}
        <div className="relative flex items-center justify-center shrink-0 w-64 h-64 bg-slate-800/30 rounded-2xl border border-slate-700/50 backdrop-blur">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 opacity-20 blur-lg" />
          <div className="text-center space-y-4">
            <div className="text-6xl">🔍</div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Smart Match Scanning</p>
            <p className="text-[10px] text-slate-500 max-w-[180px] mx-auto">Automated recommendation checking on category, title, and details.</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-panel text-center space-y-3">
          <div className="mx-auto w-12 h-12 flex items-center justify-center bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold">{stats.lost}</p>
            <p className="text-sm font-medium text-slate-400">Total Lost Items</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel text-center space-y-3">
          <div className="mx-auto w-12 h-12 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold">{stats.found}</p>
            <p className="text-sm font-medium text-slate-400">Total Found Items</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel text-center space-y-3">
          <div className="mx-auto w-12 h-12 flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-full">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-extrabold">{stats.returned}</p>
            <p className="text-sm font-medium text-slate-400">Items Recovered</p>
          </div>
        </div>
      </section>

      {/* Information Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl glass-panel space-y-4">
          <h2 className="text-xl font-bold">Role Hierarchy & Privileges</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-400 text-xs px-2 py-0.5 rounded font-semibold mt-1">Student / Teacher</span>
              <p className="text-xs text-slate-400 leading-relaxed">Can log lost/found items, view match suggestions, claim found items with verify messages, and chat directly with finders.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-400 text-xs px-2 py-0.5 rounded font-semibold mt-1">Security Guard</span>
              <p className="text-xs text-slate-400 leading-relaxed">Can search, report, manage database items, verify claims, and coordinate safety collection centers.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-xs px-2 py-0.5 rounded font-semibold mt-1">Warden</span>
              <p className="text-xs text-slate-400 leading-relaxed">Holds control over hostel inventory logs, matching status updates, and verification approvals.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 text-xs px-2 py-0.5 rounded font-semibold mt-1">Super Admin</span>
              <p className="text-xs text-slate-400 leading-relaxed">Full system governance: delete users, alter roles, approve claims, wipe items, and track portal analytics.</p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold">Important Notice</h2>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              For security and ownership validation:
              <br />
              1. Never hand over items without verifying student IDs or asking detailed verification questions.
              <br />
              2. Keep in mind that claiming someone else's item maliciously will result in administrative warnings or suspension.
              <br />
              3. Hostels or Security centers hold physical custody of high-value items (laptops, phones, jewelry).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Always check recent matches and verify physical details on collection. Log claim records directly in this portal!</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
