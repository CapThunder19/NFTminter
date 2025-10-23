import { WalletConnect } from "./Walletconnect";

export default function Navbar() {
  return (
    <nav className="bg-[#0a0a0a] text-white px-6 py-4 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.25)]">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-extrabold cursor-pointer text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
          NFT Gallery
        </h1>
        {/* Navigation links */}
        <ul className="hidden md:flex gap-6">
          {["Home", "Explore", "Activity", "Community", "Contact"].map((link) => (
            <li
              key={link}
              className="hover:text-cyan-400 cursor-pointer transition-colors duration-300 font-medium"
            >
              {link}
            </li>
          ))}
        </ul>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 mx-6">
  <input
    type="text"
    placeholder="Search..."
    className="w-full rounded-xl px-4 py-2 bg-[#111111] text-white placeholder-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
  />
</div>

      {/* Right: Wallet Connect */}
      <div className="flex items-center">
        <WalletConnect />
      </div>
    </nav>
  );
}
