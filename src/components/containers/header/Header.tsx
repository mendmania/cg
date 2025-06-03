// src/components/fundamentals/header/Header.tsx
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addCoins } from "@/store/userSlice";
import StripeBuyModal from "@/components/modals/StripeBuyModal";
import { Button } from "@/components/fundamentals/button/Button";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  onClose?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Carvago",
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handleBuySuccess = (coinsPurchased: number) => {
    dispatch(addCoins(coinsPurchased));
    setPurchaseError(null);
  };

  const handleBuyError = (message: string) => {
    setPurchaseError(message);
  };

  return (
    <>
      <header className="w-full bg-white top-0 z-20 shadow-md flex items-center justify-between px-6 py-4 transition-shadow duration-300 hover:shadow-lg">
        <Link href="/" passHref>
          <h1 className="text-2xl font-semibold text-gray-800 animate-pulse-slow hover:text-blue-600 transition-colors">
            {title}
          </h1>
        </Link>
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">{user.name}</span>
            <span className="text-yellow-600 font-bold">{user.coins} 🪙</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 active:bg-green-800 transform hover:scale-105 transition duration-200"
          >
            Buy Coins
          </button>
          {onClose && (
            <Button
              variant="secondary"
              onClick={onClose}
              className="hover:bg-gray-100 transform hover:scale-105 transition duration-200"
            >
              Close
            </Button>
          )}
        </div>
      </header>

      {purchaseError && (
        <div className="mx-6 mt-2 p-3 border border-red-300 bg-red-100 text-red-800 rounded-md animate-fade-in">
          {purchaseError}
        </div>
      )}

      <StripeBuyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleBuySuccess}
        onError={handleBuyError}
      />
    </>
  );
};

export default Header;
