'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-indigo-600">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 800 800">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 60L60 0" stroke="white" strokeWidth="1" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 md:py-28 lg:py-36">
          <div className="text-center">
            <motion.h1 
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="block">Build Faster with</span>
              <span className="block mt-2">Ready-to-Use Design Components</span>
            </motion.h1>
            
            <motion.p 
              className="mt-6 max-w-2xl mx-auto text-xl text-indigo-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Find top-notch web design components and inspirations. Instantly duplicate layouts for
              Figma, Framer, & Webflow.
            </motion.p>
            
            <motion.div 
              className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="rounded-md shadow">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-semibold px-8"
                >
                  <Link href="/category/e3b2f5f8-1e23-4ed5-9354-c67025db46f7">
                    Get Started
                  </Link>
                </Button>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full bg-transparent text-white border-white hover:bg-white/10 font-semibold px-8"
                >
                  <Link href="/category/e3b2f5f8-1e23-4ed5-9354-c67025db46f7">
                    Browse Components
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 