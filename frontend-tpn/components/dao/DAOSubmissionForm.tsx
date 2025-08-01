'use client';

import React, { useState } from 'react';

interface SubmissionPayload {
  category: string;
  tokenAddress: string;
  creator: string;
  justification: string;
}

const DAOSubmissionForm: React.FC = () => {
  const [form, setForm] = useState<SubmissionPayload>({
    category: '',
    tokenAddress: '',
    creator: '',
    justification: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResponse('');

    try {
      const res = await fetch('/api/dao/submit-governance-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setResponse(data.message || 'Submission successful');
    } catch (err) {
      setResponse('❌ Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1c1c1c] p-6 rounded-xl border border-gray-700 text-white shadow-md">
      <h2 className="text-lg font-bold mb-4">📝 Submit DAO Governance Action</h2>

      <label className="block text-sm mb-2">Category</label>
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="w-full bg-black border border-gray-600 rounded-md px-3 py-2 mb-4"
        required
      >
        <option value="">Select Category</option>
        <option value="ban">DAO Ban</option>
        <option value="quarantine">Quarantine</option>
        <option value="upgrade">Trust Level Upgrade</option>
      </select>

      <label className="block text-sm mb-2">Token Address</label>
      <input
        name="tokenAddress"
        type="text"
        value={form.tokenAddress}
        onChange={handleChange}
        className="w-full bg-black border border-gray-600 rounded-md px-3 py-2 mb-4"
        required
      />

      <label className="block text-sm mb-2">Creator Address</label>
      <input
        name="creator"
        type="text"
        value={form.creator}
        onChange={handleChange}
        className="w-full bg-black border border-gray-600 rounded-md px-3 py-2 mb-4"
        required
      />

      <label className="block text-sm mb-2">Justification</label>
      <textarea
        name="justification"
        value={form.justification}
        onChange={handleChange}
        rows={4}
        className="w-full bg-black border border-gray-600 rounded-md px-3 py-2 mb-4"
        required
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-semibold disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Action'}
      </button>

      {response && <p className="mt-4 text-sm text-green-400">{response}</p>}
    </form>
  );
};

export default DAOSubmissionForm;
