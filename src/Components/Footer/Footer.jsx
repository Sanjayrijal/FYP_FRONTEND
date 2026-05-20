export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 sm:pt-16 md:pt-16 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand Section */}
          <div className="col-span-1">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              <span className="text-blue-500">Kick</span>Hub
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-4">
              Explore and book futsal courts in your area. Connect with venues
              and enjoy quality sports facilities.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-500 transition text-lg"
              >
                f
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-500 transition text-lg"
              >
                📷
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-500 transition text-lg"
              >
                𝕏
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-500 transition text-lg"
              >
                in
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-3 sm:mb-4 text-xs sm:text-sm tracking-widest">
              QUICK LINKS
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <a
                  href="/Explore"
                  className="text-gray-400 hover:text-white transition text-xs sm:text-sm"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/Explore"
                  className="text-gray-400 hover:text-white transition text-xs sm:text-sm"
                >
                  Explore Courts
                </a>
              </li>
              <li>
                <a
                  href="/Bookings"
                  className="text-gray-400 hover:text-white transition text-xs sm:text-sm"
                >
                  Bookings
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-xs sm:text-sm"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-white mb-3 sm:mb-4 text-xs sm:text-sm tracking-widest">
              LEGAL
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-xs sm:text-sm"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-xs sm:text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-xs sm:text-sm"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-xs sm:text-sm"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-3 sm:mb-4 text-xs sm:text-sm tracking-widest">
              CONTACT US
            </h3>
            <ul className="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
              <li>Kathmandu, Nepal</li>
              <li>
                <a
                  href="mailto:kickhub@gmail.com"
                  className="hover:text-white transition"
                >
                  kickhub@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+977-1-1234567"
                  className="hover:text-white transition"
                >
                  +977-1-1234567
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6 sm:pt-8">
          <p className="text-center text-gray-500 text-xs sm:text-sm">
            © 2025 KickHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
