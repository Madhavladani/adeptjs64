'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Captcha } from '@/components/ui/captcha';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { countries } from '@/lib/countries';
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidFullName,
  passwordsMatch,
  getEmailErrorMessage,
  getPasswordErrorMessage,
  getPhoneErrorMessage,
  getFullNameErrorMessage
} from '@/lib/validations';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    country: '',
    city: '',
    mobile_number: '',
    password: '',
    confirm_password: '',
  });
  
  const [errors, setErrors] = useState({
    full_name: '',
    email: '',
    country: '',
    city: '',
    mobile_number: '',
    password: '',
    confirm_password: '',
    captcha: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDevMode] = useState(process.env.NEXT_PUBLIC_DEV_MODE === 'true');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    setErrors({
      ...errors,
      [name]: '',
    });
  };
  
  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      country: value,
    });
    
    setErrors({
      ...errors,
      country: '',
    });
  };
  
  const validateForm = () => {
    const newErrors = {
      full_name: getFullNameErrorMessage(formData.full_name),
      email: getEmailErrorMessage(formData.email),
      country: !formData.country ? 'Country is required' : '',
      city: !formData.city ? 'City is required' : '',
      mobile_number: getPhoneErrorMessage(formData.mobile_number),
      password: getPasswordErrorMessage(formData.password),
      confirm_password: !passwordsMatch(formData.password, formData.confirm_password) 
        ? 'Passwords do not match' 
        : '',
      captcha: !isCaptchaValid ? 'Please complete the captcha' : '',
    };
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleCaptchaChange = (isValid: boolean) => {
    setIsCaptchaValid(isValid);
    if (isValid) {
      setErrors({
        ...errors,
        captcha: '',
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setServerError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          country: formData.country,
          city: formData.city,
          mobile_number: formData.mobile_number,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Special handling for rate limit errors
        if (response.status === 429) {
          throw new Error(
            'Email rate limit exceeded. Please wait a few minutes before trying again, or use a different email address.'
          );
        }
        throw new Error(data.error || 'Something went wrong');
      }
      
      // Registration successful
      router.push('/login?registered=true');
    } catch (error) {
      console.error('Error during registration:', error);
      setServerError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        {/* Back button and logo */}
        <div className="flex flex-col items-center space-y-4">
          <Link href="/" className="flex flex-col items-center space-y-2">
            <div className="relative h-16 w-16">
              <Image
                src="/favicon.png"
                alt="AdeptUi Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-2xl text-blue-600">AdeptUi</span>
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
          {isDevMode && (
            <div className="mt-2 text-center">
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md inline-block">
                Dev mode active - Email verification bypassed
              </span>
            </div>
          )}
        </div>
        
        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {serverError}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                className={errors.full_name ? "border-red-500" : ""}
              />
              {errors.full_name && (
                <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="country">Country</Label>
              <Select onValueChange={handleSelectChange}>
                <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-red-500 text-xs mt-1">{errors.country}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="mobile_number">Mobile Number</Label>
              <Input
                id="mobile_number"
                name="mobile_number"
                type="tel"
                value={formData.mobile_number}
                onChange={handleInputChange}
                className={errors.mobile_number ? "border-red-500" : ""}
              />
              {errors.mobile_number && (
                <p className="text-red-500 text-xs mt-1">{errors.mobile_number}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className={errors.confirm_password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
              )}
            </div>
            
            <div>
              <Captcha onChange={handleCaptchaChange} />
              {errors.captcha && (
                <p className="text-red-500 text-xs mt-1">{errors.captcha}</p>
              )}
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing up...' : 'Sign up'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 