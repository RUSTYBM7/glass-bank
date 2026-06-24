import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassSurface, GlassCard, GlassBadge, GlassButton } from '@/components/glass';
import { useStore } from '@/store';
import {
  Send, Paperclip, Bot, User, Headphones, Ticket, X,
  HelpCircle, FileText, ChevronDown, Sparkles,
  Clock, ArrowLeft, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams, useNavigate } from 'react-router-dom';

// AI Knowledge Base for common banking questions
const aiKnowledgeBase: Record<string, string> = {
  'transfer': 'To make a transfer, go to the Transfer tab, select a recipient, enter the amount, and confirm. Transfers between OrbitPay accounts are instant and free. External transfers may take 1-2 business days.',
  'fee': 'Our fees are: 0.5% for standard transfers, free between OrbitPay accounts, $1 for ATM withdrawals, and 0.75% for investments. Premium members enjoy reduced fees.',
  'balance': 'You can check your balance on the Home screen. Tap the eye icon to show/hide your balance. We support USD, EUR, GBP, and BTC.',
  'card': 'To manage your cards, go to the Cards tab. You can freeze/unfreeze cards, view CVV, set limits, and request new cards. Virtual cards are available for online purchases.',
  'crypto': 'You can buy, sell, and hold Bitcoin (BTC) in your Crypto Wallet. Real-time prices are provided. Crypto transactions are subject to market conditions.',
  'invest': 'Our investment platform offers stocks, ETFs, and mutual funds. You can start with as little as $10. Past performance does not guarantee future results.',
  'loan': 'We offer personal, auto, student, and home loans. Interest rates start from 3.8% APR. You can apply through the Loans tab in your profile.',
  'kyc': 'KYC verification is required for full account access. Go to Profile > Personal Info to complete verification. Processing typically takes 24-48 hours.',
  'limit': 'Daily limits vary by tier: Basic $5,000, Standard $25,000, Premium $50,000+. Contact support to request limit increases.',
  'security': 'We use bank-grade encryption, biometric authentication, and real-time fraud detection. Enable 2FA in Profile > Security for extra protection.',
  'password': 'To reset your password, go to Profile > Security > Change Password. You will need your current password or verification via email/SMS.',
  'close': 'To close your account, please contact our support team. Ensure all balances are withdrawn and loans are settled first.',
  'deposit': 'You can deposit funds via bank transfer, debit card, or wire transfer. Bank transfers typically take 1-3 business days. Debit card deposits are instant.',
  'withdraw': 'Withdraw funds via bank transfer, ATM, or digital wallet. Standard withdrawals take 1-2 business days. Express options are available for a fee.',
  'schedule': 'Set up scheduled transfers in the Scheduled tab. You can choose daily, weekly, biweekly, or monthly frequency.',
  'bill': 'Pay bills through the Bills section. We support electricity, water, internet, phone, and more. Set up autopay to never miss a due date.',
};

