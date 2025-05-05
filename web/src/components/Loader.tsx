import { useEffect, useState } from "react";

const Loader = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-[#f3f4f6]">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-t-gray-700"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin-reverse rounded-full border-4 border-solid border-t-gray-700"></div>
          </div>
        </div>
        <p className="text-lg font-medium text-gray-700 ">Loading{dots}</p>
      </div>
    </div>
  );
};

export default Loader;
