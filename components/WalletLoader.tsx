import { ReactNode, useState } from 'react'
import { useSigningClient } from 'contexts/cosmwasm'
import Loader from './Loader'
import Emoji from './Emoji'
import Web3 from 'web3'
import axios from "axios";

function WalletLoader({
  children,
  loading = false,
}: {
  children: ReactNode
  loading?: boolean
}) {

  const {
    walletAddress: addressKeplr,
    loading: clientLoading,
    error,
    connectWallet: connectWalletKeplr,
  } = useSigningClient()

  const [addressMetamask, setAddressMetamask] = useState("");

  if (loading || clientLoading) {
    return (
      <div className="flex justify-center">
        <Loader />
      </div>
    )
  }

  const registerAddress = (addr: string) => {
    axios({
      method: "post",
      url: `https://backend.ddbc.dev/api/v1/account/add/${addr}`
    }).then(res => console.log(res))
      .catch(err => console.log("REGIST_ERROR", err))
  }

  const connectWallet = async () => {
    if (!addressKeplr) connectWalletKeplr();
    if (!addressMetamask) connectMetamask();
  }

  const connectMetamask = async () => {
    if ((window as any).ethereum) {
      console.log(process.env.NEXT_PUBLIC_CHAIN_DD_ENDPOINT)
      try {
        await (window as any).ethereum.enable();
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        setAddressMetamask(accounts[0]);

        const params = [{
          chainId: process.env.NEXT_PUBLIC_CHAIN_METAMASK_ID,
          chainName: process.env.NEXT_PUBLIC_CHAIN_NAME,
          nativeCurrency: {
            name: String(process.env.NEXT_PUBLIC_MAIN_DENOM).toUpperCase(),
            symbol: String(process.env.NEXT_PUBLIC_MAIN_DENOM).toUpperCase(),
            decimals: 18
          },
          rpcUrls: [process.env.NEXT_PUBLIC_CHAIN_DD_ENDPOINT],
          // blockExplorerUrls: ['https://explorer.rsk.co']
        }]

        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: process.env.NEXT_PUBLIC_CHAIN_METAMASK_ID }],
          });

          registerAddress(walletAddress);

        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await (window as any).ethereum.request({
                method: 'wallet_addEthereumChain',
                params
              });

              registerAddress(walletAddress);

            } catch (addError) {
              console.error("MetaMask does not support adding custom RPCs.");
            }
          }
          console.error("MetaMask can't switch to this RPC.");
        }

      } catch (error) {
        console.error("User denied access to MetaMask.", error);
      }
    }
    else {
      alert('Please install MetaMask to use this feature');
    }
  }

  if (addressKeplr === '') {
    return (
      <div className="max-w-full">
        <h1 className="text-4xl font-bold">
          Welcome to
        </h1>
        <h1 className="mt-4 text-6xl font-bold">
          <Emoji label="dog" symbol="🐶" />
          <span>{' FCO Wallet Connection '}</span>
          <Emoji label="dog" symbol="🐶" />
        </h1>

        <p className="mt-6 text-2xl">
          Get started by installing{' '}
          <a
            className="pl-1 link link-primary link-hover"
            href="https://keplr.app/"
          >
            Keplr wallet
          </a>,
          <a
            className="pl-1 link link-primary link-hover"
            href="https://metamask.io/"
          >
            Metamask wallet
          </a>
        </p>

        <div className="flex flex-wrap items-center justify-around md:max-w-4xl mt-8 sm:w-full">
          <button
            className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus"
            onClick={connectWallet}
          >
            <h3 className="text-2xl font-bold">
              <span className="pr-4">Complete your KYC &rarr;</span>
              <Emoji label="poodle" symbol="🐩" />
            </h3>
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return <code>{JSON.stringify(error)}</code>
  }

  registerAddress(addressKeplr);

  return (
    <>
      <div>
        <h1 className="mt-4 text-2xl">Bitomm Address: {addressKeplr}</h1>
        <h1 className="mt-4 text-2xl">Metamask Address: {addressMetamask}</h1>
      </div>
      {children}
    </>
  );
}

export default WalletLoader
