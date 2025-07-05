import { useState } from 'react';

export default function SuggestionBox() {
  const [feedback, setFeedback] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!feedback.trim()) return alert('Please enter your feedback before submitting.');
    console.log('Feedback:', feedback);
    console.log('Contact (optional):', contact);
    setSubmitted(true);
  };

  return (
    <div className="bg-[#0D0D0D] border border-[#333333] rounded-2xl p-6 text-white shadow-lg mt-12">
      <h3 className="text-xl font-semibold mb-2">💬 Help Us Improve TPN</h3>
      <p className="text-[#CCCCCC] text-sm mb-4">
        We’re building the trust layer for Web3—and your feedback matters. Share your ideas, report issues, or suggest improvements below.
      </p>

      <textarea
        placeholder="Your feedback, ideas, or issues..."
        className="w-full p-3 rounded-xl bg-[#1A1A1A] text-white border border-[#333333] focus:outline-none focus:ring focus:ring-blue-600 mb-3"
        rows={4}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />

      <input
        type="text"
        placeholder="Your email or Twitter/LinkedIn (optional)"
        className="w-full p-3 rounded-xl bg-[#1A1A1A] text-white border border-[#333333] focus:outline-none focus:ring focus:ring-blue-600 mb-4"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />

      <div className="mt-4 text-center">
        <a
          href="https://forms.gle/ZYe5n7Kpvqk3ZBFdA"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold shadow-md"
        >
          📝 Request 100 TPN for Testing
        </a>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!feedback.trim() || submitted}
        className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {submitted ? '✅ Thank You!' : '🔄 Submit Feedback'}
      </button>

      <p className="mt-4 text-xs text-[#888888] text-center">
        🔒 <strong>TPN keeps your feedback private and secure.</strong><br />
        <img src="/emblem.png" alt="TPN Emblem" className="inline w-4 h-4 mr-1 ml-1" />
        <span className="text-white font-medium">Timeproof Network</span> — The Trust Layer for Web3 Assets.
      </p>
    </div>
  );
}

