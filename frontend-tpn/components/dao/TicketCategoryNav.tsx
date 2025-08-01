'use client';
import { useState } from 'react';

interface TicketCategoryNavProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export default function TicketCategoryNav({
  categories,
  selectedCategory,
  onSelect,
}: TicketCategoryNavProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex space-x-2 mb-4 overflow-x-auto no-scrollbar">
      {categories.map((category) => {
        const isActive = selectedCategory === category;
        const isHovered = hovered === category;

        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            onMouseEnter={() => setHovered(category)}
            onMouseLeave={() => setHovered(null)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
              ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : isHovered
                  ? 'bg-[#1E1E1E] text-white'
                  : 'bg-[#121212] text-gray-300'
              }
              border border-[#2D2D2D] hover:border-blue-500`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
