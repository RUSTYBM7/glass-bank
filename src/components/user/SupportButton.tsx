import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Bot, Headphones, Ticket, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const supportOptions = [
    {
      icon: Bot,
      label: 'AI Assistant',
      desc: 'Get instant answers',
      action: () => {
        setIsOpen(false);
        navigate('/app/chat');
      },
      color: 'bg-[#A8E6CF]',
    },
    {
      icon: Headphones,
      label: 'Live Chat',
      desc: 'Talk to an agent',
      action: () => {
        setIsOpen(false);
        navigate('/app/chat?mode=human');
      },
      color: 'bg-[#DDA0DD]',
    },
    {
      icon: Ticket,
      label: 'My Tickets',
      desc: 'View support history',
      action: () => {
        setIsOpen(false);
        navigate('/app/chat?mode=tickets');
      },
      color: 'bg-[#F4F7C0]',
    },
    {
      icon: HelpCircle,
      label: 'Help Center',
      desc: 'FAQs & guides',
      action: () => {
        setIsOpen(false);
        navigate('/app/chat?mode=faq');
      },
      color: 'bg-[#C8D9C4]',
    },
  ];

  return (
    <div ref={menuRef} className="fixed bottom-24 right-4 z-40 sm:bottom-24" style={{ bottom: 'max(6rem, env(safe-area-inset-bottom) + 4.5rem)' }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-64 glass-surface-strong rounded-2xl p-3 shadow-xl"
          >
            <div className="space-y-1">
              {supportOptions.map((option) => (
                <motion.button
                  key={option.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={option.action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/20 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-xl ${option.color} flex items-center justify-center flex-shrink-0`}>
                    <option.icon className="w-5 h-5 text-[#0A0A0A]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0A0A0A]">{option.label}</p>
                    <p className="text-xs text-[#0A0A0A]/50">{option.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300 z-40',
          isOpen
            ? 'bg-[#0A0A0A] text-white'
            : 'bg-gradient-to-br from-[#A8E6CF] to-[#DDA0DD] text-[#0A0A0A]'
        )}
        aria-label={isOpen ? 'Close support menu' : 'Open support menu'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
