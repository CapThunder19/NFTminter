import { useAccount, useConnect, useDisconnect } from "wagmi";

export const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();

  const buttonClasses =
    "px-4 py-2 rounded-xl font-semibold shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]";

  if (isConnected) {
    return (
      <div className="flex flex-col md:flex-row items-center gap-3">
        <p className="text-cyan-400 font-medium truncate max-w-[150px]">
          {address.slice(0, 6)}...{address.slice(-4)}
        </p>
        <button
          onClick={() => disconnect()}
          className={`${buttonClasses} bg-red-600 hover:bg-red-500 text-white`}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => connect({ connector: connectors[0] })}
        disabled={connectors.length === 0}
        className={`${buttonClasses} bg-cyan-500 hover:bg-cyan-400 text-black`}
      >
        Connect Wallet
      </button>
    </div>
  );
};