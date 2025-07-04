// components/shared/TPNLogo.tsx

import React from "react";

export default function TPNLogo({ size = 24 }: { size?: number }) {
  return (
    <img
      src="/emblem.png"
      alt="TPN"
      width={size}
      height={size}
      className="inline-block mr-2"
    />
  );
}


