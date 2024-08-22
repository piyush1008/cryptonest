import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {Toaster} from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoNest",
  description: "Creating Crypto Wallet",
  icons:{
    icon:"/CryptoWallet.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="bottom-right" />
        {children}
        </body>
    </html>
  );
}
