// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTminter is ERC721URIStorage, Ownable{

    uint256 public id = 0;
    uint256 public ticketid = 0;

    
    uint256 public mintid = 0;

    event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event NFTTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event ticketNFtMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
   

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender){}

    function MintNNFT(string memory tokenURI) public {
        uint256 tokenId = id;
        _safeMint(msg.sender, tokenId); 
        _setTokenURI(tokenId, tokenURI);
        id++;

        emit NFTMinted(tokenId, msg.sender, tokenURI);
    }

    function getNFT(uint256 tokenID) public view returns(string memory, address){
        return (tokenURI(tokenID), ownerOf(tokenID));
      
    }

    function transferNFT(address to, uint256 tokenId) public {
       require(ownerOf(tokenId) == msg.sender, "Not the owner");
       require(to != address(0), "Invalid address");
       _transfer(msg.sender, to, tokenId);

       emit NFTTransferred(tokenId, msg.sender, to);
    }

    function mintticket(string memory tokenURI) public{
        uint256 tokenID = ticketid + 1000;
        _safeMint(msg.sender, tokenID);
        _setTokenURI(tokenID, tokenURI);
        ticketid++;
        
        emit ticketNFtMinted(tokenID, msg.sender, tokenURI);
    }

    function getticketNFT(uint256 tokenID) public view returns(string memory, address){
        return (tokenURI(tokenID), ownerOf(tokenID)); 
      
    }

    function totalmint(uint256 Maxticket, string memory tokenURI) public returns (uint256){
        mintid = 0;
        uint256 max = Maxticket;
        require(max <= 20, "Cannot mint more than 20 at a time");
        for (uint256 i =0; i< max; i++){
             mintticket(tokenURI);
             mintid++;
        }
        return mintid;
    }

    




}