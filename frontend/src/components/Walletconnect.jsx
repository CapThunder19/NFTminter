import { useAccount, useConnect, useDisconnect } from "wagmi";

export const WalletConnect = () => {
    const {address, isConnected} = useAccount();
    const {disconnect} = useDisconnect();
    const {connectors, connect} = useConnect();

    if(isConnected) {
        return (
         <div>
        <p>Connected as {address}</p>
         <button onClick={() => disconnect()} 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition"
            >Disconnect</button>
         </div>
        )}

    return (
        <div>
            <button
                onClick={() => connect({ connector: connectors[0] })}
                disabled={connectors.length === 0}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition"
            >
                Connect Wallet
            </button>
        </div>  
    )
}
        
    
