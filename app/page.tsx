import { Suspense } from 'react'; 
import ClientComponents from './components/client-components';
import { MainNav } from '@/components/main-nav';
import { HeroSection } from '@/components/hero-section';
import { FeaturesSection } from '@/components/features-section';
import { CTASection } from '@/components/cta-section';
import { FAQSection } from '@/components/faq-section';
import { Footer } from '@/components/footer';
import Masonry from 'react-masonry-css';

export default function Home() {
  return (
    <>
      <MainNav />
      <div className="pt-16 lg:pt-16 lg:pl-60">
        <HeroSection />
        <FeaturesSection />
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Featured Components</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our most popular components used by thousands of designers
                and developers worldwide.
              </p>
            </div>
            <Suspense fallback={<div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
              <ClientComponents />
            </Suspense>
          </div>
        </section>
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}