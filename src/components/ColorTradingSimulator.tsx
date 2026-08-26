import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, ShieldAlert, Award, Calculator, CheckCircle2 } from 'lucide-react';

export const ColorTradingSimulator: React.FC = () => {
  const [accountEquity, setAccountEquity] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [stopPrice, setStopPrice] = useState<number>(97);
  const [targetPrice, setTargetPrice] = useState<number>(109);
  
  const [simulatedBars, setSimulatedBars] = useState<Array<{ type: 'red' | 'green' | 'pivot'; height: number; value: number }>>([
    { type: 'red', height: 45, value: 104 },
    { type: 'red', height: 50, value: 102 },
    { type: 'red', height: 60, value: 99 },
    { type: 'pivot', height: 85, value: 100 },
    { type: 'green', height: 70, value: 103 },
    { type: 'green', height: 95, value: 106 },
    { type: 'green', height: 110, value: 109 },
  ]);

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [tradeOutcome, setTradeOutcome] = useState<'idle' | 'win' | 'stopped'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Calculations
  const riskAmount = (accountEquity * riskPercent) / 100;
  const stopDistance = Math.max(0.1, entryPrice - stopPrice);
  const positionUnits = Math.floor(riskAmount / stopDistance);
  const profitTargetDistance = targetPrice - entryPrice;
  const potentialProfit = Math.round(positionUnits * profitTargetDistance);
  const riskRewardRatio = (profitTargetDistance / stopDistance).toFixed(1);

  const runSimulation = () => {
    setIsSimulating(true);
    setTradeOutcome('idle');

    timerRef.current = setTimeout(() => {
      setSimulatedBars((prev) => [
        ...prev,
        { type: 'green', height: 120, value: 109.5 }
      ]);
      setTradeOutcome('win');
      setIsSimulating(false);
    }, 1200);
  };

  const resetSimulation = () => {
    setSimulatedBars([
      { type: 'red', height: 45, value: 104 },
      { type: 'red', height: 50, value: 102 },
      { type: 'red', height: 60, value: 99 },
      { type: 'pivot', height: 85, value: 100 },
      { type: 'green', height: 70, value: 103 },
      { type: 'green', height: 95, value: 106 },
      { type: 'green', height: 110, value: 109 },
    ]);
    setTradeOutcome('idle');
  };

  return (
    <div className="bento-card p-6 sm:p-8 relative overflow-hidden">
      {/* Glow highlight */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2 text-brass text-xs uppercase tracking-widest font-semibold mb-1">
            <Calculator className="w-4 h-4" />
            ইন্টারঅ্যাক্টিভ ট্রেডিং ইঞ্জিন
          </div>
          <h3 className="text-xl font-bold text-white font-display">
            কালার বার রিস্ক ও এবজর্বশন সিমুলেটর
          </h3>
          <p className="text-white/50 text-xs">
            রেড-টু-গ্রিন এবজর্বশন স্ট্র্যাটেজি ও পজিশন সাইজিং লাইভ পরীক্ষা করুন।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="px-5 py-2.5 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold text-xs uppercase tracking-wider rounded-xl  flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            {isSimulating ? 'অর্ডার এক্সিকিউট হচ্ছে...' : 'সিমুলেশন চালান'}
          </button>
          <button
            onClick={resetSimulation}
            className="p-2.5 text-white/60 hover:text-white bg-white/5 border border-white/10 rounded-xl transition cursor-pointer"
            title="চার্ট রিসেট করুন"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders & Controls */}
        <div className="lg:col-span-5 space-y-4 bg-white/[0.02] p-5 rounded-2xl border border-white/10">
          <div>
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>মূলধনের পরিমাণ (Account Equity)</span>
              <span className="font-mono text-brass font-bold">${accountEquity.toLocaleString()} USDT</span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={accountEquity}
              onChange={(e) => setAccountEquity(Number(e.target.value))}
              className="w-full accent-brass bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>প্রতি ট্রেডে সর্বোচ্চ রিস্ক (%)</span>
              <span className="font-mono text-brass font-bold">{riskPercent}% (${riskAmount.toLocaleString()})</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full accent-brass bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">এন্ট্রি প্রাইস</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:border-brass outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-red-400 block mb-1">স্টপ লস</label>
              <input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(Number(e.target.value))}
                className="w-full bg-[#050505] border border-red-500/30 rounded-xl px-2.5 py-1.5 text-xs text-red-300 font-mono focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-emerald-400 block mb-1">টেক প্রফিট</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full bg-[#050505] border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-emerald-300 font-mono focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Sizing Stats */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
            <div className="p-2.5 bg-[#050505] rounded-xl border border-white/10">
              <span className="text-[10px] text-white/40 block">হিসাবকৃত পজিশন সাইজ</span>
              <span className="text-sm font-bold text-white font-mono">{positionUnits.toLocaleString()} ইউনিট</span>
            </div>
            <div className="p-2.5 bg-[#050505] rounded-xl border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 block">সম্ভাব্য লাভ (১:{riskRewardRatio} R:R)</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">+${potentialProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Visual Candlestick Display */}
        <div className="lg:col-span-7 bg-[#050505] rounded-2xl p-5 border border-white/10 flex flex-col justify-between relative">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>লাইভ BTC/USDT 4H কালার সিকোয়েন্স</span>
            </div>
            <span className="font-mono text-white/40">R:R টার্গেট ১:{riskRewardRatio}</span>
          </div>

          {/* Canvas Chart Simulation */}
          <div className="h-48 my-auto flex items-end justify-around gap-2 px-4 relative border-b border-white/10 pb-2">
            {/* Horizontal level lines */}
            <div className="absolute top-[15%] left-0 right-0 border-t border-dashed border-emerald-500/30 flex justify-between px-2 text-[10px] text-emerald-400/70 pointer-events-none">
              <span>টার্গেট: ${targetPrice}</span>
              <span>১:{riskRewardRatio} R:R</span>
            </div>
            <div className="absolute top-[50%] left-0 right-0 border-t border-dashed border-brass/40 flex justify-between px-2 text-[10px] text-brass/80 pointer-events-none">
              <span>এন্ট্রি ট্রিগার: ${entryPrice}</span>
              <span>সবুজ এবজর্বশন</span>
            </div>
            <div className="absolute bottom-[10%] left-0 right-0 border-t border-dashed border-red-500/30 flex justify-between px-2 text-[10px] text-red-400/70 pointer-events-none">
              <span>স্টপ লস: ${stopPrice}</span>
            </div>

            {simulatedBars.map((bar, idx) => {
              const isRed = bar.type === 'red';
              const isPivot = bar.type === 'pivot';
              return (
                <div key={idx} className="flex flex-col items-center group relative cursor-pointer">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black border border-white/20 px-2 py-0.5 rounded text-[10px] text-white font-mono transition z-20 pointer-events-none whitespace-nowrap shadow-xl">
                    ${bar.value} ({bar.type.toUpperCase()})
                  </div>

                  {/* Wick */}
                  <div
                    className={`w-0.5 ${
                      isRed ? 'bg-red-500' : isPivot ? 'bg-brass' : 'bg-emerald-400'
                    }`}
                    style={{ height: `${bar.height + 25}px` }}
                  />
                  {/* Body */}
                  <div
                    className={`w-6 rounded-xs transition-all duration-300 -mt-[${bar.height / 2}px] ${
                      isRed
                        ? 'bg-gradient-to-b from-red-500 to-red-700 shadow-lg shadow-red-500/20'
                        : isPivot
                        ? 'bg-brass shadow-lg shadow-brass/25 ring-1 ring-brass-bright'
                        : 'bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20'
                    }`}
                    style={{ height: `${Math.max(16, bar.height / 1.8)}px` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Outcome Status */}
          {tradeOutcome === 'win' && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>টার্গেট অর্জিত! ১:{riskRewardRatio} রিস্ক-টু-রিওয়ার্ডে ট্রেড সফল হয়েছে।</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-sm">+${potentialProfit} USDT</span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5">
            <span className="flex items-center gap-1 text-white/50">
              <ShieldAlert className="w-3.5 h-3.5 text-brass" /> সর্বোচ্চ লস সীমাবদ্ধ: ${riskAmount}
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> নিয়ম ৩: সর্বদাই নির্দিষ্ট রিস্ক সাইজিং মানুন
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
