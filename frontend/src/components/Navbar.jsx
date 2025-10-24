import { WalletConnect } from "./Walletconnect";
import { useAccount } from "wagmi";
import { UserProfile } from "./UserProfile";

export default function Navbar() {
  const { address, isConnected } = useAccount();

  return (
    <nav className="bg-[#0a0a0a] text-white px-6 py-4 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.25)]">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-extrabold cursor-pointer text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
          NFT Gallery
        </h1>
      </div>

      {/* Right: Wallet + Profile */}
      <div className="flex items-center gap-4">
        <WalletConnect />
        {isConnected && <UserProfile address={address} />}
      </div>
    </nav>
  );
}
