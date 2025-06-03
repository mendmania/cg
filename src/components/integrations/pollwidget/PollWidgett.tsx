// src/components/integrations/pollwidget/PollWidget.tsx
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { spendCoins, addCoins } from "@/store/userSlice";
import StripeBuyModal from "@/components/modals/StripeBuyModal";
import Confetti from "react-confetti";

interface ChallengeOption {
  id: string;
  label: string;
  description: string;
  cost: number;
}

const TOTAL_PLAYERS = 30;

const CHALLENGE_OPTIONS: ChallengeOption[] = [
  {
    id: "harder-circle",
    label: "Make Circle Smaller",
    description: "Shrink the circle to make standing harder",
    cost: 15,
  },
  {
    id: "easier-circle",
    label: "Make Circle Larger",
    description: "Expand the circle to make standing easier",
    cost: 10,
  },
  {
    id: "kfc",
    label: "Send KFC",
    description: "Send a bucket of KFC to the player (distraction)",
    cost: 20,
  },
  {
    id: "shawarma",
    label: "Send Shawarma",
    description: "Send a shawarma combo to the player",
    cost: 18,
  },
  {
    id: "burger-king",
    label: "Send Burger King",
    description: "Send a BK meal to the player",
    cost: 22,
  },
  {
    id: "one-foot",
    label: "Stand on One Foot",
    description: "Force the player to stand on one foot instead of two",
    cost: 25,
  },
];

const PollWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const coinBalance = user.coins;

  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<ChallengeOption | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Stripe modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track window size for full-page confetti
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setSelectedOption(null);
    setFeedbackMessage("");
    setShowConfetti(false);
  }, [selectedPlayer]);

  const handleApplyChallenge = () => {
    if (!selectedOption) {
      setFeedbackMessage("Please choose a challenge to apply.");
      return;
    }
    if (selectedOption.cost > coinBalance) {
      setFeedbackMessage("");
      setIsModalOpen(true);
      return;
    }
    dispatch(spendCoins(selectedOption.cost));
    setFeedbackMessage(
      `Challenge "${selectedOption.label}" applied to player ${selectedPlayer}!`
    );
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 10000);
  };

  const handlePaymentSuccess = (coinsPurchased: number) => {
    dispatch(addCoins(coinsPurchased));
    setFeedbackMessage(`You purchased ${coinsPurchased} coins! Apply your challenge now.`);
  };

  const handlePaymentError = (msg: string) => {
    setFeedbackMessage(`Purchase failed: ${msg}`);
  };

  return (
    <>
      <div className="max-w-3xl mx-auto my-8 p-8 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl shadow-lg font-sans relative">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 animate-pulse-slow">
            Car‐Hand Challenge
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">{user.name}</span>
            <span className="text-yellow-600 font-bold text-lg">
              {coinBalance} 🪙
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 active:bg-green-800 transform hover:scale-105 transition duration-200"
            >
              Buy Coins
            </button>
          </div>
        </header>

        {/* 1) Player Selection Grid */}
        {!selectedPlayer && (
          <section>
            <p className="text-gray-600 mb-4">
              30 players have their hands on the car. Select a player to challenge:
            </p>
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: TOTAL_PLAYERS }, (_, idx) => idx + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedPlayer(num)}
                  className="h-10 flex items-center justify-center bg-blue-200 text-blue-800 font-semibold rounded-lg hover:bg-blue-300 transition transform hover:scale-105"
                >
                  {num}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 2) Challenge Options for Selected Player */}
        {selectedPlayer && (
          <section className="mt-6">
            <button
              className="mb-4 text-blue-600 text-sm hover:underline"
              onClick={() => setSelectedPlayer(null)}
            >
              ← Change player
            </button>

            <p className="text-gray-700 mb-4">
              You selected player <span className="font-bold">{selectedPlayer}</span>. 
              Choose a challenge to apply:
            </p>

            <div className="space-y-4">
              {CHALLENGE_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-4 border rounded-lg cursor-pointer transition transform hover:scale-102 ${
                    selectedOption?.id === opt.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 bg-white hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-800">{opt.label}</h4>
                    <span className="text-gray-600 italic">Cost: {opt.cost} 🪙</span>
                  </div>
                  <p className="text-gray-600 mt-1">{opt.description}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleApplyChallenge}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-md text-base hover:bg-blue-700 active:bg-blue-800 transform hover:scale-103 transition duration-200"
            >
              Apply Challenge
            </button>

            {feedbackMessage && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded-md animate-fade-in">
                {feedbackMessage}
              </div>
            )}
          </section>
        )}

        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={2000}
            recycle={false}
            className="fixed top-0 left-0 pointer-events-none"
          />
        )}
      </div>

      {/* Stripe Modal for Buying Coins */}
      <StripeBuyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </>
  );
};

export default PollWidget;
