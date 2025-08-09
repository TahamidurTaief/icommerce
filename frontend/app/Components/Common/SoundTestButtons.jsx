"use client";

import { motion } from "framer-motion";
import playSound from "../../../lib/playSound";
import { testAudioCapabilities, testProgrammaticSound } from "../../../lib/audioTest";

const SoundTestButtons = () => {
  const testSounds = [
    { type: 'success', label: '✅ Success', color: 'bg-green-500 hover:bg-green-600' },
    { type: 'error', label: '❌ Error', color: 'bg-red-500 hover:bg-red-600' },
    { type: 'warning', label: '⚠️ Warning', color: 'bg-yellow-500 hover:bg-yellow-600' }
  ];

  const handleSoundTest = (type) => {
    console.log(`🎯 Testing ${type} sound...`);
    playSound(type);
  };

  const handleAudioDiagnostics = () => {
    console.clear();
    console.log("🔍 Running Audio Diagnostics...");
    testAudioCapabilities();
  };

  const handleProgrammaticTest = () => {
    console.log("🧪 Running Programmatic Sound Test...");
    testProgrammaticSound();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <h4 className="text-sm font-medium text-white mb-2">🔊 Test Sounds</h4>
        <div className="space-y-1">
          {testSounds.map(({ type, label, color }) => (
            <motion.button
              key={type}
              onClick={() => handleSoundTest(type)}
              className={`w-full px-3 py-1 text-xs text-white font-medium rounded transition-colors ${color}`}
              whileTap={{ scale: 0.95 }}
            >
              {label}
            </motion.button>
          ))}
          <hr className="border-white/20 my-2" />
          <motion.button
            onClick={handleAudioDiagnostics}
            className="w-full px-3 py-1 text-xs text-white font-medium rounded transition-colors bg-blue-500 hover:bg-blue-600"
            whileTap={{ scale: 0.95 }}
          >
            🔍 Diagnostics
          </motion.button>
          <motion.button
            onClick={handleProgrammaticTest}
            className="w-full px-3 py-1 text-xs text-white font-medium rounded transition-colors bg-purple-500 hover:bg-purple-600"
            whileTap={{ scale: 0.95 }}
          >
            🧪 Test Tone
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SoundTestButtons;
