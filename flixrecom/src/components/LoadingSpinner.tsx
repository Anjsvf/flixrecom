import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen bg-black">
      <div className="relative w-24 h-24 mb-4">
        <div className="absolute w-full h-full rounded-full border-4 border-gray-700 border-t-4 border-t-red-600 animate-spin"></div>
        <div className="absolute w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 bg-black rounded-full border-4 border-gray-700"></div>
        </div>
      </div>
      <div className="text-center">
       
     
      </div>
    </div>
  );
};

export default LoadingSpinner;