import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { motion } from "framer-motion";
import nftabi from "../abi/NFTminter.json";
import TicketCard from "../components/TicketCard"; // Updated import

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const pinataKey = import.meta.env.VITE_PINATA_JWT_KEY;

export default function TicketPage() {
  const [maxTickets, setMaxTickets] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [loadingMint, setLoadingMint] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);

 
  const uploadToIPFS = async (file, name, description, location, date) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const imageRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            Authorization: `Bearer ${pinataKey}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUri = `ipfs://${imageRes.data.IpfsHash}`;

      const metadata = {
        name,
        description,
        image: imageUri,
        attributes: [
          { trait_type: "Location", value: location },
          { trait_type: "Date", value: date },
        ],
      };

      const metadataRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            Authorization: `Bearer ${pinataKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return `ipfs://${metadataRes.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      alert("Failed to upload image/metadata to IPFS");
    }
  };

 
  const mintTickets = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to mint tickets.");
      return;
    }

    if (!imageFile || !title || !description || !location || !date) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    try {
      setLoadingMint(true);

      const tokenURI = await uploadToIPFS(
        imageFile,
        title,
        description,
        location,
        date
      );
      if (!tokenURI) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, nftabi.abi, signer);

      const tx = await nftContract.totalmint(maxTickets, tokenURI);
      await tx.wait();

      alert(`Successfully minted ${maxTickets} ticket NFTs!`);
      setTitle("");
      setDescription("");
      setImageFile(null);
      setLocation("");
      setDate("");
      setMaxTickets(1);
      fetchTickets();
    } catch (error) {
      console.error("Error minting tickets:", error);
      alert("Failed to mint tickets.");
    } finally {
      setLoadingMint(false);
    }
  };

  
  const fetchTickets = async () => {
    if (!window.ethereum) return;
    try {
      setLoadingFetch(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, nftabi.abi, signer);

      const total = Number(await contract.ticketid());
      const seenURIs = new Set(); 
      const nftArray = [];

      for (let i = 0; i < total; i++) {
        const tokenID = i + 1000;

        try {
          const [uri, owner] = await contract.getticketNFT(tokenID);
          if (!uri || seenURIs.has(uri)) continue; 
          seenURIs.add(uri);

          
          let metadata = {};
          if (uri.startsWith("ipfs://")) {
            const cid = uri.replace("ipfs://", "");
            const res = await axios.get(`https://ipfs.io/ipfs/${cid}`);
            metadata = res.data;
          }

          nftArray.push({
            id: tokenID,
            uri,
            owner,
            name: metadata.name || `Ticket #${tokenID}`,
            image: metadata.image || "/placeholder.png",
            location: metadata.attributes?.find(a => a.trait_type === "Location")?.value || "Unknown",
            date: metadata.attributes?.find(a => a.trait_type === "Date")?.value || "TBA",
          });
        } catch (err) {
          console.warn(`Skipping token ${tokenID}:`, err);
        }
      }

      setNfts(nftArray);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <section className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 py-20 gap-10">
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="md:w-1/2 space-y-6"
        >
          <h1 className="text-5xl font-extrabold">
            Mint <span className="text-cyan-400">Ticket NFTs</span>
          </h1>
          <p className="text-gray-400">
            Create event-based ticket NFTs with image, date, and location.
          </p>
        </motion.div>

        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="md:w-1/2 bg-[#0a0a0a] border border-cyan-800/40 p-8 rounded-3xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-300">
            Mint Ticket
          </h2>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full mb-4 text-gray-100"
          />
          <input
            type="text"
            placeholder="Event Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1a1a1a] text-gray-100 mb-4"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1a1a1a] text-gray-100 mb-4"
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1a1a1a] text-gray-100 mb-4"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1a1a1a] text-gray-100 mb-4"
          />
          <input
            type="number"
            min="1"
            max="20"
            value={maxTickets}
            onChange={(e) => setMaxTickets(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1a1a1a] text-gray-100 mb-4"
          />
          <button
            onClick={mintTickets}
            disabled={loadingMint}
            className="w-full bg-cyan-500 py-3 rounded-lg font-semibold text-black hover:bg-cyan-400"
          >
            {loadingMint ? "Minting..." : "Mint Tickets"}
          </button>
        </motion.div>
      </section>

      <section className="px-10 md:px-24 py-24 border-t border-gray-800">
        <h2 className="text-4xl font-bold mb-12 text-center text-cyan-400">
          🎟️ Ticket Gallery
        </h2>

        {loadingFetch && <p className="text-center text-gray-400">Loading tickets...</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {nfts.length === 0 && !loadingFetch && (
            <p className="text-gray-400 text-center col-span-full">No tickets minted yet.</p>
          )}
          {nfts.map((nft) => (
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

      {/* ✅ TicketCard modal */}
      {selectedNFT && <TicketCard nft={selectedNFT} onClose={() => setSelectedNFT(null)} />}

      <footer className="py-10 text-center text-gray-500 border-t border-gray-800">
        © 2025 Built for Web3.
      </footer>
    </div>
  );
}
