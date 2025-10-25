import { WalletConnect } from "./Walletconnect";
import { useAccount } from "wagmi";
import { UserProfile } from "./UserProfile";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const location = useLocation();

  return (
    <nav className="bg-[#0a0a0a] text-white px-6 py-4 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.25)]">
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-6">
        <Link to="/" className="text-2xl font-extrabold cursor-pointer text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
          NFT Gallery
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-5 ml-6">
          <Link
            to="/"
            className={`text-gray-300 hover:text-cyan-400 transition ${
              location.pathname === "/" ? "text-cyan-400 font-semibold" : ""
            }`}
          >
            Home
          </Link>
          <Link
            to="/tickets"
            className={`text-gray-300 hover:text-cyan-400 transition ${
              location.pathname === "/tickets" ? "text-cyan-400 font-semibold" : ""
            }`}
          >
            Tickets
          </Link>
        </div>
      </div>

      {/* Right: Wallet + Profile */}
      <div className="flex items-center gap-4">
        <WalletConnect />
        {isConnected && <UserProfile address={address} />}
      </div>
    </nav>
  );
}