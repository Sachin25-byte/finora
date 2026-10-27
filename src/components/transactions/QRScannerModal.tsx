import React, { useState } from 'react';
import { Modal } from '../ui/shared';
import { QrCode, Camera, Upload, Sparkles, CheckCircle2, Zap } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (data: { amount: string; description: string; payee: string; paymentMethod: string }) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanResult }: QRScannerModalProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [simulatedPayee, setSimulatedPayee] = useState('Swiggy / Instamart');
  const [simulatedAmount, setSimulatedAmount] = useState('420.00');

  if (!isOpen) return null;

  const handleApplyScan = (payee: string, amount: string) => {
    onScanResult({
      amount,
      description: `UPI Payment to ${payee}`,
      payee,
      paymentMethod: 'upi',
    });
    onClose();
  };

  return (
    <Modal
      title="Scan UPI QR Code"
      subtitle="Point camera at any BharatPe, Paytm, PhonePe, or GPay QR code"
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Camera Viewfinder */}
        <div className="relative rounded-2xl bg-[var(--bg-muted)] border-2 border-[var(--border-color)] overflow-hidden aspect-video flex flex-col items-center justify-center p-6 text-center group">
          {/* Animated Scanning Laser */}
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent animate-pulse shadow-sm shadow-[var(--primary)]" />

          {/* Viewfinder Corner Brackets */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[var(--primary)] rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[var(--primary)] rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[var(--primary)] rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[var(--primary)] rounded-br-lg" />

          {/* Center Target Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary-light)] border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] shadow-sm mb-3">
            <QrCode className="w-8 h-8 animate-pulse" />
          </div>

          <p className="text-xs font-semibold text-[var(--text-main)]">
            Align QR Code within the frame
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Finora AI will automatically parse UPI payee and transaction amount
          </p>
        </div>

        {/* Quick Demo QR Presets */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Quick Auto-Scan Samples
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleApplyScan('Swiggy / Instamart', '420.00')}
              className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] text-left transition-colors flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-[var(--text-main)]">Swiggy Mart</p>
                <p className="text-[10px] text-[var(--text-muted)]">UPI QR: ₹420</p>
              </div>
              <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
            </button>

            <button
              type="button"
              onClick={() => handleApplyScan('Uber India Rides', '249.00')}
              className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] text-left transition-colors flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-[var(--text-main)]">Uber Ride</p>
                <p className="text-[10px] text-[var(--text-muted)]">UPI QR: ₹249</p>
              </div>
              <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
            </button>
          </div>
        </div>

        {/* Custom Quick Scan Input */}
        <div className="p-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-[var(--primary)] font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Fast Custom QR Simulation
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={simulatedPayee}
              onChange={(e) => setSimulatedPayee(e.target.value)}
              placeholder="Merchant / Payee Name"
              className="input-field text-xs py-1.5"
            />
            <input
              type="number"
              value={simulatedAmount}
              onChange={(e) => setSimulatedAmount(e.target.value)}
              placeholder="Amount (₹)"
              className="input-field text-xs py-1.5"
            />
          </div>
          <button
            type="button"
            onClick={() => handleApplyScan(simulatedPayee || 'UPI Merchant', simulatedAmount || '100')}
            className="btn-primary w-full text-xs py-1.5 justify-center gap-1.5 mt-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Fill Transaction with Scanned QR
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-2 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="btn-secondary text-xs">
            Close Scanner
          </button>
        </div>
      </div>
    </Modal>
  );
}