// AI Response Generator
function generateAIResponse(userMessage: string): { response: string; confidence: number; shouldEscalate: boolean } {
  const lower = userMessage.toLowerCase();

  // Check for escalation triggers
  const escalationTriggers = [
    'human', 'agent', 'representative', 'speak to someone', 'talk to person',
    'fraud', 'hacked', 'stolen', 'unauthorized', 'dispute', 'complaint',
    'emergency', 'urgent', 'legal', 'lawyer', 'sue', 'court',
    'close my account', 'delete my data', 'gdpr',
  ];

  const shouldEscalate = escalationTriggers.some((trigger) => lower.includes(trigger));

  if (shouldEscalate) {
    return {
      response: 'I understand this is important. I am connecting you with a human support agent right away. Please hold on...',
      confidence: 1,
      shouldEscalate: true,
    };
  }

  // Find best matching topic
  let bestMatch = '';
  let bestScore = 0;

  for (const [topic, response] of Object.entries(aiKnowledgeBase)) {
    const keywords = topic.split(' ');
    const score = keywords.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = response;
    }
  }

  // Check for additional context keywords
  const contextKeywords: Record<string, string[]> = {
    'how do i': ['transfer', 'deposit', 'withdraw', 'pay'],
    'what is': ['fee', 'limit', 'kyc', 'apr'],
    'where can': ['balance', 'card', 'statement'],
    'help': ['transfer', 'card', 'crypto', 'loan', 'account'],
  };

  for (const [prefix, topics] of Object.entries(contextKeywords)) {
    if (lower.includes(prefix)) {
      for (const t of topics) {
        if (lower.includes(t) && aiKnowledgeBase[t]) {
          bestMatch = aiKnowledgeBase[t];
          bestScore = Math.max(bestScore, 1);
          break;
        }
      }
    }
  }

  if (bestScore > 0 && bestMatch) {
    return {
      response: bestMatch,
      confidence: Math.min(bestScore * 0.3 + 0.5, 0.95),
      shouldEscalate: false,
    };
  }

  // Generic responses for unrecognized queries
  const genericResponses = [
    'I want to help you with that. Could you provide a bit more detail about what you need?',
    'I can assist with transfers, cards, crypto, loans, account settings, and more. What would you like to know?',
    'That is a great question. Let me find the best information for you. In the meantime, you can check our Help Center or I can connect you with a human agent.',
  ];

  return {
    response: genericResponses[Math.floor(Math.random() * genericResponses.length)],
    confidence: 0.3,
    shouldEscalate: false,
  };
}

const quickReplies = [
  'How do I transfer money?',
  'What are the fees?',
  'How do I freeze my card?',
  'I need to speak to a human',
];

const ticketCategories = [
  { id: 'account', label: 'Account Issue' },
  { id: 'transfer', label: 'Transfer Problem' },
  { id: 'card', label: 'Card Issue' },
  { id: 'crypto', label: 'Crypto Question' },
  { id: 'investment', label: 'Investment' },
  { id: 'loan', label: 'Loan' },
  { id: 'technical', label: 'Technical' },
  { id: 'other', label: 'Other' },
] as const;

