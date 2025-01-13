import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-4xl font-bold relative">
        <span className="text-black">Flixrecom</span>
        <span className="absolute top-0 left-0 text-red-600 overflow-hidden loading-text">
          Flixrecom
        </span>
      </div>
      <style jsx>{`
        .loading-text {
          animation: fillText 3s ease-in-out forwards;
          white-space: nowrap;
        }

        @keyframes fillText {
          0% { width: 0; }
          50% { width: 50%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;