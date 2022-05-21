import { providers, Contract, BigNumber, utils } from "ethers";
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  const web3ModalRef = useRef();
  const zero = BigNumber.from(0);

  const [totalClaimedToken, setTotalClaimedToken] = useState(0);
  const [totalSupplayToken, setTotalSupplayToken] = useState(0);
  const [totalMintedToken, setTotalMintedToken] = useState(0);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [claimedToken, setClaimedToken] = useState(false);
  const [walletConected, setWalletConected] = useState(false);

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConected(true);
    } catch (error) {}
  };

  const getTotalTokenSupply = async () => {
    const provider = await getProviderOrSigner();
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider,
    );

    const _totalSupplayToken = await tokenContract.maxTotalSupply();
    setTotalSupplayToken(utils.formatEther(_totalSupplayToken));
  };

  const getTotalMintedToken = async () => {
    const provider = await getProviderOrSigner();
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider,
    );

    const _totalMintedToken = await tokenContract.totalSupply();
    setTotalMintedToken(utils.formatEther(_totalMintedToken));
  };

  const getTokenToBeClaimed = async () => {
    const provider = await getProviderOrSigner();

    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider,
    );

    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider,
    );

    const signer = await getProviderOrSigner(true);
    const address = await signer.getAddress();

    const balance = await nftContract.balanceOf(address);

    if (balance.eq(zero)) {
      setClaimedToken(false);
    } else {
      let amount = 0;

      for (let i = 0; i < balance; i++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
        const claimed = await tokenContract.tokenIdsClaimed(tokenId);

        if (!claimed) {
          amount++;
        }
      }
      if (amount > 0) {
        setClaimedToken(true);
      }
    }
    const _totalClaimedToken = await tokenContract.balanceOf(address);
    setTotalClaimedToken(utils.formatEther(_totalClaimedToken));
  };

  const claimToken = async () => {
    const signer = await getProviderOrSigner(true);

    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer,
    );

    await tokenContract.claim();
    getTokenToBeClaimed();
  };

  const mintToken = async () => {
    if (tokenAmount.eq(zero)) {
      window.alert("can't mint zero token");
      return;
    }

    const signer = await getProviderOrSigner(true);

    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer,
    );
    const price = 0.001;
    const value = price * tokenAmount;
    const tx = await tokenContract.mint(tokenAmount, {
      value: utils.parseEther(value.toString()),
    });
    await tx.wait();
    getTokenToBeClaimed();
  };

  useEffect(() => {
    if (!walletConected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokenSupply();
      getTotalMintedToken();
      getTokenToBeClaimed();
    }
  }, []);
  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev Tokens here
          </div>

          {walletConected ? (
            <div>
              {" "}
              <span>You have minted {totalClaimedToken} Crypto Dev Token</span>
              <span>
                Overall {totalMintedToken}/{totalSupplayToken} Crypto Dev Token
              </span>
              {claimedToken ? (
                <button onClick={claimToken} className={styles.button}>
                  Claim
                </button>
              ) : (
                <div>
                  <input
                    type="number"
                    placeholder="Amount of Tokens"
                    // BigNumber.from converts the `e.target.value` to a BigNumber
                    onChange={(e) =>
                      setTokenAmount(BigNumber.from(e.target.value))
                    }
                    className={styles.input}
                  />
                  <button onClick={mintToken} className={styles.button}>
                    Buy CD Token
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>

        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