export default function ChatScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'ai';

  const {
    user, chatRooms, chatMessages, addChatMessage,
    aiConversations, currentAIConversation, isAIThinking, isHumanHandoff,
    startAIConversation, addAIMessage, setAIThinking, escalateToHuman,
    supportTickets, addSupportTicket,
  } = useStore();

  const [messageText, setMessageText] = useState('');
  const [chatMode, setChatMode] = useState<'ai' | 'human' | 'tickets' | 'faq'>(
    initialMode === 'human' ? 'human' : initialMode === 'tickets' ? 'tickets' : initialMode === 'faq' ? 'faq' : 'ai'
  );
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState<string>('account');
  const [ticketPriority, setTicketPriority] = useState<string>('medium');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [ticketReply, setTicketReply] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const userRoom = chatRooms.find((r) => r.userId === user?.id);
  const roomMessages = chatMessages.filter((m) => m.roomId === userRoom?.id);

  const currentConversation = aiConversations.find((c) => c.id === currentAIConversation);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length, currentConversation?.messages.length, typingIndicator]);

  // Start AI conversation on mount if none exists
  useEffect(() => {
    if (user && !currentAIConversation && chatMode === 'ai') {
      startAIConversation(user.id);
    }
  }, [user, currentAIConversation, chatMode, startAIConversation]);

  // Handle AI response
  const handleAIResponse = useCallback(
    (userMsg: string) => {
      setAIThinking(true);
      setTypingIndicator(true);

      // Simulate typing delay based on response length
      const delay = Math.min(1000 + userMsg.length * 20, 3000);

      setTimeout(() => {
        const { response, confidence, shouldEscalate } = generateAIResponse(userMsg);

        const aiMessage = {
          id: `ai_resp_${Date.now()}`,
          role: 'assistant' as const,
          content: response,
          timestamp: new Date().toISOString(),
          confidence,
        };

        if (currentAIConversation) {
          addAIMessage(currentAIConversation, aiMessage);
        }

        setAIThinking(false);
        setTypingIndicator(false);

        if (shouldEscalate) {
          setTimeout(() => {
            escalateToHuman(currentAIConversation || '');
            setChatMode('human');
          }, 2000);
        }
      }, delay);
    },
    [currentAIConversation, addAIMessage, setAIThinking, escalateToHuman]
  );

  const handleSend = () => {
    if (!messageText.trim() || !user) return;

    if (chatMode === 'ai') {
      // Send AI message
      const userMessage = {
        id: `ai_user_${Date.now()}`,
        role: 'user' as const,
        content: messageText,
        timestamp: new Date().toISOString(),
      };

      if (currentAIConversation) {
        addAIMessage(currentAIConversation, userMessage);
      }

      const text = messageText;
      setMessageText('');
      handleAIResponse(text);
    } else if (chatMode === 'human') {
      // Send to human support
      const roomId = userRoom?.id || 'room_user';
      const newMessage = {
        id: `msg_${Date.now()}`,
        roomId,
        senderId: user.id,
        senderType: 'user' as const,
        senderName: user.fullName,
        content: messageText,
        createdAt: new Date().toISOString(),
      };

      addChatMessage(newMessage);
      setMessageText('');
    }
  };

  const handleCreateTicket = () => {
    if (!ticketSubject.trim() || !ticketDescription.trim() || !user) return;

    const newTicket = {
      id: `ticket_${Date.now()}`,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      subject: ticketSubject,
      description: ticketDescription,
      category: ticketCategory as any,
      priority: ticketPriority as any,
      status: 'open' as const,
      messages: [
        {
          id: `tm_${Date.now()}`,
          ticketId: `ticket_${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          senderType: 'system' as const,
          content: `Ticket created. A support agent will respond shortly.`,
          createdAt: new Date().toISOString(),
        },
      ] satisfies import('@/types').TicketMessage[],
      attachments: attachedFiles,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addSupportTicket(newTicket);
    setShowTicketForm(false);
    setTicketSubject('');
    setTicketDescription('');
    setAttachedFiles([]);
    setChatMode('tickets');
    setSelectedTicket(newTicket.id);
  };

  const handleTicketReply = () => {
    if (!ticketReply.trim() || !selectedTicket || !user) return;

    const message = {
      id: `tm_${Date.now()}`,
      ticketId: selectedTicket,
      senderId: user.id,
      senderName: user.fullName,
      senderType: 'user' as const,
      content: ticketReply,
      createdAt: new Date().toISOString(),
    };

    useStore.getState().addTicketMessage(selectedTicket, message);
    setTicketReply('');
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) continue; // 5MB limit
      setAttachedFiles((prev) => [...prev, file.name]);
    }
    setShowAttachmentMenu(false);
  };

  const currentTicket = supportTickets.find((t) => t.id === selectedTicket);

  if (!user) return null;

  return (
    <div className="h-[calc(100dvh-7rem)] flex flex-col animate-fade-in relative">
      {/* Header */}
      <div className="p-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/app')}
            className="w-9 h-9 glass-button rounded-full flex items-center justify-center flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-[#0A0A0A]" />
          </motion.button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              {chatMode === 'ai' && <Bot className="w-5 h-5 text-[#A8E6CF]" />}
              {chatMode === 'human' && <Headphones className="w-5 h-5 text-[#DDA0DD]" />}
              {chatMode === 'tickets' && <Ticket className="w-5 h-5 text-[#F4F7C0]" />}
              {chatMode === 'faq' && <HelpCircle className="w-5 h-5 text-[#C8D9C4]" />}
              <h1 className="text-lg font-medium text-[#0A0A0A]">
                {chatMode === 'ai' && 'AI Assistant'}
                {chatMode === 'human' && 'Live Support'}
                {chatMode === 'tickets' && 'My Tickets'}
                {chatMode === 'faq' && 'Help Center'}
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              {chatMode === 'ai' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#A8E6CF]" />
                  <span className="text-xs text-[#0A0A0A]/50">
                    {isAIThinking ? 'Thinking...' : isHumanHandoff ? 'Handing off to human...' : 'Online'}
                  </span>
                </>
              )}
              {chatMode === 'human' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
                  <span className="text-xs text-[#0A0A0A]/50">
                    {isHumanHandoff ? 'Connecting to agent...' : 'Agent online'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="w-9 h-9 glass-button rounded-full flex items-center justify-center"
              aria-label="Chat options"
            >
              <ChevronDown className="w-4 h-4 text-[#0A0A0A]" />
            </motion.button>

            <AnimatePresence>
              {showAttachmentMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-12 w-48 glass-surface-strong rounded-xl p-2 shadow-xl z-50"
                >
                  {[
                    { mode: 'ai' as const, icon: Bot, label: 'AI Assistant' },
                    { mode: 'human' as const, icon: Headphones, label: 'Live Support' },
                    { mode: 'tickets' as const, icon: Ticket, label: 'My Tickets' },
                    { mode: 'faq' as const, icon: HelpCircle, label: 'Help Center' },
                  ].map((option) => (
                    <button
                      key={option.mode}
                      onClick={() => {
                        setChatMode(option.mode);
                        setShowAttachmentMenu(false);
                        setShowTicketForm(false);
                        setSelectedTicket(null);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 p-2.5 rounded-lg text-left transition-colors',
                        chatMode === option.mode ? 'bg-[#A8E6CF]/20' : 'hover:bg-white/10'
                      )}
                    >
                      <option.icon className="w-4 h-4 text-[#0A0A0A]/60" />
                      <span className="text-sm text-[#0A0A0A]">{option.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 scrollbar-hide">
        {/* AI Chat Mode */}
        {chatMode === 'ai' && currentConversation && (
          <>
            {currentConversation.messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index === currentConversation.messages.length - 1 ? 0.1 : 0 }}
                className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : '')}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    msg.role === 'user' ? 'bg-[#DDA0DD]/30' : 'bg-[#A8E6CF]/30'
                  )}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-[#0A0A0A]" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
                  )}
                </div>
                <GlassSurface
                  className={cn(
                    'px-4 py-3 rounded-2xl max-w-[80%]',
                    msg.role === 'user' ? 'rounded-tr-none bg-[#DDA0DD]/20' : 'rounded-tl-none'
                  )}
                >
                  <p className="text-sm text-[#0A0A0A] whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[10px] text-[#0A0A0A]/30 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </GlassSurface>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {typingIndicator && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-[#A8E6CF]/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
                </div>
                <GlassSurface className="px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#0A0A0A]/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#0A0A0A]/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#0A0A0A]/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </GlassSurface>
              </motion.div>
            )}

            {/* Quick Replies */}
            {!isAIThinking && !typingIndicator && (
              <div className="flex flex-wrap gap-2 pl-10">
                {quickReplies.map((reply) => (
                  <motion.button
                    key={reply}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setMessageText(reply);
                      setTimeout(() => {
                        const userMessage = {
                          id: `ai_user_${Date.now()}`,
                          role: 'user' as const,
                          content: reply,
                          timestamp: new Date().toISOString(),
                        };
                        if (currentAIConversation) {
                          addAIMessage(currentAIConversation, userMessage);
                        }
                        handleAIResponse(reply);
                      }, 50);
                    }}
                    className="glass-pill px-3 py-2 text-xs font-medium text-[#0A0A0A]/70 hover:text-[#0A0A0A] hover:bg-white/30 transition-colors"
                  >
                    {reply}
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Human Chat Mode */}
        {chatMode === 'human' && (
          <>
            {/* Welcome Message */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-[#DDA0DD]/30 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-4 h-4 text-[#0A0A0A]" />
              </div>
              <GlassSurface className="px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%]">
                <p className="text-sm text-[#0A0A0A]">
                  Hello {user.fullName.split(' ')[0]}! You are now connected with our support team. How can we help you today?
                </p>
              </GlassSurface>
            </motion.div>

            {roomMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-2', msg.senderType === 'user' ? 'flex-row-reverse' : '')}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    msg.senderType === 'user' ? 'bg-[#DDA0DD]/30' : 'bg-[#A8E6CF]/30'
                  )}
                >
                  {msg.senderType === 'user' ? (
                    <User className="w-4 h-4 text-[#0A0A0A]" />
                  ) : (
                    <Headphones className="w-4 h-4 text-[#0A0A0A]" />
                  )}
                </div>
                <GlassSurface
                  className={cn(
                    'px-4 py-3 rounded-2xl max-w-[80%]',
                    msg.senderType === 'user' ? 'rounded-tr-none bg-[#DDA0DD]/20' : 'rounded-tl-none'
                  )}
                >
                  <p className="text-sm text-[#0A0A0A]">{msg.content}</p>
                  <p className="text-[10px] text-[#0A0A0A]/30 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </GlassSurface>
              </motion.div>
            ))}
          </>
        )}

        {/* Tickets Mode */}
        {chatMode === 'tickets' && !selectedTicket && (
          <div className="space-y-3">
            {/* Create Ticket Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTicketForm(true)}
              className="w-full glass-card p-4 flex items-center gap-3 text-left hover:bg-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#A8E6CF]/30 flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0A0A0A]">Create New Ticket</p>
                <p className="text-xs text-[#0A0A0A]/50">Get help from our support team</p>
              </div>
            </motion.button>

            {/* Ticket List */}
            {supportTickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 text-[#0A0A0A]/20 mx-auto mb-3" />
                <p className="text-sm text-[#0A0A0A]/50">No tickets yet</p>
              </div>
            ) : (
              supportTickets.map((ticket) => (
                <motion.button
                  key={ticket.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className="w-full glass-card p-4 text-left hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A0A0A] truncate">{ticket.subject}</p>
                      <p className="text-xs text-[#0A0A0A]/50">{ticket.category}</p>
                    </div>
                    <GlassBadge
                      variant={
                        ticket.status === 'open'
                          ? 'yellow'
                          : ticket.status === 'in_progress'
                            ? 'green'
                            : ticket.status === 'resolved'
                              ? 'mint'
                              : 'default'
                      }
                      size="sm"
                    >
                      {ticket.status}
                    </GlassBadge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#0A0A0A]/40">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    <span>{ticket.messages.length} messages</span>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        )}

        {/* Selected Ticket View */}
        {chatMode === 'tickets' && selectedTicket && currentTicket && (
          <div className="space-y-3">
            {/* Ticket Header */}
            <div className="flex items-center gap-2 mb-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedTicket(null)} className="w-8 h-8 glass-button rounded-full flex items-center justify-center">
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0A0A0A] truncate">{currentTicket.subject}</p>
              </div>
              <GlassBadge
                variant={
                  currentTicket.status === 'open'
                    ? 'yellow'
                    : currentTicket.status === 'in_progress'
                      ? 'green'
                      : 'mint'
                }
                size="sm"
              >
                {currentTicket.status}
              </GlassBadge>
            </div>

            {/* Messages */}
            {currentTicket.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex gap-2',
                  msg.senderType === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    msg.senderType === 'user'
                      ? 'bg-[#DDA0DD]/30'
                      : msg.senderType === 'agent'
                        ? 'bg-[#A8E6CF]/30'
                        : 'bg-[#0A0A0A]/10'
                  )}
                >
                  {msg.senderType === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : msg.senderType === 'agent' ? (
                    <Headphones className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <GlassSurface
                  className={cn(
                    'px-4 py-3 rounded-2xl max-w-[80%]',
                    msg.senderType === 'user' ? 'rounded-tr-none bg-[#DDA0DD]/20' : 'rounded-tl-none'
                  )}
                >
                  <p className="text-sm text-[#0A0A0A]">{msg.content}</p>
                  <p className="text-[10px] text-[#0A0A0A]/30 mt-1">
                    {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </GlassSurface>
              </motion.div>
            ))}
          </div>
        )}

        {/* FAQ Mode */}
        {chatMode === 'faq' && (
          <div className="space-y-2">
            {Object.entries(aiKnowledgeBase).map(([topic, answer], index) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-4">
                  <h3 className="text-sm font-medium text-[#0A0A0A] capitalize mb-1">
                    {topic.replace('_', ' ')}
                  </h3>
                  <p className="text-xs text-[#0A0A0A]/60 leading-relaxed">{answer}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ticket Form Modal */}
      <AnimatePresence>
        {showTicketForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end"
            onClick={() => setShowTicketForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full bg-white rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-[#0A0A0A]/20 rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">Create Support Ticket</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#0A0A0A]/50 mb-1 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {ticketCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setTicketCategory(cat.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                          ticketCategory === cat.id ? 'bg-[#0A0A0A] text-white' : 'glass-button text-[#0A0A0A]/50'
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#0A0A0A]/50 mb-1 block">Priority</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'low', label: 'Low', color: 'bg-[#A8E6CF]' },
                      { value: 'medium', label: 'Medium', color: 'bg-[#F4F7C0]' },
                      { value: 'high', label: 'High', color: 'bg-[#DDA0DD]' },
                      { value: 'urgent', label: 'Urgent', color: 'bg-[#FF6B6B]' },
                    ].map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setTicketPriority(p.value)}
                        className={cn(
                          'flex-1 py-2 rounded-xl text-xs font-medium transition-all',
                          ticketPriority === p.value ? 'ring-2 ring-[#0A0A0A]' : ''
                        )}
                        style={{ backgroundColor: p.color }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#0A0A0A]/50 mb-1 block">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm text-[#0A0A0A]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#0A0A0A]/50 mb-1 block">Description</label>
                  <textarea
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Please provide detailed information about your issue..."
                    rows={4}
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm text-[#0A0A0A] resize-none"
                  />
                </div>

                {/* Attachments */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 bg-[#A8E6CF]/20 rounded-lg text-xs">
                        <FileText className="w-3 h-3" />
                        {file}
                        <button onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}>
                          <X className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-3 glass-button rounded-xl text-sm text-[#0A0A0A]/60"
                  >
                    <Paperclip className="w-4 h-4" />
                    Attach
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileAttach}
                    className="hidden"
                  />
                  <GlassButton
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowTicketForm(false)}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    className="flex-1"
                    disabled={!ticketSubject.trim() || !ticketDescription.trim()}
                    onClick={handleCreateTicket}
                  >
                    Submit Ticket
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area - only for chat modes */}
      {(chatMode === 'ai' || chatMode === 'human' || (chatMode === 'tickets' && selectedTicket)) && (
        <div className="p-3 flex-shrink-0">
          <div className="flex items-center gap-2 glass-surface-strong rounded-2xl px-4 py-2">
            {/* Attachment button for human chat */}
            {chatMode === 'human' && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 flex items-center justify-center text-[#0A0A0A]/30 hover:text-[#0A0A0A]/60 flex-shrink-0"
                aria-label="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileAttach}
              className="hidden"
            />

            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                chatMode === 'ai'
                  ? 'Ask me anything...'
                  : chatMode === 'tickets'
                    ? 'Reply to ticket...'
                    : 'Type a message...'
              }
              className="flex-1 bg-transparent text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/30 outline-none min-w-0"
            />

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={chatMode === 'tickets' && selectedTicket ? handleTicketReply : handleSend}
              disabled={!messageText.trim()}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0',
                messageText.trim() ? 'bg-[#0A0A0A] text-white' : 'bg-[#0A0A0A]/10 text-[#0A0A0A]/30'
              )}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
