"use client";

import { useState } from "react";
import { Generate, SendMoney} from "./ui/Button";
import { toast } from "react-hot-toast";
import bs58 from "bs58";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import {
    ChevronDown,
    ChevronUp,
    Copy,
    Eye,
    EyeOff,
    Grid2X2,
    List,
    Trash,
  } from "lucide-react";
import { AddWallet } from "./ui/Button";
import { ClearWallet } from "./ui/Button";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { useRouter } from "next/navigation";

export interface Wallet {
    publicKey: string;
    privateKey: string;
    mnemonic: string;
    path: string;
  }

export const WalletGenerator=()=>{
    const [mnemonic, setMnemonic]=useState("");
    const [showSeed, setSeed]=useState(false);
    const [seeded,setSeeded]=useState<string[]>();

    const [wallets,setWallets]=useState<Wallet[]>([]);
    const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([]);

    const [seed,setShowSeed]=useState(true);

    const genMnemonic=async()=>{
      const mn = await generateMnemonic();
      console.log("generateMnemonic",mn)
      setMnemonic(mn)
      const words = mn.split(" ");
      setSeeded(words);
      setSeed(!showSeed)
    }


    const GenerateWallet=(pathType: string,
        accountIndex: number)=>{
        try {
            const seedBuffer = mnemonicToSeed(mnemonic);
            const path = `m/44'/${pathType}'/0'/${accountIndex}'`;
            const { key: derivedSeed } = derivePath(path, seedBuffer.toString());
      
            let publicKeyEncoded: string;
            let privateKeyEncoded: string;
      
         
            const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
            const keypair = Keypair.fromSecretKey(secretKey);
    
            privateKeyEncoded = bs58.encode(secretKey);
            publicKeyEncoded = keypair.publicKey.toBase58();
         
            return {
              publicKey: publicKeyEncoded,
              privateKey: privateKeyEncoded,
              mnemonic,
              path,
            };
          } catch (error) {
            toast.error("Failed to generate wallet. Please try again.");
            return null;
          }
    }

    const handleGeneration=()=>{
        const words=mnemonic.split(" ");

        const wallet=GenerateWallet('501',wallets.length)

        console.log("walllet value ",wallet);
    
        if(wallet)
        {
            const updateWallets=[...wallets,wallet];
            setWallets(updateWallets);

            setVisiblePrivateKeys([...visiblePrivateKeys, false]); 
            // localStorage.setItem("wallets", JSON.stringify(updateWallets));
            // localStorage.setItem("mnemonics", JSON.stringify(words));
            // localStorage.setItem("paths", JSON.stringify(pathTypes));
            toast.success("Wallet generated successfully!");
        }
    }

   

    const DeleteWallet=()=>{
        
    }
    const handleDelete=()=>{
        setWallets([]);
        setVisiblePrivateKeys([]);
        toast.success("Wallets Cleared")
    }
    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      };
    const HideSeedPhase=()=>{
        setShowSeed(!seed);
    }
    return(
        <div className="flex flex-col">
            <div className="flex flex-row justify-between">
                <div className="text-2xl">
                    Solana Secret Phase
                </div>
                <div>
                   {!showSeed? <Generate  onClick={genMnemonic} text={"Generate Secret"} /> :""}
                    
                
                </div>
            </div>
           
            {seeded  && showSeed && (
                <div>
                  <div className="rounded-md border-2 border-slate-800 flex flex-col w-full max-h-88 mt-4">
                    {seed && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto  p-6">
                        {seeded.map((word,index)=>{
                                return <p key={index} className="border-2 border-slate-800 rounded-md text-center p-2 hover:bg-gray-500">
                                    {word}

                                </p>
                        })}
                        </div>

                    )}
                        
                        <div className="flex flex-row justify-between">
                            <div onClick={()=>copyToClipboard(mnemonic)} className="text-sm mx-6 my-2 items-center transition hover:cursor-pointer hover:-translate-y-1 hover:scale-110  duration-300 ">
                            {seed ? <CopyButton />: ""}    
                            </div>
                            <div className="py-6 mx-6 hover:cursor-pointer" onClick={HideSeedPhase}>
                               {seed ? <Eye size={16} />: <EyeOff size={16} />}
                            </div>


                        </div>
                  </div>

                  <div className="flex flex-row justify-between mt-10">
                    <div className="text-3xl">
                        Solana Wallet
                    </div>
                    <div>
                        <span><AddWallet text={"Add Wallet"} onClick={handleGeneration} /></span>
                        <span><ClearWallet text={"Clear Wallet"}  onClick={handleDelete}/></span>

                    </div>

                  </div>
                </div>
                  
            )}
            {/* display the wallet */}
            
            {wallets.length >0 && (
                <div>
                {wallets.map((wallet:any,index:number)=>{
                    console.log("index inside main function is ", index);
                    return(
                        <Showwallet wallet={wallet} index={index} key={index} visiblePrivateKeys={visiblePrivateKeys} setVisiblePrivateKeys={setVisiblePrivateKeys}
                        setWallets={setWallets} wallets={wallets}/>
                    )
                })}
                </div>


            )}
          

         
        </div>
    )
}


