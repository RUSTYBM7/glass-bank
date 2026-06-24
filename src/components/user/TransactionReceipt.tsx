import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, GlassButton } from '@/components/glass';
import { X, Download, Share2, Check, FileText, Copy } from 'lucide-react';
import { useStore } from '@/store';

interface TransactionReceiptProps {
  transactionId: string;
  onClose: () => void;
}

export default function TransactionReceipt({ transactionId, onClose }: TransactionReceiptProps) {
  const { generateReceipt } = useStore();
  const receiptRef = useRef<HTMLDivElement>(null);

  const receipt = generateReceipt(transactionId);

  const handleDownload = useCallback(() => {
    if (!receipt) return;

    const receiptText = `
================================
    ORBITPAY CREDIT UNION
      TRANSACTION RECEIPT
================================

Reference: ${receipt.reference}
Verification: ${receipt.verificationCode}
Date: ${new Date(receipt.timestamp).toLocaleString()}

--------------------------------
TRANSACTION DETAILS
--------------------------------
Description: ${receipt.description}
Status: ${receipt.status.toUpperCase()}

Amount: ${receipt.currency} ${receipt.amount.toFixed(2)}
Fee: ${receipt.currency} ${receipt.fee.toFixed(2)}
Total: ${receipt.currency} ${receipt.total.toFixed(2)}

--------------------------------
PARTIES
--------------------------------
From: ${receipt.senderName}
Account: ${receipt.senderAccount}

To: ${receipt.recipientName}
Account: ${receipt.recipientAccount}

--------------------------------
Thank you for banking with
OrbitPay Credit Union

${new Date().toISOString()}
================================
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [receipt]);

  const handleShare = useCallback(async () => {
    if (!receipt) return;

    const shareText = `Transaction Receipt - OrbitPay Credit Union\n\nRef: ${receipt.reference}\nAmount: ${receipt.currency} ${receipt.amount.toFixed(2)}\nTo: ${receipt.recipientName}\nStatus: ${receipt.status}\n\nVerified secure transaction.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Transaction Receipt',
          text: shareText,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  }, [receipt]);

  const handleCopyRef = useCallback(() => {
    if (!receipt) return;
    navigator.clipboard.writeText(receipt.reference);
  }, [receipt]);

  if (!receipt) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <GlassCard className="p-6 text-center">
          <FileText className="w-12 h-12 text-[#0A0A0A]/20 mx-auto mb-3" />
          <p className="text-[#0A0A0A]/50">Receipt not available</p>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Receipt */}
        <div ref={receiptRef} className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#A8E6CF] to-[#DDA0DD] p-6 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/30 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-white font-semibold text-lg">Transaction Receipt</h2>
            <p className="text-white/80 text-sm">OrbitPay Credit Union</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Amount */}
            <div className="text-center pb-4 border-b border-[#0A0A0A]/10">
              <p className="text-3xl font-light text-[#0A0A0A]">
                {receipt.currency === 'USD' ? '$' : receipt.currency === 'EUR' ? '€' : receipt.currency === 'GBP' ? '£' : '₿'}
                {receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`
                  px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${receipt.status === 'completed' ? 'bg-[#2ECC71]/15 text-[#2ECC71]' : 
                    receipt.status === 'pending' ? 'bg-[#F4F7C0] text-[#0A0A0A]' : 
                    'bg-[#FF6B6B]/15 text-[#FF6B6B]'}
                `}>
                  {receipt.status}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#0A0A0A]/40">Reference</span>
                <button onClick={handleCopyRef} className="flex items-center gap-1">
                  <span className="font-medium text-[#0A0A0A] font-mono">{receipt.reference}</span>
                  <Copy className="w-3 h-3 text-[#0A0A0A]/30" />
                </button>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#0A0A0A]/40">Verification</span>
                <span className="font-medium text-[#0A0A0A] font-mono">{receipt.verificationCode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#0A0A0A]/40">Date</span>
                <span className="font-medium text-[#0A0A0A]">
                  {new Date(receipt.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#0A0A0A]/40">From</span>
                <span className="font-medium text-[#0A0A0A] text-right">{receipt.senderName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#0A0A0A]/40">To</span>
                <span className="font-medium text-[#0A0A0A] text-right">{receipt.recipientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#0A0A0A]/40">Description</span>
                <span className="font-medium text-[#0A0A0A] text-right max-w-[50%]">{receipt.description}</span>
              </div>
            </div>

            {/* Totals */}
            <div className="pt-3 border-t border-[#0A0A0A]/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#0A0A0A]/40">Amount</span>
                <span className="text-[#0A0A0A]">{receipt.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#0A0A0A]/40">Fee</span>
                <span className="text-[#0A0A0A]">{receipt.fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-medium pt-2 border-t border-dashed border-[#0A0A0A]/10">
                <span className="text-[#0A0A0A]">Total</span>
                <span className="text-[#0A0A0A]">{receipt.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-2">
              <p className="text-[10px] text-[#0A0A0A]/30">OrbitPay Credit Union - Secure Banking</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <GlassButton
            variant="default"
            fullWidth
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/80"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Download</span>
          </GlassButton>
          <GlassButton
            variant="default"
            fullWidth
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/80"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </GlassButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
