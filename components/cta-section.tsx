'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function CTASection() {
  return (
    <section className="bg-indigo-600 py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            className="text-3xl font-extrabold text-white sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to accelerate your design workflow?
          </motion.h2>
          
          <motion.p 
            className="mt-4 text-lg leading-6 text-indigo-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join thousands of designers and developers who are already using
            our components to build beautiful interfaces.
          </motion.p>
          
          <motion.div 
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-flex rounded-md shadow">
              <Button
                asChild
                size="lg"
                className="bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 hover:bg-white/10 "
              >
                <Link href="/signup">
                  Get started for free
                </Link>
              </Button>
            </div>
            <div className="ml-3 inline-flex">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-indigo-600 hover:bg-indigo-50 border-white hover:bg-white/10"
              >
                <Link href="/login">
                  Sign in
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 