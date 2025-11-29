import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateTypingText } from '../services/geminiService';
import { mockDb } from '../services/mockBackend';
import { SAMPLE_TEXTS } from '../constants';
import { TestResult, TestState } from '../types';

interface TypingTestProps {
  onComplete: (result: TestResult) => void;
}

// Updated durations: 60s (1 min), 120s (2 min), 300s (5 min)
type Duration = 'text' | 60 | 120 | 300;

const TypingTest: React.FC<TypingTestProps> = ({ onComplete }) => {
  const { user, refreshUser } = useAuth();
  
  const [text, setText] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [testState, setTestState] = useState<TestState>(TestState.IDLE);
  
  // Timer State
  const [duration, setDuration] = useState<Duration>('text');
  const [timeLeft, setTimeLeft] = useState<number>(0); // For countdown
  const [elapsedTime, setElapsedTime] = useState<number>(0); // For countup
  
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [isLoadingText, setIsLoadingText] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const loadText = useCallback(async (useAI: boolean, currentDuration: Duration) => {
    setIsLoadingText(true);
    setAiMode(useAI);
    try {
      let newText = "";
      if (useAI) {
        newText = await generateTypingText();
        newText = newText.replace(/\s+/g, ' ').trim();
      } else {
        const randomIndex = Math.floor(Math.random() * SAMPLE_TEXTS.length);
        newText = SAMPLE_TEXTS[randomIndex];
      }

      // If Time Mode, ensure text is long enough for the duration
      if (typeof currentDuration === 'number') {
        // Estimate: 15 chars per second is very fast (approx 180 WPM), safe buffer.
        const targetLength = currentDuration * 15;
        let combinedText = newText;
        let attempts = 0;
        
        while (combinedText.length < targetLength && attempts < 15) {
           const nextText = useAI 
             ? await generateTypingText() 
             : SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
           combinedText += " " + nextText;
           attempts++;
        }
        newText = combinedText;
      }

      setText(newText.trim());
    } catch (e) {
      setText(SAMPLE_TEXTS[0]);
    } finally {
      setIsLoadingText(false);
      resetTest(currentDuration);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    loadText(false, 'text');
    return () => stopTimer();
  }, []);

  const changeDuration = (d: Duration) => {
    setDuration(d);
    loadText(aiMode, d);
  };

  const resetTest = (currentDuration: Duration = duration) => {
    setInput("");
    setTestState(TestState.IDLE);
    setElapsedTime(0);
    setWpm(0);
    setAccuracy(100);
    
    if (typeof currentDuration === 'number') {
      setTimeLeft(currentDuration);
    } else {
      setTimeLeft(0);
    }

    stopTimer();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const startTimer = () => {
    if (timerRef.current) return;
    const startTime = Date.now();
    setTestState(TestState.RUNNING);
    
    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const diffInSeconds = (now - startTime) / 1000;
      
      if (typeof duration === 'number') {
        const remaining = duration - diffInSeconds;
        if (remaining <= 0) {
            setTimeLeft(0);
            finishTest(inputRef.current?.value || "", duration); // Pass duration explicitly
        } else {
            setTimeLeft(remaining);
        }
      } else {
        setElapsedTime(diffInSeconds);
      }
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const calculateStats = (currInput: string, timeElapsed: number) => {
    // Standard WPM = (Chars / 5) / Minutes
    const words = currInput.length / 5;
    const minutes = timeElapsed / 60;
    const calculatedWpm = Math.round(words / (minutes || 0.001));
    
    let correctChars = 0;
    // Only check up to current input length
    for (let i = 0; i < currInput.length; i++) {
      if (currInput[i] === text[i]) correctChars++;
    }
    const calculatedAcc = Math.round((correctChars / (currInput.length || 1)) * 100);

    setWpm(calculatedWpm);
    setAccuracy(calculatedAcc);

    return { calculatedWpm, calculatedAcc };
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (testState === TestState.FINISHED) return;

    if (testState === TestState.IDLE && val.length > 0) {
      startTimer();
    }

    setInput(val);
    
    let currentTime = 0;
    if (typeof duration === 'number') {
        currentTime = duration - timeLeft;
    } else {
        currentTime = elapsedTime;
    }
    // Prevent div by zero at strict start
    if (currentTime < 0.5) currentTime = 0.5;

    calculateStats(val, currentTime);

    // Check completion for Text Mode
    if (duration === 'text' && val.length === text.length) {
      finishTest(val, currentTime);
    }
  };

  const finishTest = async (finalInput: string, finalTime: number) => {
    stopTimer();
    setTestState(TestState.FINISHED);
    
    // Final Calculation
    let timeSpent = finalTime;
    if (typeof duration === 'number') timeSpent = duration; // If time mode, use full duration for calc

    const { calculatedWpm, calculatedAcc } = calculateStats(finalInput, timeSpent);
    
    // Calculate Mistakes
    let mistakes = 0;
    for (let i = 0; i < finalInput.length; i++) {
       if (finalInput[i] !== text[i]) mistakes++;
    }

    const xpEarned = Math.round((calculatedWpm * calculatedAcc) / 10);

    const result: TestResult = {
      id: '', 
      userId: user?.id || 'guest',
      wpm: calculatedWpm,
      accuracy: calculatedAcc,
      mistakes,
      date: new Date().toISOString(),
      xpEarned,
      mode: typeof duration === 'number' ? 'time' : 'text',
      duration: typeof duration === 'number' ? duration : undefined
    };

    if (user) {
      await mockDb.saveResult(result);
      await refreshUser();
    }
    
    onComplete(result);
  };

  // Render text with coloring
  const renderText = () => {
    return text.split('').map((char, index) => {
      let colorClass = "text-slate-400 dark:text-slate-500"; 
      let bgClass = "";
      
      if (index < input.length) {
        if (input[index] === char) {
          colorClass = "text-green-500 dark:text-green-400"; 
        } else {
          colorClass = "text-red-500 dark:text-red-400"; 
          bgClass = "bg-red-100 dark:bg-red-900/30";
        }
      } else if (index === input.length) {
        bgClass = "bg-primary/20 dark:bg-primary/40 animate-pulse border-b-2 border-primary";
      }

      return (
        <span key={index} className={`${colorClass} ${bgClass} font-mono text-2xl leading-relaxed`}>
          {char}
        </span>
      );
    });
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        
        {/* Mode Selectors */}
        <div className="flex flex-wrap gap-2 justify-center">
            {/* AI Toggle */}
            <button 
                onClick={() => loadText(!aiMode, duration)}
                disabled={testState === TestState.RUNNING}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${aiMode ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
            >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                AI
            </button>
            
            <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-2 hidden md:block"></div>

            {/* Time Toggles */}
            <button 
                onClick={() => changeDuration('text')}
                disabled={testState === TestState.RUNNING}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${duration === 'text' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
            >
                Quote
            </button>
            {[60, 120, 300].map(d => (
                 <button 
                    key={d}
                    onClick={() => changeDuration(d as Duration)}
                    disabled={testState === TestState.RUNNING}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${duration === d ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                >
                    {d === 60 ? '1 Min' : d === 120 ? '2 Min' : '5 Min'}
                </button>
            ))}
        </div>

        {/* Timer Display */}
        <div className={`text-4xl font-bold font-mono ${typeof duration === 'number' && timeLeft < 10 && testState === TestState.RUNNING ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-200'}`}>
          {typeof duration === 'number' ? formatTime(timeLeft) : formatTime(elapsedTime)}
        </div>
      </div>

      {/* Stats Real-time */}
      <div className="grid grid-cols-3 gap-4 mb-8">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">WPM</p>
            <p className="text-3xl font-bold text-primary">{wpm}</p>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Accuracy</p>
            <p className="text-3xl font-bold text-secondary">{accuracy}%</p>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Mistakes</p>
            <p className="text-3xl font-bold text-red-500">
               {input.split('').filter((c, i) => c !== text[i]).length}
            </p>
         </div>
      </div>

      {/* Text Display */}
      <div 
        className="relative bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 h-[250px] overflow-hidden mb-8 cursor-text group"
        onClick={() => inputRef.current?.focus()}
      >
        {isLoadingText ? (
          <div className="flex items-center justify-center h-full">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary"></i>
            <span className="ml-3 text-slate-500">Preparing Test...</span>
          </div>
        ) : (
          <div className="select-none break-words overflow-y-auto h-full pr-2 custom-scrollbar">
            {renderText()}
          </div>
        )}
        
        {/* Hidden Input for capturing typing */}
        <input 
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          className="opacity-0 absolute inset-0 w-full h-full cursor-default"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          disabled={testState === TestState.FINISHED || isLoadingText}
        />
        
        {testState === TestState.IDLE && !isLoadingText && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all">
                <span className="bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg opacity-80 group-hover:opacity-0 transition-opacity">
                    Click or Start Typing
                </span>
            </div>
        )}
      </div>

      {/* Restart Info */}
      <div className="text-center">
         <button 
           onClick={() => loadText(aiMode, duration)} 
           className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center justify-center mx-auto gap-2 font-medium"
         >
           <i className="fa-solid fa-rotate-right"></i> Restart Test
         </button>
      </div>
    </div>
  );
};

export default TypingTest;