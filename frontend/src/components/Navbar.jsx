import { WalletConnect } from "./Walletconnect";

export default function Navbar() {
  return (
    <nav className="bg-[#1C1C2E] text-white px-6 py-4 flex items-center justify-between shadow-lg">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold cursor-pointer">NFT Gallery</h1>
        {/* Navigation links */}
        <ul className="hidden md:flex gap-6">
          <li className="hover:text-purple-400 cursor-pointer">Home</li>
          <li className="hover:text-purple-400 cursor-pointer">Explore</li>
          <li className="hover:text-purple-400 cursor-pointer">Activity</li>
          <li className="hover:text-purple-400 cursor-pointer">Community</li>
          <li className="hover:text-purple-400 cursor-pointer">Contact</li>
        </ul>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 mx-6">
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg px-4 py-2 text-black focus:outline-none"
        />
      </div>

      {/* Right: Wallet Connect */}
      <div>
        <WalletConnect />
      </div>
    </nav>
  );
}