const Showwallet=({wallet,index,visiblePrivateKeys,setVisiblePrivateKeys,setWallets,wallets}:any)=>{
  const router=useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const sendMoney = (index: number) => {
    console.log("Wallet at index", wallets[index]);

    // Store the selected wallet in localStorage
    localStorage.setItem("selectedWallet", JSON.stringify(wallets[index]));

    // Navigate to the /sendmoney page
    router.push("/sendmoney");
  };

    const togglePrivateKeyVisibility = (index: number) => {
        console.log("index inside toogle",index)
        setVisiblePrivateKeys(
          visiblePrivateKeys.map((visible:boolean, i:number) => (i === index ? !visible : visible))
        );
      };
      const handleDeleteWallet = (index: number) => {
        const updatedWallets = wallets.filter((_:any, i:any) => i !== index);
        setWallets(updatedWallets);
        setVisiblePrivateKeys(visiblePrivateKeys.filter((_:any, i:any) => i !== index));

        toast.success("Wallet deleted successfully!");
      };
   
      console.log("index is ",index)

    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      };
      console.log("Wallet value inside the function",wallet)
      console.log("visiblePrivateKyes",visiblePrivateKeys);
    return(
        <div>
            {modalOpen? <OpenModal modalOpen={modalOpen} setModelOpen={setModalOpen} handleDeleteWallet={handleDeleteWallet} index={index} setWallets={setWallets}  wallets={wallets} visiblePrivateKeys={visiblePrivateKeys} setVisiblePrivateKeys={setVisiblePrivateKeys} />:null }

            <div className="flex flex-col gap-8 px-8 py-4 border-2 mt-8 rounded-md border-slate-800">
                <div className="flex flex-row justify-between">
                    <div>
                        <p className="text-xl">
                        Wallet {index+1}
                        </p>
                    </div>
                    <div className="flex flex-row justify-between">
                      <div className="mx-2">
                        <SendMoney text={"Send Money"} onClick={()=>sendMoney(index)}/>
                      </div>
                      <div onClick={()=>toggleModal()} className="flex flex-col justify-center hover:cursor-pointer transition hover:-translate-y-1 hover:scale-110  duration-300">
                          <Trash color="red" size={20} />
                      </div>  
                    </div> 
                </div>
        
                  <div
                    className="flex flex-col w-full gap-2"
                    onClick={() => copyToClipboard(wallet.publicKey)}
                  >
                    <span className="text-lg md:text-xl font-bold tracking-tighter">
                      Public Key
                    </span>
                    <p className="font-medium text-slate-400 cursor-pointer hover:text-primary ">
                      {wallet.publicKey}
                    </p>
                  </div>
                  
                    <div className="flex flex-col w-full gap-2">
                      <span className="text-lg md:text-xl font-bold tracking-tighter">
                        Private Key
                      </span>
                      <div className="flex justify-between w-full items-center gap-2">
                        <p
                          onClick={() => copyToClipboard(wallet.privateKey)}
                          className="font-medium text-slate-400 cursor-pointer hover:text-primary transition-all duration-300 truncate"
                        >

                          {visiblePrivateKeys[index]
                            ? wallet.privateKey
                            : "•".repeat(wallet.mnemonic.length)}
                        </p>
                        <button
                          onClick={() => togglePrivateKeyVisibility(index)}
                        >
                          {visiblePrivateKeys[index] ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      
                      </div>
                    </div>
                  
            </div>
        </div>
    )
}

const OpenModal=({modalOpen,setModelOpen,handleDeleteWallet,index, setWallets,wallets,visiblePrivateKeys,setVisiblePrivateKeys}:any)=>{

  const closeAndDeleteWallet=()=>{
    const updatedWallets = wallets.filter((_:any, i:any) => i !== index);
    setWallets(updatedWallets);
    setVisiblePrivateKeys(visiblePrivateKeys.filter((_:any, i:any) => i !== index));
    setModelOpen(!modalOpen)

    toast.success("Wallet deleted successfully!");
  }
  return(
    <div id="popup-modal" tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button type="button" className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                  </svg>
                  <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                  <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  </svg>
                  <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this Wallet?</h3>
                  <button onClick={()=> closeAndDeleteWallet()} data-modal-hide="popup-modal" type="button" className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                      Yes, I'm sure
                  </button>
                  <button onClick={()=> setModelOpen(!modalOpen)} data-modal-hide="popup-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">No, cancel</button>
              </div>
          </div>
      </div>
</div>
  )
}


const CopyButton=()=>{
    return(
        <div>
        <Copy className="size-4" /> Click Here To Copy
        </div>
    )
}