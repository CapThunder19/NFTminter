import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import nftabi from "../abi/NFTminter.json";

const contractAddress = "0x62E8075F8602104c559525d0FFCA6a3511C9fc2e";

export default function NFTcard({ nft, onClose }) {
  const { address } = useAccount();
  const [toAddress, setToAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [minter, setMinter] = useState(null);


  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        let metadataURL = nft.uri;
        if (metadataURL.startsWith("ipfs://")) {
          metadataURL = metadataURL.replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        const response = await fetch(metadataURL);
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    fetchMetadata();
  }, [nft.uri]);

  
  useEffect(() => {
    const getMinter = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, nftabi.abi, provider);

        
        const filter = contract.filters.NFTMinted(nft.id, null, null);
        const logs = await contract.queryFilter(filter, 0, "latest");

        if (logs.length > 0) {
          const minterAddress = logs[0].args[1];
          setMinter(minterAddress);
        }
      } catch (err) {
        console.error("Error fetching minter:", err);
      }
    };
    getMinter();
  }, [nft.id]);

  const transferNFT = async () => {
    if (!toAddress) return alert("Please enter a wallet address");
    try {
      setIsTransferring(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, nftabi.abi, signer);

      const tx = await contract.transferNFT(toAddress, nft.id);
      await tx.wait();

      alert("✅ NFT transferred successfully!");
      setIsTransferring(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Transfer failed");
      setIsTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-[#0a0a0a] border border-cyan-400 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] w-[380px] p-6 text-white relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-cyan-400 hover:text-cyan-300 text-xl"
        >
          ✕
        </button>

        {/* NFT Image */}
        <img
          src={
            metadata?.image
              ? metadata.image.startsWith("ipfs://")
                ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                : metadata.image
              : nft.uri.replace("ipfs://", "https://ipfs.io/ipfs/")
          }
          alt={`NFT ${nft.id}`}
          className="w-full h-64 object-cover rounded-xl border border-cyan-500 mb-4"
        />

        {/* NFT Details */}
        <div className="text-sm mb-4">
          <h2 className="text-xl font-semibold text-cyan-400 mb-2">
            {metadata?.name || `NFT #${nft.id}`}
          </h2>
          <p className="text-gray-300 mb-3 text-sm">
            {metadata?.description || "No description available."}
          </p>

          <div className="space-y-1 text-gray-400 text-xs">
            <p>
              <span className="text-cyan-400">Token ID:</span> {nft.id}
            </p>
            <p>
              <span className="text-cyan-400">Owner:</span>{" "}
              {nft.owner
                ? nft.owner.slice(0, 6) + "..." + nft.owner.slice(-4)
                : "Unknown"}
            </p>
            <p>
              <span className="text-cyan-400">Minter:</span>{" "}
              {minter
                ? minter.slice(0, 6) + "..." + minter.slice(-4)
                : "Fetching..."}
            </p>
          </div>
        </div>

        {/* Transfer Field */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Enter recipient address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="px-3 py-2 border-2 border-cyan-500 rounded-lg text-white text-sm bg-transparent"
          />
          <button
            onClick={transferNFT}
            disabled={isTransferring}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {isTransferring ? "Transferring..." : "Transfer NFT"}
          </button>
        </div>
      </div>
    </div>
  );
}
