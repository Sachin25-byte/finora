import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Mail } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsSubmitting(true);
    setError('');

    const { error: resetError } = await resetPassword(data.email);

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E40AF] via-[#2563EB] to-[#60A5FA] flex items-center justify-center shadow-xs">
              <span className="text-white font-extrabold text-lg">F</span>
            </div>
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight">Finora</span>
          </div>
          <p className="text-xs text-[#64748B] font-medium">Reset your account password</p>
        </div>

        <div className="card p-6 shadow-sm border-[#E5E7EB]">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-1">Check your email</h3>
              <p className="text-xs text-[#64748B] mb-5">
                We've sent a password reset link to your email address.
              </p>
              <Link to="/login" className="btn-primary w-full py-2">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="label-text">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@company.com"
                    className="input-field pl-9"
                  />
                </div>
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-2.5 mt-2"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
