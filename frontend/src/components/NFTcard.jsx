import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import nftabi from "../abi/NFTminter.json";
import { useAccount } from "wagmi";

const contractAddress = "0x55812cc05f2E61BB0Ff5F2DA58163ee4ac897D49";

const IPFS_GATEWAYS = [
  "https://dweb.link/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/"
];

export default function NFTcard({ nft, onClose }) {
  const { address } = useAccount();
  const [toAddress, setToAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [minter, setMinter] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

 
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!nft?.uri) {
        setMetadata({
          name: `NFT #${nft?.id}`,
          description: "No metadata available",
          image: "/placeholder.png"
        });
        setIsLoadingMetadata(false);
        return;
      }

      let metadataURL = nft.uri.trim();
      if (metadataURL.startsWith("ipfs://")) {
        const cid = metadataURL.replace("ipfs://", "").trim();
        let success = false;

        for (const gateway of IPFS_GATEWAYS) {
          const url = `${gateway}${cid}`;
          try {
            const res = await axios.get(url, { timeout: 10000 });
            if (res.data) {
              setMetadata(res.data);
              success = true;
              break;
            }
          } catch (err) {
            console.warn(`Failed to fetch from ${gateway}`, err.message);
          }
        }

        if (!success) {
          setMetadata({
            name: `NFT #${nft.id}`,
            description: "Metadata unavailable",
            image: "/placeholder.png"
          });
        }
      } else {
        try {
          const res = await axios.get(metadataURL, { timeout: 10000 });
          setMetadata(res.data);
        } catch (err) {
          console.error("Failed to fetch HTTP metadata", err.message);
          setMetadata({
            name: `NFT #${nft.id}`,
            description: "Metadata fetch failed",
            image: "/placeholder.png"
          });
        }
      }
      setIsLoadingMetadata(false);
    };

    fetchMetadata();
  }, [nft?.uri, nft?.id]);

  
  useEffect(() => {
    const getMinter = async () => {
      if (!nft?.id) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, nftabi.abi, provider);
        const filter = contract.filters.NFTMinted(nft.id, null, null);
        const logs = await contract.queryFilter(filter, 0, "latest");
        if (logs.length > 0) setMinter(logs[0].args[1]);
      } catch (err) {
        console.error("Error fetching minter:", err.message);
      }
    };
    getMinter();
  }, [nft?.id]);

  const transferNFT = async () => {
    if (!toAddress) return alert("Enter a wallet address");
    if (!ethers.isAddress(toAddress)) return alert("Invalid wallet address");
    if (!window.ethereum) return alert("Please install MetaMask!");

    try {
      setIsTransferring(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, nftabi.abi, signer);
      const tx = await contract.transferNFT(toAddress, nft.id);
      await tx.wait();
      alert("✅ NFT transferred successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert(`❌ Transfer failed: ${err.reason || err.message}`);
    } finally {
      setIsTransferring(false);
    }
  };

  const getImageUrl = () => {
    if (!metadata?.image || imageError) return "/placeholder.png";

    if (metadata.image.startsWith("ipfs://")) {
      const cid = metadata.image.replace("ipfs://", "").trim();
      return cid ? `${IPFS_GATEWAYS[0]}${cid}` : "/placeholder.png";
    }
    return metadata.image;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-[#0a0a0a] border border-cyan-400 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] w-[380px] p-6 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-cyan-400 hover:text-cyan-300 text-xl"
        >
          ✕
        </button>

        {isLoadingMetadata ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
          </div>
        ) : (
          <>
            <img
              src={getImageUrl()}
              alt={metadata?.name || `NFT #${nft?.id}`}
              className="w-full h-64 object-cover rounded-xl border border-cyan-500 mb-4"
              onError={(e) => {
                setImageError(true);
                e.target.src = "/placeholder.png";
                e.target.onerror = null;
              }}
            />
            <div className="text-sm mb-4">
              <h2 className="text-xl font-semibold text-cyan-400 mb-2">
                {metadata?.name || `NFT #${nft?.id}`}
              </h2>
              <p className="text-gray-300 mb-3 text-sm">
                {metadata?.description || "No description available."}
              </p>

              <div className="space-y-1 text-gray-400 text-xs">
                <p><span className="text-cyan-400">Token ID:</span> {nft?.id}</p>
                <p><span className="text-cyan-400">Owner:</span> {nft?.owner?.slice(0,6)}...{nft?.owner?.slice(-4)}</p>
                <p><span className="text-cyan-400">Minter:</span> {minter ? `${minter.slice(0,6)}...${minter.slice(-4)}` : "Fetching..."}</p>
              </div>
            </div>

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
                disabled={isTransferring || !toAddress}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {isTransferring ? "Transferring..." : "Transfer NFT"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
