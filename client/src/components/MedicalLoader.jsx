import React from "react";
import { Activity } from "lucide-react";

const MedicalLoader = ({ text = "Analyzing Report..." }) => {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Activity className="text-teal-600 animate-pulse" size={32} />
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mt-6">{text}</h2>
      <p className="text-gray-500 mt-2 text-sm animate-pulse">
        Processing with Gemini AI...
      </p>
    </div>
  );
};

export default MedicalLoader;
