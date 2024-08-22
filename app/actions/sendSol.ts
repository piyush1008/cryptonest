import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  import bs58 from "bs58";
  
  // Define the RPC endpoint
  const SOLANA_RPC_ENDPOINT = "https://solana-mainnet.g.alchemy.com/v2/W2OpSO0HgGooQMWH938zkYqzcL7MNim9"; // Replace with testnet or devnet as needed
  
  // Function to send SOL
  export async function sendSol(privateKey: string, destinationAddress: string, amountInSol: number) {
    // Initialize connection to the RPC node
    const connection = new Connection(SOLANA_RPC_ENDPOINT, "confirmed");
    console.log("kasflkfjlsajfklsjfkasjfd");
  
    // Decode the base58-encoded private key to a Uint8Array
    const secretKey = bs58.decode(privateKey);
    const senderKeypair = Keypair.fromSecretKey(secretKey);

    console.log("sendderkeyPair", senderKeypair)
  
    // Create a transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: new PublicKey(destinationAddress),
        lamports: amountInSol * 1e9, // Convert SOL to lamports (1 SOL = 1e9 lamports)
      })
    );
    console.log("sendSol is getting printed", transaction);
    // Send and confirm the transaction
    try {
      const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
      console.log("Transaction successful with signature:", signature);
      return signature; // Return the transaction signature
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error; // Rethrow the error after logging
    }
  }
  