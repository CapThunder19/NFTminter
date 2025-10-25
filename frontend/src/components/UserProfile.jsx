import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import axios from "axios";
import nftabi from "../abi/NFTminter.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
  "https://gateway.pinata.cloud/ipfs/"
];

export const UserProfile = ({ address }) => {
  const [nfts, setNfts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const fetchUserNFTs = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, nftabi.abi, signer);

      const totalNFTs = Number(await nftContract.id());
      const userNFTs = [];

      for (let i = 0; i < totalNFTs; i++) {
        try {
          const [uri, owner] = await nftContract.getNFT(i);
          if (owner.toLowerCase() === address.toLowerCase()) {
            let imageUri = "/placeholder.png"; // default

            if (uri) {
              let metadata = null;

              if (uri.startsWith("ipfs://")) {
                const cid = uri.replace("ipfs://", "");
                for (const gateway of IPFS_GATEWAYS) {
                  try {
                    const res = await axios.get(`${gateway}${cid}`, { timeout: 10000 });
                    metadata = res.data;
                    break;
                  } catch (err) {
                    console.warn(`Failed to fetch metadata from ${gateway}${cid}`);
                  }
                }
              } else {
              
                try {
                  const res = await axios.get(uri, { timeout: 10000 });
                  metadata = res.data;
                } catch (err) {
                  console.warn(`Failed to fetch metadata from ${uri}`);
                }
              }

              if (metadata?.image) {
              
                if (metadata.image.startsWith("ipfs://")) {
                  const cid = metadata.image.replace("ipfs://", "");
                  imageUri = `${IPFS_GATEWAYS[0]}${cid}`;
                } else {
                  imageUri = metadata.image;
                }
              }
            }

            userNFTs.push({
              id: i,
              uri: imageUri
            });
          }
        } catch (err) {
          console.error(`Error fetching NFT ${i}:`, err.message);
        }
      }

      setNfts(userNFTs);
    } catch (err) {
      console.error("Error fetching user NFTs:", err.message);
    }
  };

  useEffect(() => {
    if (address) fetchUserNFTs();
  }, [address]);

  const togglePopup = () => setShowPopup(!showPopup);

  const handleSelectProfile = (uri) => {
    setProfilePic(uri);
    setShowPopup(false);
  };

  return (
    <div className="relative">
      <img
        src={
          profilePic ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`
        }
        alt="User Avatar"
        onClick={togglePopup}
        className="w-10 h-10 rounded-full border-2 border-cyan-400 cursor-pointer hover:scale-110 transition-transform duration-300"
      />

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 mt-3 w-80 bg-[#0d0d0d] border border-cyan-800/40 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.25)] p-4 z-50"
          >
            <p className="text-sm text-gray-400 mb-3">
              Connected:{" "}
              <span className="text-cyan-400">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </p>

            <h3 className="text-cyan-300 font-semibold mb-3">
              Your NFTs ({nfts.length})
            </h3>

            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-700">
              {nfts.length === 0 ? (
                <p className="text-gray-500 text-sm col-span-3 text-center">
                  No NFTs owned.
                </p>
              ) : (
                nfts.map((nft) => (
                  <img
                    key={nft.id}
                    src={nft.uri || "/placeholder.png"}
                    alt={`NFT ${nft.id}`}
                    onClick={() => handleSelectProfile(nft.uri)}
                    className={`w-full h-24 object-cover rounded-lg cursor-pointer border-2 ${
                      profilePic === nft.uri
                        ? "border-cyan-400"
                        : "border-transparent"
                    } hover:border-cyan-400 transition-all duration-300`}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
