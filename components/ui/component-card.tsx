'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Component } from '@/lib/types';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from 'next/link';

// Extended Component interface to include component_subcategories
interface ExtendedComponent extends Component {
  component_subcategories?: Array<{subcategory_id: string}>;
}

interface ComponentCardProps {
  component: ExtendedComponent;
  aspectRatio?: number;
}

export function ComponentCard({ component, aspectRatio = 75 }: ComponentCardProps) {
  const router = useRouter();
  const [processedSubcategories, setProcessedSubcategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<{[key: string]: boolean}>({
    figma: false,
    framer: false,
    webflow: false
  });
  const [loadingCode, setLoadingCode] = useState<{[key: string]: boolean}>({
    figma: false,
    framer: false,
    webflow: false
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const categories = component.categories || [];
  
  // Check user authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Process subcategories and fetch names if needed
  useEffect(() => {
    const fetchSubcategoryData = async () => {
      setIsLoading(true);
      try {
        // Look for component_subcategories join relation
        const componentSubcats = component.component_subcategories ? 
          Array.isArray(component.component_subcategories) ? 
            component.component_subcategories : 
            [] : 
          [];
        
        if (componentSubcats.length > 0) {
          // Extract subcategory IDs
          const subcategoryIds = componentSubcats
            .map((cs: any) => cs.subcategory_id)
            .filter(Boolean);
          
          if (subcategoryIds.length > 0) {
            // Fetch subcategory data from Supabase
            const { data: subcategoryData, error } = await supabase
              .from('subcategories')
              .select('id, name, category_id')
              .in('id', subcategoryIds);
              
            if (error) {
              console.error('Error fetching subcategories:', error);
              return;
            }
            
            // Use the fetched data
            setProcessedSubcategories(subcategoryData || []);
          }
        } else if (component.subcategories && Array.isArray(component.subcategories) && component.subcategories.length > 0) {
          // Use already available subcategories data if present
          setProcessedSubcategories(component.subcategories);
        }
      } catch (error) {
        console.error('Error processing subcategories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubcategoryData();
  }, [component]);

  // Reset copy status after 2 seconds
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    Object.keys(copyStatus).forEach(key => {
      if (copyStatus[key]) {
        const timer = setTimeout(() => {
          setCopyStatus(prev => ({ ...prev, [key]: false }));
        }, 2000);
        timers.push(timer);
      }
    });
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [copyStatus]);

  // Fetch code from backend API
  const fetchCodeFromAPI = async (type: 'figma' | 'framer' | 'webflow') => {
    setLoadingCode(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await fetch(`/api/components/${component.id}/code?type=${type}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error from API: ${errorData.error || 'Unknown error'}`);
        return null;
      }
      
      const data = await response.json();
      
      // Explicitly check if the code is null or undefined
      if (data.code === null || data.code === undefined) {
        console.error(`${type} code is null or undefined`);
        return null;
      }
      
      return data.code;
    } catch (error) {
      console.error(`Error fetching ${type} code:`, error);
      return null;
    } finally {
      setLoadingCode(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleCopyButtonClick = (type: 'figma' | 'framer' | 'webflow', e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If authentication status is still being checked, do nothing
    if (isLoggedIn === null) return;
    
    // Check if user is logged in
    if (!isLoggedIn) {
      // Show login dialog
      setShowLoginDialog(true);
      return;
    }
    
    // User is logged in, proceed with copy
    handleCopy(type);
  };

  const handleCopy = async (type: 'figma' | 'framer' | 'webflow') => {
    // Fetch the latest code from the API instead of using component data
    const code = await fetchCodeFromAPI(type);
    
    // Explicit check for null or undefined
    if (code === null || code === undefined || code === '') {
      console.error(`No valid ${type} code returned from API`);
      return;
    }
    
    try {
      // Use the clipboard API with the appropriate MIME type
      if (type === 'webflow') {
        // Copy as application/json
        const blob = new Blob([code], { type: 'application/json' });
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
      } else {
        // Copy as text/html for Figma and Framer
        const blob = new Blob([code], { type: 'text/html' });
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
      }
      
      setCopyStatus(prev => ({ ...prev, [type]: true }));
    } catch (err) {
      console.error(`Failed to copy ${type} code:`, err);
      // Fallback to text/plain if the advanced API fails
      try {
        await navigator.clipboard.writeText(code);
        setCopyStatus(prev => ({ ...prev, [type]: true }));
      } catch (fallbackErr) {
        console.error(`Fallback copy also failed for ${type}:`, fallbackErr);
      }
    }
  };

  const redirectToLogin = () => {
    setShowLoginDialog(false);
    router.push('/login');
  };

  // Button style variations based on platform
  const buttonStyles = {
    figma: "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100 hover:border-violet-300",
    framer: "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300",
    webflow: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300",
  };

  // SVG logos for each platform
  const FigmaLogo = () => (
    <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 24C10.2091 24 12 22.2091 12 20V16H8C5.79086 16 4 17.7909 4 20C4 22.2091 5.79086 24 8 24Z" fill="currentColor"/>
      <path d="M4 12C4 9.79086 5.79086 8 8 8H12V16H8C5.79086 16 4 14.2091 4 12Z" fill="currentColor"/>
      <path d="M4 4C4 1.79086 5.79086 0 8 0H12V8H8C5.79086 8 4 6.20914 4 4Z" fill="currentColor"/>
      <path d="M12 0H16C18.2091 0 20 1.79086 20 4C20 6.20914 18.2091 8 16 8H12V0Z" fill="currentColor"/>
      <path d="M20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12Z" fill="currentColor"/>
    </svg>
  );

  const FramerLogo = () => (
    <svg className="h-4 w-4 mr-1.5" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M 44.65 33.992 L 95.35 33.992 L 95.35 59.341 L 70 59.341 Z M 44.65 59.341 L 70 59.341 L 95.35 84.691 L 44.65 84.691 Z M 44.65 84.691 L 70 84.691 L 70 110.041 Z" fill="currentColor"></path>
    </svg>
  );

  const WebflowLogo = () => (
    <svg className="h-4 w-4 mr-1.5" viewBox="0 0 1080 674" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M1080 0L735.386 673.684H411.696L555.916 394.481H549.445C430.464 548.934 252.942 650.61 0 673.684V398.344C0 398.344 161.813 388.787 256.939 288.776H0V0.0053214H288.771V237.515L295.253 237.489L413.255 0.0053214H631.645V236.009L638.126 235.999L760.556 0H1080Z" fill="currentColor"/>
    </svg>
  );
  
  return (
    <>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card className="overflow-hidden mb-4 transition-all duration-300 hover:border-orange-500 hover:shadow-md group cursor-pointer">
      <CardContent className="p-0">
        <div 
          className="relative w-full" 
          style={{ paddingBottom: `${aspectRatio}%` }}
        >
          <Image
            src={component.image_url}
            alt={component.name}
            fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
                {/* Dark overlay with subcategory badges */}
                {!isLoading && processedSubcategories.length > 0 && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {processedSubcategories.map((subcategory: any, index: number) => (
                        <span 
                          key={index} 
                          className="text-xs px-3 py-1 bg-black/80 text-white rounded-md border border-gray-700"
                        >
                          {subcategory.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
        </div>
        <div className="p-4">
                <h3 className="font-medium mb-2">{component.name}</h3>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {component.figma_code !== null && component.figma_code !== undefined && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => handleCopyButtonClick('figma', e)}
                      disabled={loadingCode.figma}
                      className={cn(
                        "text-xs min-w-24 transition-all duration-200 shadow-sm",
                        copyStatus.figma 
                          ? "bg-green-50 border-green-200 text-green-700" 
                          : !isLoggedIn && isLoggedIn !== null
                            ? "bg-gray-50 border-gray-200 text-gray-700"
                            : buttonStyles.figma
                      )}
                    >
                      {loadingCode.figma ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          Loading...
                        </>
                      ) : copyStatus.figma ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Copied
                        </>
                      ) : !isLoggedIn && isLoggedIn !== null ? (
                        <>
                          <Lock className="h-4 w-4 mr-1.5" />
                          Copy Figma
                        </>
                      ) : (
                        <>
                          <FigmaLogo />
                          Copy Figma
                        </>
                      )}
                    </Button>
                  )}
                  
                  {component.framer_code !== null && component.framer_code !== undefined && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => handleCopyButtonClick('framer', e)}
                      disabled={loadingCode.framer}
                      className={cn(
                        "text-xs min-w-24 transition-all duration-200 shadow-sm",
                        copyStatus.framer 
                          ? "bg-green-50 border-green-200 text-green-700" 
                          : !isLoggedIn && isLoggedIn !== null
                            ? "bg-gray-50 border-gray-200 text-gray-700"
                            : buttonStyles.framer
                      )}
                    >
                      {loadingCode.framer ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          Loading...
                        </>
                      ) : copyStatus.framer ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Copied
                        </>
                      ) : !isLoggedIn && isLoggedIn !== null ? (
                        <>
                          <Lock className="h-4 w-4 mr-1.5" />
                          Copy Framer
                        </>
                      ) : (
                        <>
                          <FramerLogo />
                          Copy Framer
                        </>
                      )}
                    </Button>
                  )}
                  
                  {component.webflow_code !== null && component.webflow_code !== undefined && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => handleCopyButtonClick('webflow', e)}
                      disabled={loadingCode.webflow}
                      className={cn(
                        "text-xs min-w-24 transition-all duration-200 shadow-sm",
                        copyStatus.webflow 
                          ? "bg-green-50 border-green-200 text-green-700" 
                          : !isLoggedIn && isLoggedIn !== null
                            ? "bg-gray-50 border-gray-200 text-gray-700"
                            : buttonStyles.webflow
                      )}
                    >
                      {loadingCode.webflow ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          Loading...
                        </>
                      ) : copyStatus.webflow ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Copied
                        </>
                      ) : !isLoggedIn && isLoggedIn !== null ? (
                        <>
                          <Lock className="h-4 w-4 mr-1.5" />
                          Copy Webflow
                        </>
                      ) : (
                        <>
                          <WebflowLogo />
                          Copy Webflow
                        </>
                      )}
                    </Button>
                  )}
                </div>
        </div>
      </CardContent>
    </Card>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 border-orange-500">
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold">{component.name}</h4>
          
            {categories.length > 0 && (
              <div className="mt-2">
                <h5 className="text-xs font-medium mb-1">Categories:</h5>
                <div className="flex flex-wrap gap-1">
                  {categories.map((category: any, index: number) => (
                    <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {processedSubcategories.length > 0 && (
              <div className="mt-2">
                <h5 className="text-xs font-medium mb-1">All Subcategories ({processedSubcategories.length}):</h5>
                <div className="flex flex-wrap gap-1">
                  {processedSubcategories.map((subcategory: any, index: number) => (
                    <span key={index} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {subcategory.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {component.is_pro && (
              <div className="mt-2 text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full w-fit">
                Pro Component
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
      
      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to copy component code.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center p-6">
            <span className="text-center text-sm text-gray-600">
              Please log in to your account to access and copy component code.
            </span>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Cancel
            </Button>
            <Button onClick={redirectToLogin} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
              Log In
            </Button>
            <div className="w-full flex justify-center mt-4">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  href="/signup" 
                  onClick={() => setShowLoginDialog(false)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}