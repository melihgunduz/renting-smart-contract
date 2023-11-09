  import { HardhatUserConfig } from "hardhat/config";
  import "@nomicfoundation/hardhat-toolbox";
  import {mnemonic, bscscanApiKey} from './secrets.json';

  const config: HardhatUserConfig = {
    solidity: "0.8.22",
    networks: {
      testnet: {
        url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
        chainId: 97,
        gasPrice: 20000000000,
        accounts: {mnemonic: mnemonic}
      },
    },
    etherscan: {
      // Your API key for Etherscan
      // Obtain one at https://bscscan.com/
      apiKey: bscscanApiKey
    }

  };

  export default config;
