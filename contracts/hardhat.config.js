require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    scroll: {
      url: process.env.SCROLL_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
