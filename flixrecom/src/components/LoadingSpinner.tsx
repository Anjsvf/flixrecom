import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full ">
      <div className="relative text-4xl font-bold">
        <span className="text-black">Carregando...</span>
        <span className="absolute inset-0 text-red-600 overflow-hidden loading-text" aria-hidden="true">
          Carregando...
        </span>
      </div>
      <style jsx>{`
        .loading-text {
          animation: fillText 3s ease-in-out infinite;
          white-space: nowrap;
        }

        @keyframes fillText {
          0% {
            width: 0;
          }
          50% {
            width: 50%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
