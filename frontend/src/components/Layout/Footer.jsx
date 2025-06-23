import React from 'react';
import { Bus, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">ZenBus</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your trusted partner for peaceful and comfortable bus travel across the country.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Book Tickets
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Cancel Booking
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Track Status
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Help & Support
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                AC Buses
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Sleeper Coaches
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Luxury Travel
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Group Booking
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-red-400" />
                <span className="text-gray-400">+1 800 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-red-400" />
                <span className="text-gray-400">support@zenbus.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-red-400" />
                <span className="text-gray-400">123 Travel Street, City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 ZenBus. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;