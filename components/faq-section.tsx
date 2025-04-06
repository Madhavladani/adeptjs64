'use client';

import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

export function FAQSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about AdeptUI and our component library.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-medium text-gray-900">
                What design tools do you support?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                AdeptUI components are compatible with all major design tools including Figma, Adobe XD, and Sketch. 
                Our components are delivered in multiple formats to ensure you can seamlessly integrate them into your workflow.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium text-gray-900">
                What's included in the Pro version?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                The Pro version includes access to our entire library of premium components, priority support, 
                commercial licensing for all projects, regular updates, and exclusive access to new component releases before they become available to free users.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium text-gray-900">
                Can I use the components in commercial projects?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Free users can use components in personal projects, but commercial usage requires a Pro subscription. 
                With Pro, you get full commercial licensing for unlimited projects, including client work and commercial applications.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium text-gray-900">
                How often do you add new components?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                We add new components every week. Pro users get early access to all new components as they're developed, 
                while free users get access to selected new components monthly.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-medium text-gray-900">
                Do you offer customization services?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes, for enterprise clients we offer custom component development and theme customization services. 
                Contact our team directly to discuss your specific requirements and we'll provide a tailored solution.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
} 