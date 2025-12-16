'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    required = false 
  }: { 
    name: keyof typeof formData; 
    label: string; 
    type?: string; 
    placeholder: string; 
    required?: boolean;
  }) => (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-[#888] mb-1.5">
        {label} {required && <span className="text-[#666]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`w-full px-3 py-2 text-sm bg-black border rounded-md text-white placeholder-[#666] focus:outline-none focus:border-[#666] transition-colors ${
          errors[name] ? 'border-[#7f1d1d]' : 'border-[#333]'
        }`}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        disabled={loading}
      />
      {errors[name] && <p className="text-xs text-[#f87171] mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full mb-4">
            <svg className="w-5 h-5 text-black" viewBox="0 0 76 65" fill="currentColor">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-white">Create your account</h1>
        </div>

        {/* Form */}
        <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <InputField name="firstname" label="First name" placeholder="John" required />
              <InputField name="lastname" label="Last name" placeholder="Doe" required />
            </div>

            {/* Email */}
            <InputField name="email" label="Email" type="email" placeholder="you@example.com" required />

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-[#888] mb-1.5">
                  Password <span className="text-[#666]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-3 py-2 text-sm bg-black border rounded-md text-white placeholder-[#666] focus:outline-none focus:border-[#666] transition-colors pr-9 ${
                      errors.password ? 'border-[#7f1d1d]' : 'border-[#333]'
                    }`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <svg className="w-3.5 h-3.5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="text-xs text-[#f87171] mt-1">{errors.password}</p>}
              </div>
              <InputField name="confirmPassword" label="Confirm" type="password" placeholder="••••••••" required />
            </div>

            {/* Optional Fields */}
            <div className="pt-2 border-t border-[#222]">
              <p className="text-xs text-[#666] mb-3">Optional information</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InputField name="phonenumber" label="Phone" type="tel" placeholder="+1 555 123 4567" />
                  <InputField name="companyname" label="Company" placeholder="Acme Inc." />
                </div>
                <InputField name="address1" label="Address" placeholder="123 Main St" />
                <div className="grid grid-cols-3 gap-3">
                  <InputField name="city" label="City" placeholder="New York" />
                  <InputField name="state" label="State" placeholder="NY" />
                  <InputField name="postcode" label="Postal" placeholder="10001" />
                </div>
                <InputField name="country" label="Country" placeholder="United States" />
              </div>
            </div>

            {errors.submit && (
              <div className="bg-[#2a0a0a] border border-[#3d0f0f] rounded-md px-3 py-2">
                <p className="text-xs text-[#f87171]">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-[#e5e5e5] text-black text-sm font-medium py-2 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#666] mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
