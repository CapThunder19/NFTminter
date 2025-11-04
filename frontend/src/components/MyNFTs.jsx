import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import nftabi from "../abi/NFTminter.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
];

export default function MyNFTs() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);


  const fetchUserNFTs = async () => {
    if (!window.ethereum || !isConnected || !address) return;
    setLoadingNFTs(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, nftabi.abi, signer);

      const totalNFTs = Number(await nftContract.id());
      const userNFTs = [];

      for (let i = 0; i < totalNFTs; i++) {
        try {
          const owner = await nftContract.ownerOf(i);
          const uri = await nftContract.tokenURI(i);

          if (owner.toLowerCase() === address.toLowerCase()) {
            let imageUri = "/placeholder.png";
            let metadata = null;

            if (uri.startsWith("ipfs://")) {
              const cid = uri.replace("ipfs://", "");
              for (const gateway of IPFS_GATEWAYS) {
                try {
                  const res = await axios.get(`${gateway}${cid}`, { timeout: 8000 });
                  metadata = res.data;
                  break;
                } catch {}
              }
            } else {
              const res = await axios.get(uri, { timeout: 8000 });
              metadata = res.data;
            }

            if (metadata?.image) {
              imageUri = metadata.image.startsWith("ipfs://")
                ? `${IPFS_GATEWAYS[0]}${metadata.image.replace("ipfs://", "")}`
                : metadata.image;
            }

            userNFTs.push({
              id: i,
              name: metadata?.name || `NFT #${i}`,
              description: metadata?.description || "No description available",
              image: imageUri,
              owner,
            });
          }
        } catch {
        }
      }

      setNfts(userNFTs);
    } catch (err) {
      console.error("Error fetching NFTs:", err);
    } finally {
      setLoadingNFTs(false);
    }
  };



const fetchMyTickets = async () => {
  if (!window.ethereum || !isConnected || !address) return;
  setLoadingTickets(true);

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, nftabi.abi, signer);

    const total = Number(await contract.ticketid());
    const userTickets = [];

    for (let i = 0; i < total; i++) {
      const tokenID = i + 1000;
      try {
        const [uri, owner] = await contract.getticketNFT(tokenID);
        if (owner.toLowerCase() !== address.toLowerCase()) continue;

        let metadata = {};
        if (uri.startsWith("ipfs://")) {
          const cid = uri.replace("ipfs://", "");
          try {
            const res = await axios.get(`https://ipfs.io/ipfs/${cid}`);
            metadata = res.data;
          } catch (err) {
            console.warn(`Could not load metadata for ${cid}:`, err);
          }
        } else {
          try {
            const res = await axios.get(uri);
            metadata = res.data;
          } catch (err) {
            console.warn(`Could not load metadata for ${uri}:`, err);
          }
        }

        userTickets.push({
          id: tokenID,
          name: metadata.name || `Ticket #${tokenID}`,
          description: metadata.description || "No description available",
          image: metadata.image || "/placeholder.png",
          location:
            metadata.attributes?.find((a) => a.trait_type === "Location")?.value ||
            "Unknown",
          date:
            metadata.attributes?.find((a) => a.trait_type === "Date")?.value ||
            "TBA",
          owner,
        });
      } catch (err) {
        console.warn(`Skipping token ${tokenID}:`, err);
      }
    }

    setTickets(userTickets);
  } catch (err) {
    console.error("Error fetching tickets:", err);
  } finally {
    setLoadingTickets(false);
  }
};


  useEffect(() => {
    if (isConnected && address) {
      fetchUserNFTs();
      fetchMyTickets();
    }
  }, [isConnected, address]);

  return (
    <div className="p-8 text-center min-h-screen bg-gradient-to-br from-black to-gray-900 text-white">
      {!isConnected ? (
        <p className="text-gray-400 text-lg">🔌 Connect your wallet to view your NFTs & tickets</p>
      ) : (
        <>
          {/* NFT Gallery */}
          <section className="px-10 md:px-24 py-20 border-b border-gray-800">
            <h2 className="text-4xl font-bold mb-12 text-center text-cyan-400">NFT Gallery</h2>
            {loadingNFTs ? (
              <p className="text-gray-400 text-center">Loading NFTs...</p>
            ) : nfts.length === 0 ? (
              <p className="text-gray-500 text-center">No NFTs found for this wallet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {nfts.map((nft) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-[#101010] border border-cyan-800/40 rounded-xl shadow-lg hover:shadow-cyan-500/30 p-3 transition cursor-pointer"
                    onClick={() => setSelectedNFT(nft)}
                  >
                    <img
                      src={nft.image}
                      alt={`NFT ${nft.id}`}
                      className="rounded-xl h-64 w-full object-cover"
                    />
                    <p className="text-sm text-gray-400 mt-2">{nft.name}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Ticket Gallery */}
          <section className="px-10 md:px-24 py-20 border-t border-gray-800">
            <h2 className="text-4xl font-bold mb-12 text-center text-cyan-400">Ticket Gallery</h2>
            {loadingTickets && <p className="text-center text-gray-400">Loading tickets...</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {tickets.length === 0 && !loadingTickets && (
                <p className="text-gray-400 text-center col-span-full">
                  No tickets owned by this wallet.
                </p>
              )}
              {tickets.map((nft) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7 }}
                  className="bg-[#101010] rounded-2xl overflow-hidden border border-cyan-800/30 shadow-lg hover:shadow-cyan-500/30 transition-all cursor-pointer"
                  onClick={() => setSelectedNFT(nft)}
                >
                  <img
                    src={
                      nft.image?.startsWith("ipfs://")
                        ? `https://ipfs.io/ipfs/${nft.image.replace("ipfs://", "")}`
                        : nft.image || "/placeholder.png"
                    }
                    alt={nft.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-cyan-400 font-semibold">{nft.name}</h3>
                    <p className="text-gray-400 text-sm">{nft.location}</p>
                    <p className="text-gray-500 text-xs">{nft.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* NFT Popup */}
          <AnimatePresence>
            {selectedNFT && (
              <NFTPopup
                nft={selectedNFT}
                onClose={() => {
                  setSelectedNFT(null);
                  fetchUserNFTs();
                  fetchMyTickets();
                }}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}


function NFTPopup({ nft, onClose }) {
  const [toAddress, setToAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const imageSrc =
    nft.image?.startsWith("ipfs://")
      ? `https://ipfs.io/ipfs/${nft.image.replace("ipfs://", "")}`
      : nft.image || nft.uri || "/placeholder.png";

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-[#0a0a0a] border border-cyan-400 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] w-[380px] p-6 text-white relative text-left"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
        >
          ✖
        </button>

        <img
          src={imageSrc}
          alt={nft.name}
          className="w-full h-64 object-cover rounded-xl border border-cyan-500 mb-4"
        />

        <h2 className="text-2xl font-semibold text-cyan-400">{nft.name}</h2>
        <p
  className="text-gray-300 text-sm mt-2 max-h-32 overflow-y-auto break-words whitespace-pre-wrap pr-2 scrollbar-thin scrollbar-thumb-cyan-700 scrollbar-track-transparent"
>
  {nft.description || "No description available"}
</p>


        <div className="text-xs text-gray-400 mt-3">
          <p>
            <span className="text-cyan-400">Token ID:</span> {nft.id}
          </p>
          <p>
            <span className="text-cyan-400">Owner:</span>{" "}
            {nft.owner ? `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}` : "Unknown"}
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-5">
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
      </motion.div>
    </motion.div>
  );
}
