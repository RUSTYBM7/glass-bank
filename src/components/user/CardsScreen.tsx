import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassSurface, GlassCard, GlassBadge, GlassButton } from '@/components/glass';
import { useStore } from '@/store';
import {
  CreditCard, Plus, Snowflake, Ban, Eye, EyeOff,
  Shield, Sparkles, Check, X, Copy, Smartphone
} from 'lucide-react';

export default function CardsScreen() {
  const navigate = useNavigate();
  const { cards, user, freezeCard, unfreezeCard, blockCard } = useStore();
  const [showCVV, setShowCVV] = useState<string | null>(null);
  const [showCardNumber, setShowCardNumber] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'debit' | 'credit'>('all');

  const userCards = cards.filter((c) => c.userId === user?.id);
  const filteredCards = activeTab === 'all'
    ? userCards
    : userCards.filter((c) => c.type === activeTab);

  const getCardGradient = (card: typeof cards[0]) => {
    const gradients: Record<string, string> = {
      mint: 'from-[#A8E6CF] to-[#88D4AB]',
      purple: 'from-[#DDA0DD] to-[#C48BC4]',
      gold: 'from-[#F4F7C0] to-[#E5EB8A]',
      navy: 'from-[#1a1a2e] to-[#16213e]',
      coral: 'from-[#FF6B6B] to-[#EE5A5A]',
    };
    return gradients[card.color] || gradients.navy;
  };

  const handleFreeze = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (card?.status === 'frozen') {
      unfreezeCard(cardId);
    } else {
      freezeCard(cardId);
    }
  };

  const formatCardNumber = (lastFour: string) => {
    return `•••• •••• •••• ${lastFour}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-5 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">My Cards</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {}}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] text-white rounded-full text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </motion.button>
      </div>

      {/* Tab Filter */}
      <div className="flex gap-2 p-1 bg-white/50 rounded-full">
        {(['all', 'debit', 'credit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-[#0A0A0A] text-white'
                : 'text-[#0A0A0A]/60 hover:text-[#0A0A0A]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Card */}
              <div
                className={`relative h-48 rounded-3xl bg-gradient-to-br ${getCardGradient(card)} p-5 overflow-hidden cursor-pointer`}
                onClick={() => navigate(`/app/card/${card.id}`)}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
                </div>

                {/* Card Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {card.isVirtual && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                          <Smartphone className="w-3 h-3" />
                          <span className="text-xs text-white">Virtual</span>
                        </div>
                      )}
                      <span className="text-white/80 text-xs uppercase tracking-wider">
                        {card.cardNetwork}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      card.status === 'active' ? 'bg-[#2ECC71]/80 text-white' :
                      card.status === 'frozen' ? 'bg-[#3498DB]/80 text-white' :
                      'bg-[#E74C3C]/80 text-white'
                    }`}>
                      {card.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-white/60 text-xs mb-1">Card Number</p>
                    <p className="text-white text-lg font-mono tracking-wider">
                      {showCardNumber === card.id ? `•••• •••• •••• ${card.lastFourDigits}` : '•••• •••• •••• ••••'}
                    </p>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/60 text-xs">Card Holder</p>
                      <p className="text-white text-sm font-medium">{card.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs">Expires</p>
                      <p className="text-white text-sm font-medium">
                        {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Frozen Overlay */}
                {card.status === 'frozen' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                    <div className="text-center text-white">
                      <Snowflake className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                      <p className="font-medium">Card Frozen</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFreeze(card.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    card.status === 'frozen'
                      ? 'border-[#2ECC71] text-[#2ECC71]'
                      : 'border-[#0A0A0A]/20 text-[#0A0A0A]/60'
                  }`}
                >
                  {card.status === 'frozen' ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">Unfreeze</span>
                    </>
                  ) : (
                    <>
                      <Snowflake className="w-4 h-4" />
                      <span className="text-sm font-medium">Freeze</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCVV(showCVV === card.id ? null : card.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#0A0A0A]/20 text-[#0A0A0A]/60"
                >
                  {showCVV === card.id ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span className="text-sm font-medium">Hide CVV</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Show CVV</span>
                    </>
                  )}
                </motion.button>

                {showCVV === card.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#0A0A0A] text-white rounded-lg text-sm font-mono shadow-lg"
                  >
                    CVV: {card.cvv}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredCards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <CreditCard className="w-16 h-16 mx-auto text-[#0A0A0A]/20 mb-4" />
            <p className="text-[#0A0A0A]/50">No cards found</p>
            <GlassButton className="mt-4" onClick={() => {}}>
              <Plus className="w-4 h-4 mr-2" />
              Request a Card
            </GlassButton>
          </motion.div>
        )}
      </div>

      {/* Card Benefits */}
      <GlassCard className="p-5">
        <h3 className="font-medium text-[#0A0A0A] mb-4">Card Benefits</h3>
        <div className="space-y-3">
          {[
            { icon: Shield, title: 'Zero Liability Protection', desc: 'Your card is protected against unauthorized transactions' },
            { icon: Smartphone, title: 'Contactless Payments', desc: 'Pay securely with tap-to-pay anywhere' },
            { icon: CreditCard, title: 'Instant Notifications', desc: 'Real-time alerts for every transaction' },
          ].map((benefit, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#A8E6CF]/20 flex items-center justify-center">
                <benefit.icon className="w-5 h-5 text-[#2ECC71]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0A0A0A]">{benefit.title}</p>
                <p className="text-xs text-[#0A0A0A]/50">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Spending Summary */}
      {userCards.length > 0 && (
        <div>
          <h3 className="font-medium text-[#0A0A0A] mb-3">Spending This Month</h3>
          <div className="grid grid-cols-2 gap-3">
            <GlassCard className="p-4">
              <p className="text-xs text-[#0A0A0A]/50 mb-1">Total Spent</p>
              <p className="text-xl font-bold text-[#FF6B6B]">
                ${userCards.reduce((sum, c) => sum + c.balance, 0).toLocaleString()}
              </p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs text-[#0A0A0A]/50 mb-1">Available Credit</p>
              <p className="text-xl font-bold text-[#2ECC71]">
                ${userCards.reduce((sum, c) => sum + (c.availableCredit || 0), 0).toLocaleString()}
              </p>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
