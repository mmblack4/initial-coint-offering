require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.8.10",

  networks: {
    rinkeby: {
      url: process.env.RINKEYBY_ALCHEMY_API_KEY_URL,
      accounts: [process.env.LEARNING_TESTING1_PRIVATE_KEY],
    },
  },
};
// 0x5FdDa029B97D0E04434618926fbbc36666366D86
// 0x37a6dC13443D089B076781517DF93B196F478fea
