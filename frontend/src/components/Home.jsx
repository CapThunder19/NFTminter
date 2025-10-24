import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import nftabi from "../abi/NFTminter.json";
import NFTcard from "./NFTcard"; 


const address = "0x62E8075F8602104c559525d0FFCA6a3511C9fc2e";

export default function Home() {
  const [tokenURI, setTokenURI] = useState("");
  const [nfts, setNfts] = useState([]);
  const [loadingMint, setLoadingMint] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null); 

  const mintNFT = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = new ethers.Contract(address, nftabi.abi, signer);

    if (!tokenURI) return alert("Enter token URI!");
    try {
      setLoadingMint(true);
      const tx = await nftContract.MintNNFT(tokenURI);
      await tx.wait();
      alert("NFT Minted ✅");
      setTokenURI("");
      fetchNFTs();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMint(false);
    }
  };

  const fetchNFTs = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = new ethers.Contract(address, nftabi.abi, signer);

    try {
      setLoadingFetch(true);
      const totalNFTs = await nftContract.id();
      const nftsArray = [];
      for (let i = 0; i < totalNFTs; i++) {
        const [uri, owner] = await nftContract.getNFT(i);
        nftsArray.push({ id: i, uri, owner });
      }
      setNfts(nftsArray);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden scroll-smooth">
      {/* HERO SECTION */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 h-screen gap-10">
        {/* Left side - Heading */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="md:w-1/2 space-y-6"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Discover, Mint, <span className="text-cyan-400">Sell NFTs</span>
          </h1>
          <p className="text-gray-400 text-lg">
            A futuristic NFT marketplace — built for Web3 creators & collectors.
          </p>
        </motion.div>

        {/* Right side - Mint Card */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="md:w-1/2 ml-6 bg-[#0a0a0a] border border-cyan-800/40 p-8 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all duration-500"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-300">
            Mint Your NFT
          </h2>
          <input
            type="text"
            placeholder="Enter IPFS Token URI"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1a1a1a] text-gray-100 mb-5 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500"
          />
          <button
            onClick={mintNFT}
            disabled={loadingMint}
            className="w-full bg-cyan-500 py-3 rounded-lg font-semibold text-black hover:bg-cyan-400 transition-colors duration-300"
          >
            {loadingMint ? "Minting..." : "Mint NFT"}
          </button>
        </motion.div>
      </section>

      {/* NFT GALLERY */}
      <section className="px-10 md:px-24 py-24 bg-linear-to-b from-[#070707] to-[#0d0d0d] border-t border-gray-800">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-16 text-center text-cyan-400"
        >
          Trending NFTs
        </motion.h2>

        {loadingFetch && (
          <p className="text-center text-gray-400 mb-6">Loading NFTs...</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {nfts.length === 0 && !loadingFetch && (
            <p className="text-gray-400 text-center col-span-full">
              No NFTs minted yet.
            </p>
          )}

          {nfts.map((nft, index) => (
            <motion.div
              key={nft.id}
              onClick={() => setSelectedNFT(nft)} 
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#101010] rounded-2xl overflow-hidden border border-cyan-800/30 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
              <img
                src={
                  nft.uri.startsWith("ipfs://")
                    ? nft.uri.replace("ipfs://", "https://ipfs.io/ipfs/")
                    : nft.uri
                }
                alt={`NFT ${nft.id}`}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between text-sm text-gray-400 mb-3">
                  <span>ID: {nft.id}</span>
                  <span>
                    Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NFT Card Modal */}
      {selectedNFT && (
        <NFTcard nft={selectedNFT} onClose={() => setSelectedNFT(null)} />
      )}

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-500 border-t border-gray-800">
        © 2025 Built for Web3.
      </footer>
    </div>
  );
}
