import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Mail,
  Phone,
  MapPin,
  Heart,
  Shield,
  Clock,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  ChevronRight,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Family Members", path: "/family" },
    { name: "Medical Reports", path: "/reports" },
    { name: "My Profile", path: "/profile" },
  ];

  const resources = [
    { name: "About Us", path: "/about" },
    { name: "Help Center", path: "/help" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
  ];

  const features = [
    { icon: Shield, text: "Fully Secure" },
    { icon: Heart, text: "AI Health Insights" },
    { icon: Clock, text: "24/7 Access" },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2.5 rounded-xl shadow-lg">
                <Activity className="text-white" size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  MediVault<span className="text-teal-400">AI</span>
                </h3>
                <p className="text-xs text-gray-400">Healthcare Simplified</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Your trusted platform for secure medical record storage and
              AI-powered health insights. Managing family health has never been
              easier.
            </p>

            {/* Features */}
            <div className="space-y-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="bg-teal-500/10 p-2 rounded-lg">
                    <feature.icon size={16} className="text-teal-400" />
                  </div>
                  <span className="text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <ChevronRight size={18} className="text-teal-400" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-teal-400 transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <ChevronRight size={18} className="text-teal-400" />
              Resources
            </h4>
            <ul className="space-y-3">
              {resources.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-teal-400 transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <ChevronRight size={18} className="text-teal-400" />
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <Mail
                  size={18}
                  className="text-teal-400 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-gray-400">Email</p>
                  <a
                    href="mailto:support@medivaultai.com"
                    className="text-white hover:text-teal-400 transition-colors"
                  >
                    support@medivaultai.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone
                  size={18}
                  className="text-teal-400 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-gray-400">Phone</p>
                  <a
                    href="tel:+923001234567"
                    className="text-white hover:text-teal-400 transition-colors"
                  >
                    +92 300 1234567
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin
                  size={18}
                  className="text-teal-400 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-gray-400">Location</p>
                  <p className="text-white">Karachi, Pakistan</p>
                </div>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <h5 className="text-white font-semibold text-sm mb-3">
                Follow Us
              </h5>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, link: "#" },
                  { icon: Twitter, link: "#" },
                  { icon: Instagram, link: "#" },
                  { icon: Linkedin, link: "#" },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gradient-to-br hover:from-teal-500 hover:to-cyan-600 p-2.5 rounded-lg transition-all duration-300 transform hover:scale-110"
                  >
                    <social.icon size={18} className="text-gray-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear}{" "}
              <span className="text-white font-semibold">MediVault AI</span>.
              All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/cookies"
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              <Shield size={12} className="inline mr-1.5 text-teal-400" />
              Your health data is encrypted and secured with industry-standard
              protocols
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
