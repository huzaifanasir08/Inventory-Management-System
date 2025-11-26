import React from 'react';
import { Target } from 'lucide-react';

const ThemeToggle = () => {
  const handleClick = () => {
    window.open('http://127.0.0.1:8000/admin', '_blank'); // 👈 opens in new tab
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Open link"
    >
      <Target className="w-5 h-5" />
    </button>
  );
};

export default ThemeToggle;
