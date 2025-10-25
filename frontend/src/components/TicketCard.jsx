import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import nftabi from "../abi/NFTminter.json";
import axios from "axios";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const IPFS_GATEWAYS = [
  "https://dweb.link/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/"
];

export default function TicketCard({ nft, onClose }) {
  const [metadata, setMetadata] = useState(null);
  const [owners, setOwners] = useState([]);
  const [minter, setMinter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    const fetchTicketData = async () => {
      if (!nft?.id) return;

    
      let meta = { name: `Ticket #${nft.id}`, description: "", image: "/placeholder.png", date: "TBA", location: "Unknown" };
      try {
        let uri = nft.uri || "";
        if (uri.startsWith("ipfs://")) {
          const cid = uri.replace("ipfs://", "").trim();
          for (const gateway of IPFS_GATEWAYS) {
            try {
              const res = await axios.get(`${gateway}${cid}`, { timeout: 10000 });
              if (res.data) {
                meta = res.data;
                break;
              }
            } catch {}
          }
        } else {
          const res = await axios.get(uri, { timeout: 10000 });
          meta = res.data || meta;
        }
      
        meta.date = meta.attributes?.find(a => a.trait_type === "Date")?.value || "TBA";
        meta.location = meta.attributes?.find(a => a.trait_type === "Location")?.value || "Unknown";
      } catch (err) {
        console.warn("Metadata fetch failed", err.message);
      }

      setMetadata(meta);

      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, nftabi.abi, provider);
        const totalTickets = Number(await contract.ticketid());
        const ownerSet = new Set();
        let firstMinter = null;

        for (let i = 0; i < totalTickets; i++) {
          const tokenID = i + 1000;
          try {
            const [uri, owner] = await contract.getticketNFT(tokenID);
            if (uri === nft.uri) {
              ownerSet.add(owner);

              if (!firstMinter) {
                const filter = contract.filters.ticketNFtMinted(tokenID, null, null);
                const logs = await contract.queryFilter(filter, 0, "latest");
                if (logs.length > 0) firstMinter = logs[0].args[1];
              }
            }
          } catch {}
        }

        setOwners(Array.from(ownerSet));
        setMinter(firstMinter);
      } catch (err) {
        console.error("Fetching owners/minter failed", err.message);
      }

      setIsLoading(false);
    };

    fetchTicketData();
  }, [nft]);

  const getImageUrl = () => {
    if (!metadata?.image || imageError) return "/placeholder.png";
    if (metadata.image.startsWith("ipfs://")) {
      const cid = metadata.image.replace("ipfs://", "").trim();
      return `${IPFS_GATEWAYS[0]}${cid}`;
    }
    return metadata.image;
  };

  const transferTicket = async () => {
    if (!toAddress) return alert("Enter recipient address");
    if (!ethers.isAddress(toAddress)) return alert("Invalid wallet address");
    if (!window.ethereum) return alert("Install MetaMask");

    try {
      setIsTransferring(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, nftabi.abi, signer);

      const tx = await contract.transferNFT(toAddress, nft.id);
      await tx.wait();
      alert("Ticket transferred!");
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Transfer failed: ${err.reason || err.message}`);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-[#0a0a0a] border border-cyan-400 rounded-2xl shadow-lg w-[400px] p-6 text-white relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-cyan-400 hover:text-cyan-300 text-xl">✕</button>

        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
          </div>
        ) : (
          <>
            <img
              src={getImageUrl()}
              alt={metadata.name}
              className="w-full h-64 object-cover rounded-xl border border-cyan-500 mb-4"
              onError={(e) => { setImageError(true); e.target.src = "/placeholder.png"; e.target.onerror = null; }}
            />
            <h2 className="text-xl font-semibold text-cyan-400 mb-2">{metadata.name}</h2>
            <p className="text-gray-300 mb-3">{metadata.description}</p>

            <div className="text-xs text-gray-400 space-y-1 mb-4">
              <p><span className="text-cyan-400">Token ID:</span> {nft.id}</p>
              <p><span className="text-cyan-400">Date:</span> {metadata.date}</p>
              <p><span className="text-cyan-400">Location:</span> {metadata.location}</p>
              <p><span className="text-cyan-400">Tickets Minted:</span> {owners.length}</p>
              <p><span className="text-cyan-400">Owners:</span> {owners.map(o => `${o.slice(0,6)}...${o.slice(-4)}`).join(", ")}</p>
              <p><span className="text-cyan-400">Minter:</span> {minter ? `${minter.slice(0,6)}...${minter.slice(-4)}` : "Fetching..."}</p>
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Recipient address"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="px-3 py-2 border-2 border-cyan-500 rounded-lg text-white text-sm bg-transparent"
              />
              <button
                onClick={transferTicket}
                disabled={isTransferring || !toAddress}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {isTransferring ? "Transferring..." : "Transfer Ticket"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
