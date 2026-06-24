import { useState } from 'react';
import { GlassCard, GlassButton, GlassBadge } from '@/components/glass';
import { useStore } from '@/store';
import { Bitcoin, ArrowUpRight, ArrowDownRight, TrendingUp, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const btcChartData = [
  { time: '00:00', price: 66200 }, { time: '04:00', price: 65800 },
  { time: '08:00', price: 67100 }, { time: '12:00', price: 66800 },
  { time: '16:00', price: 67900 }, { time: '20:00', price: 67540 },
];

const cryptoTransactions = [
  { id: 'ctx1', type: 'deposit' as const, amount: 0.05, usdValue: 3377, time: '2 hours ago' },
  { id: 'ctx2', type: 'withdrawal' as const, amount: 0.02, usdValue: 1350.80, time: 'Yesterday' },
  { id: 'ctx3', type: 'deposit' as const, amount: 0.1, usdValue: 6754, time: '2 days ago' },
  { id: 'ctx4', type: 'withdrawal' as const, amount: 0.03, usdValue: 2026.20, time: '3 days ago' },
];

export default function CryptoScreen() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'prices'>('portfolio');

  if (!user) return null;

  const btcValue = user.balanceBtc * user.btcPrice;
  const btcChange = 2.34;

  return (
    <div className="p-5 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[#0A0A0A]">Crypto</h1>
          <p className="text-sm text-[#0A0A0A]/50">Manage your digital assets</p>
        </div>
        <div className="flex gap-1 glass-pill p-1">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'portfolio' ? 'bg-[#0A0A0A] text-white' : 'text-[#0A0A0A]/40'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'prices' ? 'bg-[#0A0A0A] text-white' : 'text-[#0A0A0A]/40'
            }`}
          >
            Prices
          </button>
        </div>
      </div>

      {/* BTC Balance Card */}
      <GlassCard intensity="high" className="p-6 relative overflow-hidden">
        {/* Abstract gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#A8E6CF]/50 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-[#DDA0DD]/40 rounded-full blur-3xl" />
          <div className="absolute top-[40%] left-[30%] w-32 h-32 bg-[#F4F7C0]/30 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F7C0]/50 flex items-center justify-center">
              <Bitcoin className="w-7 h-7 text-[#0A0A0A]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0A0A0A]">Bitcoin</p>
              <p className="text-xs text-[#0A0A0A]/40">BTC</p>
            </div>
            <div className="ml-auto text-right">
              <GlassBadge variant={btcChange >= 0 ? 'green' : 'red'} size="sm">
                {btcChange >= 0 ? '+' : ''}{btcChange}%
              </GlassBadge>
            </div>
          </div>

          <p className="text-4xl font-light text-[#0A0A0A] mb-1">
            ${btcValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-[#0A0A0A]/40 mb-4">
            {user.balanceBtc} BTC at ${user.btcPrice.toLocaleString()} each
          </p>

          {/* Mini Chart */}
          <div className="h-24 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={btcChartData}>
                <defs>
                  <linearGradient id="btcGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F4F7C0" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#F4F7C0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#F4F7C0"
                  strokeWidth={2}
                  fill="url(#btcGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>

      {/* Cash Loan Promo */}
      <GlassCard className="p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#DDA0DD]/60 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DDA0DD]/30 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-[#0A0A0A]" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-[#0A0A0A]">Cash Loan</p>
            <p className="text-xs text-[#0A0A0A]/50">Borrow against your crypto</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#0A0A0A]/30" />
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <GlassButton variant="default" fullWidth className="flex flex-col items-center gap-1.5 py-4 rounded-2xl">
          <ArrowDownRight className="w-5 h-5" />
          <span className="text-xs">Deposit</span>
        </GlassButton>
        <GlassButton variant="default" fullWidth className="flex flex-col items-center gap-1.5 py-4 rounded-2xl">
          <ArrowUpRight className="w-5 h-5" />
          <span className="text-xs">Withdraw</span>
        </GlassButton>
        <GlassButton variant="default" fullWidth className="flex flex-col items-center gap-1.5 py-4 rounded-2xl">
          <TrendingUp className="w-5 h-5" />
          <span className="text-xs">Transfer</span>
        </GlassButton>
      </div>

      {/* Recent Crypto Transactions */}
      <div>
        <h3 className="font-medium text-[#0A0A0A] mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {cryptoTransactions.map((txn) => (
            <GlassCard key={txn.id} className="px-4 py-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                txn.type === 'deposit' ? 'bg-[#2ECC71]/15' : 'bg-[#FF6B6B]/10'
              }`}>
                {txn.type === 'deposit' ? (
                  <ArrowDownRight className="w-5 h-5 text-[#2ECC71]" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-[#FF6B6B]" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0A0A0A] capitalize">{txn.type}</p>
                <p className="text-xs text-[#0A0A0A]/40">{txn.time}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  txn.type === 'deposit' ? 'text-[#2ECC71]' : 'text-[#FF6B6B]'
                }`}>
                  {txn.type === 'deposit' ? '+' : '-'}{txn.amount} BTC
                </p>
                <p className="text-xs text-[#0A0A0A]/40">${txn.usdValue.toLocaleString()}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
