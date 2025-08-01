'use client';

import React from 'react';

interface UpgradeRequest {
  tokenAddress: string;
  name: string;
  symbol: string;
  currentLevel: number;
  requestedLevel: number;
  proof1: string;
  proof2?: string;
  creator: string;
  timestamp: number;
}

interface Props {
  request: UpgradeRequest;
  onApprove: () => void;
  onReject: () => void;
}

const DAOUpgradeTicketCard: React.FC<Props> = ({ request, onApprove, onReject }) => {
  return (
    <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl shadow-sm text-sm text-white">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold text-base">
          {request.name} ({request.symbol})
        </h3>
        <span className="text-xs text-gray-400">
          {request.timestamp
            ? new Date(Number(request.timestamp)).toLocaleString()
            : "—"}
        </span>
      </div>

      <p className="text-gray-300">
        <strong>Requested:</strong> Level {request.currentLevel} → Level {request.requestedLevel}
      </p>
      <p className="text-gray-300">
        <strong>Token Address:</strong> {request.tokenAddress || 'N/A'}
      </p>
      <p className="text-gray-300">
        <strong>Creator:</strong> {request.creator}
      </p>
      <p className="text-gray-300">
        <strong>Proof 1:</strong>{' '}
        <a
          href={request.proof1}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          View
        </a>
      </p>
      {request.proof2 && (
        <p className="text-gray-300">
          <strong>Proof 2:</strong>{' '}
          <a
            href={request.proof2}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            View
          </a>
        </p>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={onApprove}
          className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-white text-sm"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-white text-sm"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default DAOUpgradeTicketCard;

