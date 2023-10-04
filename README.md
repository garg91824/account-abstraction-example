
This repository contains example scripts to do transactions using account abstraction concept. This is currently deployed on Polygon mumbai network and uses Biconomy paymaster. 
It includes following scripts
1. index.ts - Allows user to mint an NFT by using their own ERC20 tokens, here in this example I have used WMATIC for the same.
2. mintNFTGasless.ts - Allows use to mint an NFT by making use of paymaster gas
3. transfer.ts - A simple transfer script by making use of smart wallet native tokens

Pass the required env variables, You can get the Biconomy paymaster link by signing up on the Dashboard.


## Installation

Clone this repository and then run

```bash
   npm i 
   npm run dev
```

Alternatively you can use `npm` or `pnpm` if that suits you. 

