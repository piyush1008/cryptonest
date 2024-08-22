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
                      <div onClick={()=>handleDeleteWallet(index)} className="flex flex-col justify-center hover:cursor-pointer transition hover:-translate-y-1 hover:scale-110  duration-300">
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

const CopyButton=()=>{
    return(
        <div>
        <Copy className="size-4" /> Click Here To Copy
        </div>
    )
}