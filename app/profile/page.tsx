'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainNav } from '@/components/main-nav';
import { User } from '@/lib/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle, ArrowLeft, CrownIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { isValidFullName, isValidPhone } from '@/lib/validations';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    country: '',
    city: '',
    mobile_number: '',
  });
  const [accountType, setAccountType] = useState(0); // 0 = Free, 1 = Pro

  const [errors, setErrors] = useState({
    full_name: '',
    country: '',
    city: '',
    mobile_number: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        // Fetch user data
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user data:', error);
          setServerError('Failed to load profile data. Please try again later.');
        } else if (userData) {
          setUser(userData);
          setFormData({
            full_name: userData.full_name || '',
            email: userData.email || '',
            country: userData.country || '',
            city: userData.city || '',
            mobile_number: userData.mobile_number || '',
          });
          setAccountType(userData.account_type || 0);
        }
      } catch (error) {
        console.error('Profile page error:', error);
        setServerError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field being edited
    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear any success/error messages when user starts editing
    setSuccessMessage('');
    setServerError('');
  };
  
  const validateForm = () => {
    const newErrors = {
      full_name: !formData.full_name 
        ? 'Full name is required' 
        : !isValidFullName(formData.full_name)
          ? 'Please enter your first and last name'
          : '',
      country: !formData.country ? 'Country is required' : '',
      city: !formData.city ? 'City is required' : '',
      mobile_number: !formData.mobile_number 
        ? 'Mobile number is required' 
        : !isValidPhone(formData.mobile_number)
          ? 'Please enter a valid mobile number'
          : '',
    };
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setSuccessMessage('');
    setServerError('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      // Update user data
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          country: formData.country,
          city: formData.city,
          mobile_number: formData.mobile_number,
          // Note: email is not updated
        })
        .eq('id', session.user.id);
        
      if (error) {
        console.error('Error updating profile:', error);
        setServerError(error.message || 'Failed to update profile. Please try again.');
      } else {
        setSuccessMessage('Profile updated successfully!');
        
        // Update local user data
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            full_name: formData.full_name,
            country: formData.country,
            city: formData.city,
            mobile_number: formData.mobile_number,
          };
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <MainNav />
      <div className="container mx-auto px-4 pt-24 lg:pt-24 lg:pl-60">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link 
                href="/" 
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to home
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground mt-2">View and edit your profile information</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information here. Your email address cannot be changed.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={errors.full_name ? "border-red-300" : ""}
                    />
                    {errors.full_name && (
                      <p className="text-xs text-red-500">{errors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      className="bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        placeholder="United States"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={errors.country ? "border-red-300" : ""}
                      />
                      {errors.country && (
                        <p className="text-xs text-red-500">{errors.country}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={errors.city ? "border-red-300" : ""}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-500">{errors.city}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile_number">Mobile Number</Label>
                    <Input
                      id="mobile_number"
                      name="mobile_number"
                      placeholder="+1 123 456 7890"
                      value={formData.mobile_number}
                      onChange={handleInputChange}
                      className={errors.mobile_number ? "border-red-300" : ""}
                    />
                    {errors.mobile_number && (
                      <p className="text-xs text-red-500">{errors.mobile_number}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type</Label>
                    <div className="flex items-center space-x-4">
                      <Badge className={accountType === 1 ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}>
                        {accountType === 1 ? 'Pro Version' : 'Free Version'}
                      </Badge>
                      {accountType === 0 && (
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          size="sm"
                          onClick={() => router.push('/pricing')}
                        >
                          <CrownIcon className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      )}
                    </div>
                    {accountType === 1 && (
                      <p className="text-xs text-green-600">
                        You are enjoying all premium features with your Pro account
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end space-x-4 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/')}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? <Spinner size="sm" className="mr-2" /> : null}
                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
      </div>
    </>
  );
} 