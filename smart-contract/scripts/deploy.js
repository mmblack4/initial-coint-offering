const hre = require("hardhat");
const { CRYPTO_DEVS_NFT_CONTRACT_ADDRESS } = require("../constants");
require("dotenv").config({ path: ".env" });

async function main() {
  const cryptoDevTokenContract = await hre.ethers.getContractFactory(
    "CryptoDevToken",
  );

  const deployCryptoDevsTokenContract = await cryptoDevTokenContract.deploy(
    CRYPTO_DEVS_NFT_CONTRACT_ADDRESS,
  );

  console.log(
    "CryptoDev Token Contract Address:",
    deployCryptoDevsTokenContract.address,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
