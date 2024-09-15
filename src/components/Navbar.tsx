import React from 'react'
import CustomWalletConnect from './wallets/CustomWalletConnect'
export default function Navbar() {
  return (
    <div className="flex justify-end p-4 bg-gradient-to-r from-blue-500 to-purple-600" >
        <CustomWalletConnect />
    </div>
  )
}
