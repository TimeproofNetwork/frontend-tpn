"use client";

import Image from "next/image";

export default function HeaderDAOButton() {
  return (
    <button
      onClick={() => window.open("/dao", "_blank")}
      className="bg-black text-white border border-gray-700 px-6 py-2 rounded-full flex items-center space-x-2 hover:opacity-90"
    >
      <Image src="/emblem.png" alt="TPN" width={18} height={18} />
      <span className="text-sm font-semibold">DAO Control Room</span>
    </button>
  );
}

