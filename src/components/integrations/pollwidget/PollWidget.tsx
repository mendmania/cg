// src/components/integrations/pollwidget/PollWidget.tsx
import React, { useState, useEffect } from "react";
import poolsData from "@/../data/pools.json";
import questionsData from "@/../data/questions.json";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { spendCoins, addCoins } from "@/store/userSlice";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface Answer {
  id: string;
  text: string;
  cost: number;
}

interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

interface Pool {
  id: string;
  title: string;
  description: string;
  questionIds: string[];
}

const PollWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const coinBalance = user.coins;

  // 1) Which pool is open?
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  // 2) The single question to display (first in selectedPool.questionIds)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // 3) Which answer ID is chosen
  const [selectedAnswerId, setSelectedAnswerId] = useState<string>("");

  // 4) Feedback after voting
  const [voteMessage, setVoteMessage] = useState<string>("");

  // 5) Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [desiredPack, setDesiredPack] = useState<"100" | "250">("100");
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);

  // Whenever a new pool is selected, load its first question
  useEffect(() => {
    if (!selectedPool) {
      setSelectedQuestion(null);
      setSelectedAnswerId("");
      setVoteMessage("");
      return;
    }
    const firstQid = selectedPool.questionIds[0];
    const questionObj = (questionsData as Question[]).find(
      (q) => q.id === firstQid
    );
    if (questionObj) {
      setSelectedQuestion(questionObj);
    } else {
      setSelectedQuestion(null);
    }
    setSelectedAnswerId("");
    setVoteMessage("");
  }, [selectedPool]);

  // Handle Vote button
  const handleVote = async () => {
    if (!selectedQuestion) {
      setVoteMessage("No question available to vote on.");
      return;
    }
    if (!selectedAnswerId) {
      setVoteMessage("Please select an option before voting.");
      return;
    }

    const answerObj = selectedQuestion.answers.find(
      (a) => a.id === selectedAnswerId
    );
    if (!answerObj) {
      setVoteMessage("Invalid answer selection.");
      return;
    }

    const cost = answerObj.cost;
    if (cost > coinBalance) {
      // Instead of just showing an error, open modal to buy coins
      setDesiredPack(cost <= 100 ? "100" : "250");
      setShowModal(true);
      return;
    }

    // Deduct coins and show success
    dispatch(spendCoins(cost));
    setVoteMessage(
      `Thanks for voting! You spent ${cost} coin${cost !== 1 ? "s" : ""}.`
    );
    // (In a real app, also POST /api/vote and then sync user from server)
  };

  // Go back to pool list
  const goBackToPoolList = () => {
    setSelectedPool(null);
  };

  // Create a Stripe Checkout Session when user confirms purchase
  const handleBuyCoins = async () => {
    setIsCreatingSession(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: desiredPack }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.error || "Failed to create session");
        setIsCreatingSession(false);
        return;
      }
      const stripe = await stripePromise;
      if (!stripe) {
        console.error("Stripe.js failed to load");
        setIsCreatingSession(false);
        return;
      }
      // Redirect to Stripe Checkout
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      console.error("Error creating Stripe Checkout session:", err);
      setIsCreatingSession(false);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto p-6 border border-gray-200 rounded-lg bg-gray-50 font-sans">
        {/* Header */}
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
          📊 Pick a Pool to Vote In
        </h2>

        {/* Show user name + balance */}
        <div className="text-center text-lg text-gray-700 mb-4">
          {user.name}, you have{" "}
          <span className="font-bold text-blue-600">{coinBalance}</span> 🪙
        </div>

        {/* 1) Pool List */}
        {!selectedPool && (
          <div className="flex flex-col gap-4">
            {(poolsData as Pool[]).map((pool) => (
              <div
                key={pool.id}
                className="p-4 border border-gray-300 rounded-lg bg-white cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedPool(pool)}
              >
                <h3 className="text-xl font-medium text-blue-600 mb-1">
                  {pool.title}
                </h3>
                <p className="text-sm text-gray-600">{pool.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* 2) Single Question View */}
        {selectedPool && selectedQuestion && (
          <div className="flex flex-col gap-4">
            <button
              className="self-start text-blue-600 text-sm hover:underline"
              onClick={goBackToPoolList}
            >
              ← Back to pools
            </button>

            <div className="p-4 border border-gray-300 rounded-lg bg-white">
              <p className="text-base font-medium text-gray-800 mb-3">
                {selectedQuestion.text}
              </p>

              {selectedQuestion.answers.map((answer) => (
                <label
                  key={answer.id}
                  className="flex items-center mb-3 text-gray-700 text-sm"
                >
                  <input
                    type="radio"
                    name={`question-${selectedQuestion.id}`}
                    value={answer.id}
                    checked={selectedAnswerId === answer.id}
                    onChange={() => setSelectedAnswerId(answer.id)}
                    className="mr-2"
                  />
                  <span>
                    {answer.text}{" "}
                    <span className="italic text-gray-500">
                      ({answer.cost} 🪙)
                    </span>
                  </span>
                </label>
              ))}

              <button
                onClick={handleVote}
                className="w-full py-3 mt-2 bg-blue-600 text-white rounded-md text-base hover:bg-blue-700 transition-colors"
              >
                Vote (Spend Coins)
              </button>

              {voteMessage && (
                <div
                  className={
                    voteMessage.startsWith("Thanks")
                      ? "mt-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded-md"
                      : "mt-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded-md"
                  }
                >
                  {voteMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* If pool selected but question failed to load */}
        {selectedPool && !selectedQuestion && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded-md">
            Unable to load a question for this pool.
            <button
              className="block mt-2 text-blue-600 text-sm hover:underline"
              onClick={goBackToPoolList}
            >
              ← Back to pools
            </button>
          </div>
        )}
      </div>

      {/* === Stripe “Buy Coins” Modal === */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6 z-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Insufficient Coins
            </h3>
            <p className="text-gray-700 mb-4">
              You don’t have enough coins to vote. Purchase more coins below:
            </p>

            {/* Pack selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose a pack:
              </label>
              <select
                value={desiredPack}
                onChange={(e) =>
                  setDesiredPack(e.target.value as "100" | "250")
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="100">100 Coins — $5.00</option>
                <option value="250">250 Coins — $10.00</option>
              </select>
            </div>

            {/* Buy button */}
            <button
              onClick={handleBuyCoins}
              disabled={isCreatingSession}
              className="w-full py-2 bg-green-600 text-white rounded-md text-base hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isCreatingSession ? "Redirecting…" : "Buy Coins"}
            </button>

            {/* Cancel button */}
            <button
              onClick={() => setShowModal(false)}
              className="mt-3 w-full py-2 bg-gray-200 text-gray-700 rounded-md text-base hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PollWidget;
