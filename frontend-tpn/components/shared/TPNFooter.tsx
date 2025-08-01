import React from "react";

export default function TPNFooter() {
  return (
    <div className="w-full flex justify-center items-center bg-black py-6">
      <p className="text-xs text-[#888888] text-center">
        <img
          src="/emblem.png"
          alt="TPN Emblem"
          className="inline w-4 h-4 mr-1 ml-1"
        />
        <span className="text-white font-medium">Timeproof Network</span> — The Trust Layer for Web3 Assets.
      </p>
    </div>
  );
}



