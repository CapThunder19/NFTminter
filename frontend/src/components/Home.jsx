import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import nftabi from '../abi/NFTminter.json';

const address = "0xF8092B6f3ac5D42BFCeC997AF3Cd58a087e726a0";

export default function Home() {
  const [tokenURI, setTokenURI] = useState("");
  const [nfts, setNfts] = useState([]);
  const [loadingMint, setLoadingMint] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

  const mintNFT = async () => {
    if (!window.ethereum) return alert("Please install MetaMask to mint NFTs.");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = new ethers.Contract(address, nftabi.abi, signer);

    if (!tokenURI) return alert("Enter a token URI!");
    try {
      setLoadingMint(true);
      const tx = await nftContract.MintNNFT(tokenURI);
      await tx.wait();
      alert("NFT minted successfully!");
      setTokenURI("");
      fetchNFTs();
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Failed to mint NFT.");
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
      console.error("Error retrieving NFTs:", error);
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      fetchNFTs();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-700 text-white">
      
      {/* Discover Section - Centered Top */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">
          Discover, Find, <span className="text-pink-500">Sell Extraordinary</span> Monster NFTs
        </h1>
        <p className="text-gray-300 text-lg">Marketplace for Monster Character NFTs</p>
      </section>

      {/* Mint + NFT Gallery Section */}
      <section className="px-10 py-10 flex flex-col md:flex-row gap-10">
        
        {/* Mint NFT Card - Left */}
        <div className="md:w-1/3 bg-gray-800 p-6 rounded-3xl shadow-2xl hover:shadow-pink-500 transition-shadow duration-300 transform hover:scale-105">
          <h2 className="text-2xl font-semibold mb-4 text-center">Mint Your NFT</h2>
          <input
            type="text"
            placeholder="Enter token URI (IPFS URL)"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            className="w-full p-3 rounded-lg text-black mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            onClick={mintNFT}
            disabled={loadingMint}
            className="w-full bg-pink-500 py-3 rounded-xl font-semibold hover:bg-pink-600 transform hover:scale-105 transition duration-300"
          >
            {loadingMint ? "Minting..." : "Mint NFT"}
          </button>
        </div>

        {/* NFT Gallery - Right */}
        <div className="md:w-2/3 max-h-[80vh] overflow-y-auto pr-2">
          <h2 className="text-3xl font-bold mb-8 text-center">Live Auctions</h2>
          {loadingFetch && <p className="text-center text-gray-300 mb-6">Loading NFTs...</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {nfts.length === 0 && !loadingFetch && (
              <p className="text-gray-300 text-center col-span-full">No NFTs minted yet.</p>
            )}

            {nfts.map((nft) => (
              <div
                key={nft.id}
                className="bg-gray-900 p-4 rounded-2xl shadow-lg hover:shadow-pink-500 transition duration-300 transform hover:scale-105 cursor-pointer flex flex-col"
              >
                {/* Passport-style tall image */}
                <img
                  src={nft.uri.startsWith("ipfs://") ? nft.uri.replace("ipfs://", "https://ipfs.io/ipfs/") : nft.uri}
                  alt={`NFT ${nft.id}`}
                  className="rounded-xl w-full h-80 object-cover mb-3"
                />
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-400">ID: {nft.id}</p>
                  <p className="text-xs text-gray-500">
                    Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                  </p>
                </div>
                <button className="mt-auto w-full bg-purple-700 py-2 rounded-xl hover:bg-purple-600 font-semibold transform hover:scale-105 transition duration-300">
                  Place Bid
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-10 mt-20 text-center text-gray-400">
        &copy; 2025 NFTory. All rights reserved.
      </footer>
    </div>
  );
}
