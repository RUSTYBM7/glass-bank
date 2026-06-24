import { useState } from 'react';
import { GlassCard, GlassButton, GlassBadge } from '@/components/glass';
import { useStore } from '@/store';
import { TrendingUp, DollarSign, Calendar, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const chartData = {
  '1W': [
    { day: 'Mon', value: 4200 }, { day: 'Tue', value: 4450 },
    { day: 'Wed', value: 4100 }, { day: 'Thu', value: 4800 },
    { day: 'Fri', value: 5100 }, { day: 'Sat', value: 5350 },
    { day: 'Sun', value: 5832 },
  ],
  '1M': [
    { day: 'W1', value: 3200 }, { day: 'W2', value: 3800 },
    { day: 'W3', value: 4500 }, { day: 'W4', value: 5832 },
  ],
  '6M': [
    { day: 'Jul', value: 1200 }, { day: 'Aug', value: 2100 },
    { day: 'Sep', value: 1800 }, { day: 'Oct', value: 3500 },
    { day: 'Nov', value: 4800 }, { day: 'Dec', value: 5832 },
  ],
  '1Y': [
    { day: 'Q1', value: 800 }, { day: 'Q2', value: 2200 },
    { day: 'Q3', value: 3500 }, { day: 'Q4', value: 5832 },
  ],
  'ALL': [
    { day: '2022', value: 200 }, { day: '2023', value: 1800 },
    { day: '2024', value: 5832 },
  ],
};

type TimeRange = '1W' | '1M' | '6M' | '1Y' | 'ALL';

export default function InvestmentScreen() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  const [oneTimeAmount, setOneTimeAmount] = useState(1000);
  const [monthlyAmount, setMonthlyAmount] = useState(200);

  if (!user) return null;

  const earnings = 58.32;
  const totalInvested = 12500;
  const currentValue = totalInvested + earnings;
  const returnPercent = ((earnings / totalInvested) * 100).toFixed(2);

  const timeRanges: TimeRange[] = ['1W', '1M', '6M', '1Y', 'ALL'];

  return (
    <div className="p-5 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[#0A0A0A]">Investments</h1>
          <p className="text-sm text-[#0A0A0A]/50">Grow your wealth smartly</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/app/chat')}
          className="w-10 h-10 glass-button rounded-full flex items-center justify-center"
          aria-label="Support"
        >
          <Headphones className="w-4 h-4 text-[#0A0A0A]" />
        </motion.button>
      </div>

      {/* Earnings Card */}
      <GlassCard intensity="high" className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4F7C0] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#A8E6CF] rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <GlassBadge variant="yellow" size="sm">
              <TrendingUp className="w-3 h-3" /> +${earnings}/week
            </GlassBadge>
          </div>
          <p className="text-sm text-[#0A0A0A]/50 mb-1">You have earned</p>
          <h2 className="text-4xl font-light text-[#0A0A0A] mb-3">
            ${earnings.toFixed(2)}
          </h2>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-[#0A0A0A]/40">Total Invested</p>
              <p className="text-lg font-medium text-[#0A0A0A]">${totalInvested.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-[#0A0A0A]/40">Current Value</p>
              <p className="text-lg font-medium text-[#2ECC71]">${currentValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-[#0A0A0A]/40">Return</p>
              <p className="text-lg font-medium text-[#2ECC71]">+{returnPercent}%</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Chart */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[#0A0A0A]">Performance</h3>
          <div className="flex gap-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#0A0A0A]/40 hover:text-[#0A0A0A]/70'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData[timeRange]}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A8E6CF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A8E6CF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#0A0A0A', opacity: 0.4 }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#A8E6CF"
                strokeWidth={2.5}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Investment Sliders */}
      <div className="space-y-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#A8E6CF]" />
              <span className="font-medium text-[#0A0A0A]">One-Time Investment</span>
            </div>
            <span className="text-lg font-medium text-[#0A0A0A]">${oneTimeAmount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={100}
            max={50000}
            step={100}
            value={oneTimeAmount}
            onChange={(e) => setOneTimeAmount(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #A8E6CF 0%, #A8E6CF ${(oneTimeAmount / 50000) * 100}%, rgba(255,255,255,0.3) ${(oneTimeAmount / 50000) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[#0A0A0A]/30">$100</span>
            <span className="text-xs text-[#0A0A0A]/30">$50,000</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#DDA0DD]" />
              <span className="font-medium text-[#0A0A0A]">Monthly Investment</span>
            </div>
            <span className="text-lg font-medium text-[#0A0A0A]">${monthlyAmount}</span>
          </div>
          <input
            type="range"
            min={50}
            max={5000}
            step={50}
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #DDA0DD 0%, #DDA0DD ${(monthlyAmount / 5000) * 100}%, rgba(255,255,255,0.3) ${(monthlyAmount / 5000) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[#0A0A0A]/30">$50</span>
            <span className="text-xs text-[#0A0A0A]/30">$5,000</span>
          </div>
        </GlassCard>
      </div>

      {/* Projected Returns */}
      <GlassCard className="p-5">
        <h3 className="font-medium text-[#0A0A0A] mb-3">Projected Returns (5 Years)</h3>
        <div className="space-y-2">
          {[
            { year: '1 Year', value: oneTimeAmount + monthlyAmount * 12 + 450 },
            { year: '3 Years', value: oneTimeAmount + monthlyAmount * 36 + 2800 },
            { year: '5 Years', value: oneTimeAmount + monthlyAmount * 60 + 7200 },
          ].map((proj) => (
            <div key={proj.year} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
              <span className="text-sm text-[#0A0A0A]/60">{proj.year}</span>
              <span className="text-sm font-medium text-[#2ECC71]">
                ${proj.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <GlassButton variant="gradient" fullWidth size="lg" className="rounded-2xl">
          Deposit
        </GlassButton>
        <GlassButton variant="primary" fullWidth size="lg" className="rounded-2xl">
          Purchase
        </GlassButton>
      </div>
    </div>
  );
}
