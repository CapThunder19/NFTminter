// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTminter is ERC721URIStorage, Ownable{

    uint256 public id = 0;

    event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event NFTTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
   

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


}
