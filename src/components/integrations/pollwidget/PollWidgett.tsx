// src/components/integrations/pollwidget/PollWidget.tsx
import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { spendCoins, addCoins } from "@/store/userSlice";
import StripeBuyModal from "@/components/modals/StripeBuyModal";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface ChallengeOption {
  id: string;
  label: string;
  description: string;
  cost: number;   // cost per vote unit
  votes: number;  // total coins spent on this option
}

const POLL_LIMIT = 2000;   // maximum coin-votes per option
const VOTE_AMOUNTS = [10, 50, 90];

const PollWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const coinBalance = user.coins;

  const [options, setOptions] = useState<ChallengeOption[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track which option was just voted
  const [lastVotedId, setLastVotedId] = useState<string | null>(null);
  // Track which option is newly at top
  const [highlightTopId, setHighlightTopId] = useState<string | null>(null);
  const prevTopRef = useRef<string | null>(null);

  // Disable further voting for a short period after a vote
  const [voting, setVoting] = useState(false);

  // Window size for full-page confetti
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load initial options: 10 teams for "make circle smaller" challenge
  useEffect(() => {
    const initialOptions: ChallengeOption[] = Array.from({ length: 10 }, (_, i) => {
      const teamNum = i + 1;
      return {
        id: `team-${teamNum}`,
        label: `Team ${teamNum}`,
        description: `Vote to make circle smaller for Team ${teamNum}`,
        cost: 1,  // each vote unit costs 1 coin per coin spent
        votes: 0,
      };
    });
    setOptions(initialOptions);

    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl("/challengeHub")
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        connection.on("VoteUpdate", (updated: { id: string; votes: number }[]) => {
          setOptions((prev) =>
            prev.map((o) => {
              const upd = updated.find((u) => u.id === o.id);
              return upd ? { ...o, votes: upd.votes } : o;
            })
          );
        });
        connection.invoke("RequestVotes").catch(() => {});
      })
      .catch(() => {
        // If SignalR fails, keep initial votes at zero
      });

    return () => {
      connection.stop().catch(() => {});
    };
  }, []);

  // Sort options by total coins spent descending
  const sortedOptions = [...options].sort((a, b) => b.votes - a.votes);

  // Detect when the top option changes
  useEffect(() => {
    if (sortedOptions.length === 0) return;
    const currentTop = sortedOptions[0].id;
    if (prevTopRef.current && prevTopRef.current !== currentTop) {
      setHighlightTopId(currentTop);
      setTimeout(() => setHighlightTopId(null), 1500);
    }
    prevTopRef.current = currentTop;
  }, [sortedOptions]);

  // Check if any option has reached the coin-vote limit
  const pollClosed = sortedOptions.some((opt) => opt.votes >= POLL_LIMIT);

  const handleVote = (opt: ChallengeOption, coinAmount: number) => {
    if (voting) return; // prevent spamming
    if (pollClosed) {
      setFeedbackMessage("Voting has closed: an option reached the 2000-coin limit.");
      return;
    }
    if (opt.votes + coinAmount > POLL_LIMIT) {
      setFeedbackMessage(
        `Cannot spend ${coinAmount} coins; would exceed 2000-coin limit on "${opt.label}".`
      );
      return;
    }
    if (coinAmount > coinBalance) {
      setFeedbackMessage("");
      setIsModalOpen(true);
      return;
    }

    setVoting(true);
    dispatch(spendCoins(coinAmount));

    // Increment locally by coinAmount and highlight vote
    setOptions((prev) =>
      prev.map((o) =>
        o.id === opt.id ? { ...o, votes: o.votes + coinAmount } : o
      )
    );
    setLastVotedId(opt.id);
    setTimeout(() => setLastVotedId(null), 1000);

    // Simulate server broadcast
    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl("/challengeHub")
      .withAutomaticReconnect()
      .build();
    connection
      .start()
      .then(() => {
        connection.invoke("SubmitVote", opt.id, coinAmount).catch(() => {});
      })
      .catch(() => {});
    setFeedbackMessage(`You spent ${coinAmount} coins on "${opt.label}"!`);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    // Re-enable voting after short delay
    setTimeout(() => setVoting(false), 800);
  };

  const handlePaymentSuccess = (coinsPurchased: number) => {
    dispatch(addCoins(coinsPurchased));
    setFeedbackMessage(`Purchased ${coinsPurchased} coins! Vote again.`);
  };

  const handlePaymentError = (msg: string) => {
    setFeedbackMessage(`Purchase failed: ${msg}`);
  };

  return (
    <>
      <div className="py-10 px-4 bg-white">
        <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg font-sans">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Car‐Hand Challenge
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">{user.name}</span>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500 font-bold text-lg">
                  {coinBalance}
                </span>
                <span className="text-yellow-500">🪙</span>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 active:bg-yellow-700 transform hover:scale-105 transition duration-200"
              >
                🪙 Buy
              </button>
            </div>
          </header>

          {pollClosed && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg text-center font-semibold">
              Voting closed: an option reached 2000 coins.
            </div>
          )}

          <motion.div layout>
            <AnimatePresence>
              {sortedOptions.map((opt) => {
                const votesPct = Math.round((opt.votes / POLL_LIMIT) * 100);
                const justVoted = lastVotedId === opt.id;
                const isTopHighlight = highlightTopId === opt.id;
                const coinsRemaining = Math.max(0, POLL_LIMIT - opt.votes);

                // If remaining is less than smallest increment, show that remaining button
                const showExactRemaining =
                  !pollClosed && opt.votes < POLL_LIMIT && coinsRemaining < VOTE_AMOUNTS[0];

                return (
                  <motion.div
                    key={opt.id}
                    layout
                    className={`
                      mb-4 p-5 rounded-lg ${
                        isTopHighlight
                          ? "bg-yellow-50 border-yellow-300"
                          : "bg-white border-gray-200"
                      } border shadow-md
                      ${pollClosed ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg"}
                    `}
                    animate={
                      justVoted
                        ? { scale: [1, 1.05, 1], backgroundColor: ["#ffffff", "#e6ffed", "#ffffff"] }
                        : {}
                    }
                    transition={justVoted ? { duration: 0.6 } : {}}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                          {opt.label}
                          {opt.votes >= POLL_LIMIT && (
                            <span className="ml-3 px-2 py-1 bg-red-200 text-red-800 text-xs font-semibold rounded-full">
                              LIMIT REACHED
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {opt.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {opt.votes} / {POLL_LIMIT} 🪙
                        </div>
                      </div>
                    </div>

                    {/* Vote buttons with coin amounts */}
                    <div className="flex space-x-2 mb-3">
                      {showExactRemaining ? (
                        <motion.button
                          onClick={() => handleVote(opt, coinsRemaining)}
                          disabled={pollClosed || voting}
                          whileTap={{ scale: 0.95 }}
                          className={`flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium ${
                            voting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                          } transition duration-200`}
                        >
                          <span className="text-base">🪙</span>
                          <span className="ml-1">{coinsRemaining}</span>
                        </motion.button>
                      ) : (
                        VOTE_AMOUNTS.map((coinAmount) => {
                          const disabled =
                            pollClosed ||
                            voting ||
                            opt.votes + coinAmount > POLL_LIMIT;
                          return (
                            <motion.button
                              key={coinAmount}
                              onClick={() => handleVote(opt, coinAmount)}
                              disabled={disabled}
                              whileTap={disabled ? {} : { scale: 0.95 }}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                                disabled
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 hover:scale-105"
                              }`}
                            >
                              <span className="text-base">🪙</span>
                              <span className="ml-1">{coinAmount}</span>
                            </motion.button>
                          );
                        })
                      )}
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-3 bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${votesPct}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="text-right text-xs text-gray-600 mt-1">
                        {votesPct}% of limit
                      </p>
                      {!pollClosed && opt.votes < POLL_LIMIT && (
                        <p className="text-xs text-gray-500 mt-1">
                          {coinsRemaining} 🪙 remaining
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {feedbackMessage && (
            <motion.div
              className="mt-6 p-3 bg-green-100 text-green-800 border border-green-300 rounded-lg text-center font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {feedbackMessage}
            </motion.div>
          )}

          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              numberOfPieces={300}
              recycle={false}
              className="fixed top-0 left-0 pointer-events-none"
            />
          )}
        </div>
      </div>

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
