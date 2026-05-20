import { NavLink } from "react-router-dom";

export function Landing() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/video/bgVideo.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/60 to-slate-950/85" />
      {/* <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/30 blur-3xl" /> */}

      <div className="relative z-10 mx-auto flex min-h-screen w-full flex-col px-3 pb-10 pt-4 sm:px-4 sm:pb-12 sm:pt-6 lg:px-8 lg:pb-16 lg:pt-8">
        <nav className="flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3">
          <div className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            <span className="text-blue-300">Kick</span>Hub
          </div>

          <div className="flex items-center gap-2 text-sm sm:gap-5 sm:text-base">
            <NavLink className="font-medium text-white/95" to="/">
              Home
            </NavLink>
            <NavLink
              className="text-white/80 transition-colors hover:text-white"
              to="/LoginSignup"
            >
              Venues
            </NavLink>
            <NavLink
              to="/LoginSignup"
              className="rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
            >
              Sign in
            </NavLink>
          </div>
        </nav>

        <section className="flex flex-1 items-center justify-center gap-4 py-6 sm:gap-8 sm:py-8 lg:gap-12 lg:py-14">
          <div className="w-full max-w-3xl px-2 text-center sm:px-4">
            <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl">
              <span className="text-blue-500 shadow-lg font-black">
                Book Futsal
              </span>
              <br></br>
              Courts in Nepal
            </h1>

            <p className="mt-4 mx-auto font-light max-w-3xl text-sm sm:text-base lg:text-lg text-center text-white/85">
              Discover verified courts, check live availability, and complete
              bookings in minutes. KickHub keeps your match planning smooth,
              simple, and reliable.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:gap-4 justify-center sm:mt-8">
              <NavLink
                to="/LoginSignup"
                className="rounded-lg sm:rounded-xl bg-blue-500 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30"
              >
                Start Booking
              </NavLink>
              <NavLink
                to="/LoginSignup"
                className="rounded-lg sm:rounded-xl border border-white/35 bg-white/10 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Explore Venues
              </NavLink>
            </div>

            <div className="mt-6 flex  flex-wrap gap-2 text-xs font-medium text-white/70 sm:gap-3 sm:text-sm lg:mt-8 justify-center">
              <span className="px-2 py-1 sm:px-3">Real-time slots</span>
              <span className="px-2 py-1 sm:px-3">Verified venues</span>
              <span className="px-2 py-1 sm:px-3">Fast booking flow</span>
            </div>
          </div>

          {/* <div className="mx-auto w-full max-w-md rounded-xl border rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-400">
                Live Activity
              </h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-3xl font-extrabold text-slate-900">10</p>
                <p className="mt-1 text-sm text-slate-500">Courts Open</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-3xl font-extrabold text-emerald-600">12</p>
                <p className="mt-1 text-sm text-slate-500">Booking Now</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-slate-600">Next available match</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                Today, 7:00 PM - 8:00 PM
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Popular Areas
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Kathmandu, Lalitpur, Bhaktapur
              </p>
            </div>

            <NavLink
              to="/LoginSignup"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
            >
              Book Now
            </NavLink>
          </div> */}
        </section>
      </div>
    </div>
  );
}
