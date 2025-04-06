'use client';

import { useState } from 'react';
import { MainNav } from '@/components/main-nav';
import { Button } from '@/components/ui/button';
import { CreditCard, Check, ArrowLeft, CrownIcon } from 'lucide-react';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function PricingPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleUpgrade = () => {
    setIsProcessing(true);
    // Here you would implement the actual payment processing logic
    setTimeout(() => {
      setIsProcessing(false);
      alert('This is a demo. In a real app, payment processing would happen here.');
    }, 1500);
  };
  
  return (
    <>
      <MainNav />
      <div className="container mx-auto px-4 pt-24 lg:pt-24 lg:pl-60">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link 
                href="/profile" 
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to profile
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Upgrade to Pro</h1>
            <p className="text-muted-foreground mt-2">Get access to all premium features</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  Free Plan
                </CardTitle>
                <CardDescription>Basic features for personal use</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Access to basic components</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Standard search functionality</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Profile customization</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  Current Plan
                </Button>
              </CardFooter>
            </Card>
            
            {/* Pro Plan */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700">
                  <CrownIcon className="h-5 w-5 mr-2 text-yellow-500" />
                  Pro Plan
                </CardTitle>
                <CardDescription>Enhanced features for power users</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$19.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Access to all premium components</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Advanced search and filters</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Early access to new features</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Custom component requests</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade Now
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>Have questions about our pricing? <a href="#" className="text-blue-600 hover:underline">Contact us</a></p>
          </div>
        </div>
      </div>
    </>
  );
} 