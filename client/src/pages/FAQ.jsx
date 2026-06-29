import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      question: "How do I report a lost or found item?",
      answer: "You must first create an account or sign in. Go to 'Lost Items' page and click 'Report Lost Item' to log a lost item. For found items, go to the 'Found Items' page and click 'Report Found Item'. Fill in details, choose a category, specify location, date, and upload a photo."
    },
    {
      question: "What is the 'Smart Matching' feature?",
      answer: "When you report an item, our portal automatically checks all active reports in the database using category matches and title/description keywords. If a matching record is discovered, it raises a 'Possible Match Found' notification for both users immediately."
    },
    {
      question: "How do I claim a found item?",
      answer: "Find the item on the 'Found Items' page. Click 'Claim Item' (requires login). You will be prompted to write a verification message detailing unique identifiers (like serial numbers, screen wallpapers, or specific marks) that prove the item belongs to you."
    },
    {
      question: "Who can approve or reject claim requests?",
      answer: "The user who reported finding the item has access to approve or reject claims. Additionally, campus officials (Super Admins, Wardens, and Security Guards) can review, approve, or reject claims directly through the administrative portals."
    },
    {
      question: "How do I contact the person who found my item?",
      answer: "Once a potential match is found or a claim is initiated, you can visit the 'Chat Portal'. The portal provides a real-time chat interface to send text messages and coordinate physical handovers directly on campus."
    },
    {
      question: "Where should I physically hand over high-value items?",
      answer: "For safety and validation, it is highly recommended to hand over items at official locations, such as the Security Headquarters (HQ) near Gate 2, or your respective hostel Warden's office."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-slate-400 text-sm">Everything you need to know about navigating the TraceBack portal.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-2xl glass-panel overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
            >
              <span className="text-sm font-semibold pr-4">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-6 text-xs text-slate-450 leading-relaxed border-t border-slate-100/50 dark:border-slate-800/50 pt-4">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
