'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Cloud,
  AlertCircle,
  User,
  Phone,
  Building,
  MapPin,
  ArrowRight,
  LogIn,
  CheckCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phonenumber: '',
    companyname: '',
    address1: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.firstname.trim()) newErrors.firstname = 'Required';
    if (!formData.lastname.trim()) newErrors.lastname = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    if (!formData.password) newErrors.password = 'Required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await apiFetch<{ ok: boolean; role?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
          phonenumber: formData.phonenumber || undefined,
          companyname: formData.companyname || undefined,
          address1: formData.address1 || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          postcode: formData.postcode || undefined,
          country: formData.country || undefined,
        }),
      });

      if (result.ok && result.role) {
        router.push(result.role === 'admin' ? '/admin' : '/panel');
      } else {
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ 
    name, 
    label, 
    type = 'text', 
    placeholder, 
    required = false,
    icon: Icon,
  }: { 
    name: keyof typeof formData; 
    label: string; 
    type?: string; 
    placeholder: string; 
    required?: boolean;
    icon?: React.ElementType;
  }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[var(--foreground)] mb-2">
        {label} {required && <span className="text-[var(--error)]">*</span>}
      </label>
      <div className="input-with-icon">
        {Icon && <Icon className="input-icon w-4 h-4" />}
        <input
          id={name}
          name={name}
          type={type}
          className={`input ${errors[name] ? 'border-[var(--error)]' : ''}`}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          disabled={loading}
          required={required}
        />
      </div>
      {errors[name] && (
        <p className="text-xs text-[var(--error)] mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] py-12">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8"
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] mb-6 shadow-lg shadow-blue-500/20"
            >
              <Cloud className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Create your account</h1>
            <p className="text-[var(--foreground-muted)]">Get started with your free account today</p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-[var(--error-soft)] border border-[var(--error)]/30"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0" />
                <p className="text-sm text-[var(--error)]">{errors.submit}</p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField 
                name="firstname" 
                label="First name" 
                placeholder="John" 
                required 
                icon={User}
              />
              <InputField 
                name="lastname" 
                label="Last name" 
                placeholder="Doe" 
                required 
                icon={User}
              />
            </div>

            {/* Email */}
            <InputField 
              name="email" 
              label="Email address" 
              type="email" 
              placeholder="you@example.com" 
              required 
              icon={Mail}
            />

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Password <span className="text-[var(--error)]">*</span>
                </label>
                <div className="input-with-icon">
                  <Lock className="input-icon w-4 h-4" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`input pr-12 ${errors.password ? 'border-[var(--error)]' : ''}`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-[var(--error)] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Confirm Password <span className="text-[var(--error)]">*</span>
                </label>
                <div className="input-with-icon">
                  <Lock className="input-icon w-4 h-4" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input pr-12 ${errors.confirmPassword ? 'border-[var(--error)]' : ''}`}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-[var(--error)] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Optional Fields Toggle */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <span>{showOptional ? 'Hide' : 'Show'} optional information</span>
                <ArrowRight 
                  className={`w-4 h-4 transition-transform ${showOptional ? 'rotate-90' : ''}`} 
                />
              </button>
            </div>

            {/* Optional Fields */}
            {showOptional && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField 
                    name="phonenumber" 
                    label="Phone number" 
                    type="tel" 
                    placeholder="+1 555 123 4567" 
                    icon={Phone}
                  />
                  <InputField 
                    name="companyname" 
                    label="Company name" 
                    placeholder="Acme Inc." 
                    icon={Building}
                  />
                </div>
                <InputField 
                  name="address1" 
                  label="Address" 
                  placeholder="123 Main St" 
                  icon={MapPin}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <InputField name="city" label="City" placeholder="New York" />
                  <InputField name="state" label="State" placeholder="NY" />
                  <InputField name="postcode" label="Postal code" placeholder="10001" />
                </div>
                <InputField name="country" label="Country" placeholder="United States" />
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-[var(--surface-1)] text-[var(--foreground-muted)]">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:underline"
            >
              <LogIn className="w-4 h-4" />
              Sign in to your account
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-[var(--foreground-subtle)]"
        >
          <p>
            By creating an account, you agree to our{' '}
            <Link href="#" className="text-[var(--accent-primary)] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-[var(--accent-primary)] hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
