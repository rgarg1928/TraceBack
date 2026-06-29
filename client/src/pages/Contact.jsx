import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Contact = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill out all required fields', 'error');
      return;
    }
    showToast('Your message has been submitted. We will contact you soon.', 'success');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="text-slate-400 text-sm">Have queries or feedback? Get in touch with our campus support desk.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info cards */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl glass-panel flex items-start gap-4">
            <Mail className="w-5 h-5 text-sky-500 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-semibold">Email Support</p>
              <p className="text-xs text-slate-400 mt-1 truncate">support@traceback.cu</p>
              <p className="text-xs text-slate-400">riyagargofficial@gmail.com</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel flex items-start gap-4">
            <Phone className="w-5 h-5 text-sky-500 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-semibold">Helpline</p>
              <p className="text-xs text-slate-400 mt-1">+91 172 233 450</p>
              <p className="text-xs text-slate-400">Ext: 4001</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel flex items-start gap-4">
            <MapPin className="w-5 h-5 text-sky-500 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-semibold">Main Office</p>
              <p className="text-xs text-slate-400 mt-1">Security HQ, Gate 2,</p>
              <p className="text-xs text-slate-400">Chandigarh University,</p>
              <p className="text-xs text-slate-400">Gharuan, Mohali, Punjab</p>
            </div>
          </div>
        </div>

        {/* Message form */}
        <div className="md:col-span-2 p-8 rounded-2xl glass-panel">
          <h2 className="text-lg font-bold mb-4">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@cuchd.in"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="Write your issue or inquiry details here..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 font-semibold text-sm transition-all"
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
