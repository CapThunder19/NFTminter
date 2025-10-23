// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTminter is ERC721URIStorage, Ownable{

    uint256 public id = 0;
   

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender){}

    function MintNNFT(string memory tokenURI) public {
        uint256 tokenId = id;
        _safeMint(msg.sender, tokenId); 
        _setTokenURI(tokenId, tokenURI);
        id++;
    }

    function getNFT(uint256 tokenID) public view returns(string memory, address){
        return (tokenURI(tokenID), ownerOf(tokenID));
      
    }


}
