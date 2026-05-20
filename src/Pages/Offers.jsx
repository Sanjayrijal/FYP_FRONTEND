import { useEffect, useState } from "react";
import Footer from "../Components/Footer/Footer";

export default function Offers() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    // Sample offers data - you can replace this with API calls
    const sampleOffers = [
      {
        id: 1,
        title: "Weekend Special - 20% Off",
        description: "Get 20% discount on all bookings during weekends",
        discount: "20%",
        expires: "2025-04-30",
        code: "WEEKEND20",
        image: "/images/offer1.jpg",
      },
      {
        id: 2,
        title: "Group Booking - Buy 4, Get 1 Free",
        description: "Book 4 hours and get 1 hour free for groups",
        discount: "5 Hours",
        expires: "2025-05-15",
        code: "GROUP5",
        image: "/images/offer2.jpg",
      },
      {
        id: 3,
        title: "Morning Sessions - 15% Off",
        description: "Early bird special for bookings before 12 PM",
        discount: "15%",
        expires: "2025-04-30",
        code: "MORNING15",
        image: "/images/offer3.jpg",
      },
      {
        id: 4,
        title: "New User Welcome Offer",
        description: "First booking gets 30% discount",
        discount: "30%",
        expires: "2025-06-01",
        code: "WELCOME30",
        image: "/images/offer4.jpg",
      },
      {
        id: 5,
        title: "Monthly Membership - Save More",
        description: "Unlimited bookings with monthly membership",
        discount: "Unlimited",
        expires: "2025-12-31",
        code: "MONTHLY",
        image: "/images/offer5.jpg",
      },
      {
        id: 6,
        title: "Referral Program - Earn Credits",
        description: "Refer a friend and earn booking credits",
        discount: "Credits",
        expires: "2025-12-31",
        code: "REFER",
        image: "/images/offer6.jpg",
      },
    ];
    setOffers(sampleOffers);
  }, []);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Code ${code} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Offers" }]}
      />

      <div className="flex-1 p-4 sm:p-6 md:p-10">
        <div className="mb-8 md:mb-12">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Special Offers
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Grab amazing discounts
          </p>
        </div>

        {offers.length === 0 && (
          <p className="text-center text-gray-500 mt-20">
            No offers available at the moment.
          </p>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Offer Image */}
              <div className="relative h-40 sm:h-48 bg-blue-900  flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white text-3xl sm:text-4xl font-bold">
                    {offer.discount}
                  </p>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    {offer.expires}
                  </p>
                </div>
              </div>

              {/* Offer Details */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {offer.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  {offer.description}
                </p>

                {/* Promo Code */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={offer.code}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono text-center text-gray-800"
                  />
                  <button
                    onClick={() => copyCode(offer.code)}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>

                {/* Book Now Button */}
                <button className="w-full py-2 sm:py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded font-medium text-sm sm:text-base hover:shadow-md transition-shadow">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>

      <Footer />
    </div>
  );
}
