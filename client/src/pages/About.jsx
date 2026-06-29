import React from 'react';

const About = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">About TraceBack</h1>
        <p className="text-slate-400 text-base">The Official Chandigarh University Lost & Found Hub.</p>
      </div>

      <div className="p-8 rounded-2xl glass-panel space-y-6 leading-relaxed">
        <p className="text-sm">
          <strong>TraceBack</strong> was designed to automate and simplify lost item retrieval processes at the Chandigarh University campus. Every day, items like ID cards, keys, calculators, electronics, and notebooks are lost in classrooms, cafeterias, playgrounds, and hostels.
        </p>

        <p className="text-sm">
          Previously, students had to check physical notice boards, visit individual security booths, or post in unstructured WhatsApp/Telegram groups. TraceBack bridges this gap by offering a single, unified campus-wide digital ledger.
        </p>

        <h2 className="text-lg font-bold">Key Architectural Highlights</h2>
        <ul className="list-disc pl-5 space-y-2 text-xs text-slate-400">
          <li><strong>Role-Based Access Control:</strong> Distinct user capabilities for Students, Teachers, Wardens, Security Guards, and Super Admins.</li>
          <li><strong>Smart Word-Matching:</strong> Compares items reported lost and found, instantly suggesting potential matches.</li>
          <li><strong>Verification & Proof:</strong> Secure claiming system where claimants write detailed ownership proofs, allowing finders or security guards to verify before handover.</li>
          <li><strong>Real-time Chatting:</strong> Fully integrated direct messaging using WebSockets (Socket.io) to schedule physical handovers safely.</li>
          <li><strong>In-app notifications:</strong> Immediate updates about matching items, claim approvals, and admin messages.</li>
        </ul>

        <p className="text-sm">
          TraceBack maintains campus integrity, minimizes administrative load on security offices, and assists Chandigarh University in fostering a supportive, tech-enabled student community.
        </p>
      </div>
    </div>
  );
};

export default About;
