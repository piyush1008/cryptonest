"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { sendSol } from "../actions/sendSol";


const SendMoney = () => {
  const [destinationAddress, setDestinationAddress] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    const storedWallet = localStorage.getItem("selectedWallet");
    if (!storedWallet) {
      toast.error("No wallet selected.");
      setLoading(false);
      return;
    }

    const wallet = JSON.parse(storedWallet);
    console.log("wallet inside the sendMoney",wallet);
    try {
      const signature = await sendSol(wallet.privateKey, destinationAddress, amount);
      toast.success(`Transaction successful! Signature: ${signature}`);
    } catch (error) {
      toast.error("Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 p-4 min-h-[92vh]">
        <div className="flex flex-col">
            <div className="flex justify-center">
                <h1 className="text-3xl">Send SOL</h1>
            </div>
        
            <div>
                <div className="mb-6">
                    <label htmlFor="text" className="block mb-2 text-lg font-medium text-gray-900 dark:text-white">Destination Address</label>
                    <input type="text" id="destination" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                </div>
            </div>
            <div>
                <div className="mb-6">
                    <label htmlFor="number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Amount</label>
                    <input type="number" id="amount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                </div>
            </div>
        </div>
        <button onClick={handleSend} disabled={loading} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
        {loading ? "Sending..." : "Send SOL"}</button>

    </div>
  );
};

export default SendMoney;
