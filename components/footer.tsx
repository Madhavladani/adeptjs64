import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand and description */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/favicon.png"
                alt="AdeptUI Logo"
                width={24}
                height={24}
                className="mr-2"
              />
              <span className="text-xl font-bold">AdeptUI</span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              Discover, copy, and use UI components in Figma, Framer, and 
              Webflow effortlessly. Access a curated collection of essentials—from 
              buttons to data visualizations—and integrate them into your projects 
              with just a few clicks.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-gray-900 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/cookie-policy" className="text-gray-600 hover:text-gray-900 transition">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/licensing-agreement" className="text-gray-600 hover:text-gray-900 transition">
                  Licensing Agreement
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-gray-600 hover:text-gray-900 transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 mt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            © 2025 AdeptUI. Some rights reserved. Most content is licensed under{' '}
            <Link href="https://creativecommons.org/licenses/by/4.0/" className="text-gray-600 hover:underline">
              CC BY 4.0 License
            </Link>
            {' '}(Creative Commons Attribution 4.0 International), unless stated otherwise.
          </p>
        </div>
      </div>
    </footer>
  );
} 