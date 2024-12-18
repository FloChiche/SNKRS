import { useEffect, useState } from 'react';

const LoadingPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 bg-white flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${!isLoading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative w-32 h-32">
        <div className="w-full h-full border-8 border-gray-200 rounded-full animate-spin border-t-gray-800"></div>
      </div>
      <div className="mt-8 text-2xl text-gray-800 font-bold">
        SNKRSs
      </div>
    </div>
  );
};

export default LoadingPage;