import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { TopBar } from "../components/TopBar";
import { BackButton } from "../components/BackButton";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import { ApiError } from "../api/http";
import {
  getColorPredictionHistory,
  getColorPredictionRound,
  getColorPredictionMyBets,
  postColorPredictionBet,
  type ColorHistoryRow,
  type ColorRound,
} from "../api/endpoints/colorPredictionApi";
import { toast } from "sonner";
import { Shield, RefreshCw, Info } from "lucide-react";
import { GameFooter } from "../components/GameFooter";

type GameResult = "red" | "blue";

export function Game() {
  const {
    balance,
    updateBalance,
    formatCurrency: globalFormatCurrency,
    currencyPreference,
    gameBalance,
    updateGameBalance,
  } = useUser();
  const { openAuthModal } = useAuth();
  const { token, refreshUser } = useSession();

  const [betAmount, setBetAmount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedColor, setSelectedColor] = useState<"red" | "blue" | null>(
    null,
  );
  const [apiRound, setApiRound] = useState<ColorRound | null>(null);
  const [historyRows, setHistoryRows] = useState<ColorHistoryRow[]>([]);
  const [tick, setTick] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastWinner, setLastWinner] = useState<GameResult | null>(null);
  const [showProvablyFair, setShowProvablyFair] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [activeTab, setActiveTab] = useState<"yours" | "recent">("yours");
  const [showBetConfirmation, setShowBetConfirmation] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState<
    "win" | "loss" | "no-bet" | null
  >(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [placedBet, setPlacedBet] = useState<{
    color: "red" | "blue";
    amount: number;
  } | null>(null);
  type YourBetRow = {
    key: string;
    roundShort: string;
    color: GameResult;
    amount: number;
    result: string;
    payout: number;
  };

  const [yourBetHistory, setYourBetHistory] = useState<YourBetRow[]>([]);

  const placedBetRef = useRef<{ color: "red" | "blue"; amount: number } | null>(
    null,
  );
  const placedRoundIdRef = useRef<string | null>(null);
  const lastRoundIdRef = useRef<string | null>(null);
  const settlingRef = useRef(false);
  const settlementPollCancelRef = useRef(false);

  const [isAwaitingOutcome, setIsAwaitingOutcome] = useState(false);

  const formatCurrency = (amount: number, hideDecimals?: boolean): string => {
    if (currencyPreference === "ngn") {
      return `₦${Math.floor(amount).toLocaleString("en-US")}`;
    } else {
      return `$${amount.toFixed(2)}`;
    }
  };

  const { redStakeDisplay, blueStakeDisplay, redPlayers, bluePlayers } =
    useMemo(() => {
      const bets = apiRound?.bets ?? [];
      let redSum = 0;
      let blueSum = 0;
      let redCt = 0;
      let blueCt = 0;
      for (const b of bets) {
        const amt = Number(b.amount);
        const p = String(b.pick).toUpperCase();
        if (p === "RED") {
          redSum += amt;
          redCt += 1;
        } else if (p === "BLUE") {
          blueSum += amt;
          blueCt += 1;
        }
      }
      return {
        redStakeDisplay: redSum,
        blueStakeDisplay: blueSum,
        redPlayers: redCt,
        bluePlayers: blueCt,
      };
    }, [apiRound]);

  const totalPool = redStakeDisplay + blueStakeDisplay;
  const recentIncreaseDisplay = totalPool > 0 ? totalPool * 0.05 : 0;

  const filteredChipHistory = useMemo((): GameResult[] => {
    const out: GameResult[] = [];
    for (const row of historyRows) {
      if (row.outcome === "RED") out.push("red");
      else if (row.outcome === "BLUE") out.push("blue");
      if (out.length >= 16) break;
    }
    return out;
  }, [historyRows]);

  /** Strip at top uses this array (derived from settled rounds). */
  const gameHistory = filteredChipHistory;

  const recentBets = useMemo(
    () =>
      historyRows.slice(0, 12).map((row) => ({
        user: `Round ${row.id.slice(0, 6).toUpperCase()}`,
        color:
          row.outcome === "RED"
            ? ("red" as GameResult)
            : ("blue" as GameResult),
        amount: 0,
        time: new Date(row.settlesAt).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    [historyRows],
  );

  const timeLeft = useMemo(() => {
    if (!apiRound?.locksAt) return 0;
    const locks = new Date(apiRound.locksAt).getTime();
    const settles = new Date(apiRound.settlesAt).getTime();
    const target = apiRound.status === "OPEN" ? locks : settles;
    return Math.max(0, Math.ceil((target - Date.now()) / 1000));
  }, [apiRound, tick]);

  const hasActiveRound = apiRound != null;

  const potentialWin = betAmount > 0 && selectedColor ? betAmount * 1.65 : 0;
  const potentialWinPercent = betAmount > 0 ? 65 : 0;

  useEffect(() => {
    const t = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancel = false;
    const poll = async () => {
      try {
        const r = await getColorPredictionRound();
        if (!cancel) setApiRound(r);
      } catch {
        /* ignore transient */
      }
    };
    void poll();
    const id = window.setInterval(() => void poll(), 1500);
    return () => {
      cancel = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let cancel = false;
    const poll = async () => {
      try {
        const rows = await getColorPredictionHistory();
        if (!cancel) setHistoryRows(rows);
      } catch {
        /* ignore */
      }
    };
    void poll();
    const id = window.setInterval(() => void poll(), 4000);
    return () => {
      cancel = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setYourBetHistory([]);
      return;
    }
    let cancel = false;
    const load = async () => {
      try {
        const rows = await getColorPredictionMyBets(token);
        if (cancel) return;
        setYourBetHistory(
          rows.map((b) => {
            const amt = Number(b.amount);
            const pay = Number(b.payout ?? 0);
            const pick = String(b.pick).toLowerCase();
            const color: GameResult = pick.includes("blue") ? "blue" : "red";
            const rid = typeof b.roundId === "string" ? b.roundId : b.id;
            const roundShort = rid.slice(0, 8);
            let resultStr = "pending";
            if (b.round.status === "SETTLED") {
              if (b.won === true) resultStr = "win";
              else if (b.won === false) resultStr = "loss";
            }
            return {
              key: b.id,
              roundShort,
              color,
              amount: Math.floor(amt),
              result: resultStr,
              payout: Math.floor(pay),
            };
          }),
        );
      } catch {
        if (!cancel) setYourBetHistory([]);
      }
    };
    void load();
    const id = window.setInterval(() => void load(), 6000);
    return () => {
      cancel = true;
      clearInterval(id);
    };
  }, [token]);

  const runWinnerSequence = useCallback(
    (winner: GameResult, settledRoundId: string) => {
      setIsSpinning(true);

      const baseRotation = 720 + 360 * 5;
      const finalRotation =
        winner === "red" ? baseRotation + 90 : baseRotation + 270;
      setSpinRotation(finalRotation);

      const betSnapshot = placedBetRef.current
        ? { ...placedBetRef.current }
        : null;

      window.setTimeout(() => {
        setLastWinner(winner);
        setShowResult(true);

        const played =
          !!betSnapshot &&
          placedRoundIdRef.current !== null &&
          placedRoundIdRef.current === settledRoundId;

        if (played && betSnapshot!.color === winner) {
          const won = betSnapshot!.amount * 1.65;
          setWinAmount(won);
          setResultType("win");
        } else if (played) {
          setResultType("loss");
          setWinAmount(betSnapshot!.amount);
        } else {
          setResultType("no-bet");
        }

        setIsPlaying(false);
        setPlacedBet(null);
        placedBetRef.current = null;
        placedRoundIdRef.current = null;

        window.setTimeout(() => {
          setShowResult(false);
          setIsSpinning(false);
          setSpinRotation(0);
          setLastWinner(null);
          setShowResultModal(true);
          void refreshUser();

          window.setTimeout(() => {
            setSelectedColor(null);
            setBetAmount(0);
          }, 500);
        }, 3000);
      }, 4000);
    },
    [refreshUser],
  );

  useEffect(() => {
    if (!apiRound?.id) return;
    const id = apiRound.id;
    const prev = lastRoundIdRef.current;
    if (prev === null) {
      lastRoundIdRef.current = id;
      return;
    }
    if (prev === id) return;
    if (settlingRef.current) return;

    lastRoundIdRef.current = id;
    settlingRef.current = true;
    settlementPollCancelRef.current = false;
    setIsAwaitingOutcome(true);

    void (async () => {
      try {
        while (!settlementPollCancelRef.current) {
          try {
            const hist = await getColorPredictionHistory();
            if (settlementPollCancelRef.current) return;

            const row = hist.find((h) => h.id === prev);
            const out = row?.outcome;
            if (out === "RED" || out === "BLUE") {
              setIsAwaitingOutcome(false);
              const winner: GameResult = out === "BLUE" ? "blue" : "red";
              runWinnerSequence(winner, prev);
              return;
            }
          } catch {
            /* retry on transient errors */
          }

          await new Promise((resolve) => window.setTimeout(resolve, 1500));
        }
      } finally {
        window.setTimeout(() => {
          settlingRef.current = false;
        }, 9000);
      }
    })();

    return () => {
      settlementPollCancelRef.current = true;
    };
  }, [apiRound?.id, runWinnerSequence]);

  const handlePlaceBet = () => {
    if (!token) {
      openAuthModal("login");
      toast.error("Sign in to place a bet");
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (betAmount <= 0) {
      toast.error("Please enter a bet amount");
      return;
    }
    if (betAmount > gameBalance) {
      setErrorMessage("Insufficient gaming balance!");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    if (!apiRound || apiRound.status !== "OPEN") {
      toast.error(
        apiRound ? "Round is locked — wait for next round" : "Waiting for next round…",
      );
      return;
    }
    if (timeLeft <= 0) {
      toast.error("Betting closed for this round");
      return;
    }

    setShowBetConfirmation(true);
  };

  const confirmBet = async () => {
    if (!token || !selectedColor || !apiRound?.id) return;

    try {
      await postColorPredictionBet(token, {
        pick: selectedColor,
        amount: betAmount,
      });

      setIsPlaying(true);
      setShowBetConfirmation(false);
      toast.success("Bet placed successfully!");

      placedRoundIdRef.current = apiRound.id;
      placedBetRef.current = { color: selectedColor, amount: betAmount };
      setPlacedBet({ color: selectedColor, amount: betAmount });

      await refreshUser();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Bet failed";
      toast.error(msg);
      setShowBetConfirmation(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLastFiveSeconds = timeLeft <= 5 && timeLeft > 0;

  const roundLabel = apiRound?.id
    ? apiRound.id.slice(0, 8).toUpperCase()
    : "…";

  const latestRevealed = historyRows[0];

  const generateNewClientSeed = () => {
    toast.info("Outcome uses server-side seeds — client seed not used.");
  };

  const handleDeposit = () => {
    if (transferAmount <= 0) {
      toast.error("Please enter an amount");
      return;
    }
    if (transferAmount > balance) {
      toast.error("Insufficient main balance");
      return;
    }

    updateBalance(-transferAmount);
    updateGameBalance(transferAmount);
    toast.success(
      `Deposited ${formatCurrency(transferAmount)} to Game Balance`,
    );
    setShowDepositModal(false);
    setTransferAmount(0);
  };

  const handleWithdrawal = () => {
    if (transferAmount <= 0) {
      toast.error("Please enter an amount");
      return;
    }
    if (transferAmount > gameBalance) {
      toast.error("Insufficient game balance");
      return;
    }

    updateGameBalance(-transferAmount);
    updateBalance(transferAmount);
    toast.success(`Withdrew ${formatCurrency(transferAmount)} to Main Balance`);
    setShowWithdrawalModal(false);
    setTransferAmount(0);
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "#0F1419" }}
    >
      <TopBar />

      {/* Responsive Container - Matches Predictions Pattern */}
      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Top Section - Flex Container */}
        <div
          className="flex items-center justify-between w-full"
          style={{
            gap: "clamp(8px, 2vw, 12px)",
            marginTop: "1rem",
            marginBottom: "1rem",
          }}
        >
          <BackButton className="mb-0 shrink-0" />
          <div
            className="flex items-center shrink-0"
            style={{ gap: "clamp(8px, 2vw, 12px)" }}
          >
            <div className="text-right">
              <p
                className="text-xs font-semibold leading-tight"
                style={{ color: "#9CA3AF" }}
              >
                Round
              </p>
              <p
                className="text-xl font-bold leading-tight"
                style={{ color: "#FFFFFF" }}
              >
                #{roundLabel}
              </p>
            </div>
            <button
              onClick={() => setShowRules(true)}
              className="flex items-center rounded-lg shrink-0"
              style={{
                backgroundColor: "var(--bg-card)",
                color: "var(--text-primary)",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
              }}
            >
              <Info className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap hidden sm:inline">
                Rules
              </span>
            </button>
          </div>
        </div>

        {/* Top Stats Banner - Responsive Grid */}
        <div
          className="w-full rounded-xl shadow-lg grid grid-cols-3"
          style={{
            backgroundColor: "var(--bg-card)",
            gap: "clamp(6px, 2vw, 12px)",
            padding: "clamp(8px, 3vw, 16px)",
            marginBottom: "1rem",
          }}
        >
          {/* RED */}
          <div
            className="flex flex-col items-center justify-center text-center rounded-lg min-w-0"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "2px solid #EF4444",
              padding: "clamp(6px, 2vw, 12px)",
            }}
          >
            <p
              className="text-xs font-bold mb-1 leading-tight"
              style={{ color: "#EF4444" }}
            >
              🔴 RED
            </p>
            <p
              className="text-xs mb-1 leading-tight truncate w-full"
              style={{ color: "var(--text-secondary)" }}
            >
              {redPlayers}
            </p>
            <p
              className="font-bold leading-tight truncate w-full"
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
              }}
            >
              {formatCurrency(redStakeDisplay, true)}
            </p>
          </div>

          {/* POOL */}
          <div
            className="flex flex-col items-center justify-center text-center rounded-lg min-w-0"
            style={{
              background:
                "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #EF4444 100%)",
              padding: "clamp(6px, 2vw, 12px)",
            }}
          >
            <p className="text-xs font-semibold mb-1 text-yellow-900 leading-tight">
              💰 POOL
            </p>
            <p
              className="font-bold text-white leading-tight truncate w-full"
              style={{
                fontSize: "clamp(1rem, 4vw, 1.25rem)",
              }}
            >
              {formatCurrency(totalPool, true)}
            </p>
          </div>

          {/* BLUE */}

          <div
            className="flex flex-col items-center justify-center text-center rounded-lg min-w-0"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              border: "2px solid #3B82F6",
              padding: "clamp(6px, 2vw, 12px)",
            }}
          >
            <p
              className="text-xs font-bold mb-1 leading-tight"
              style={{ color: "#3B82F6" }}
            >
              🔵 BLUE
            </p>
            <p
              className="text-xs mb-1 leading-tight truncate w-full"
              style={{ color: "var(--text-secondary)" }}
            >
              {bluePlayers}
            </p>
            <p
              className="font-bold leading-tight truncate w-full"
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
              }}
            >
              {formatCurrency(blueStakeDisplay, true)}
            </p>
          </div>
        </div>

        {/* Game Wheel - Fully Responsive with CSS */}
        <div
          className="relative w-full flex items-center justify-center"
          style={{ marginBottom: "1.5rem" }}
        >
          <style>{`
            @keyframes pulse-blue {
              0%, 100% { filter: drop-shadow(0 0 10px #3B82F6) drop-shadow(0 0 20px #3B82F6); }
              50% { filter: drop-shadow(0 0 20px #3B82F6) drop-shadow(0 0 40px #3B82F6); }
            }
            @keyframes pulse-red {
              0%, 100% { filter: drop-shadow(0 0 10px #EF4444) drop-shadow(0 0 20px #EF4444); }
              50% { filter: drop-shadow(0 0 20px #EF4444) drop-shadow(0 0 40px #EF4444); }
            }
            @keyframes ring-pulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7), 0 0 30px rgba(239, 68, 68, 0.5); }
              50% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0), 0 0 50px rgba(239, 68, 68, 0.8); }
            }
            .spin-blur { filter: blur(3px); }
            
            .game-wheel {
              position: relative;
              width: min(380px, 88vw);
              aspect-ratio: 1;
              margin: 0 auto;
            }
            
            @media (max-width: 390px) {
              .game-wheel { width: min(340px, 86vw); }
            }
            
            @media (max-width: 360px) {
              .game-wheel { width: min(320px, 84vw); }
            }
          `}</style>

          <div className="game-wheel">
            <div
              className={isSpinning ? "spin-blur" : ""}
              style={{
                position: "absolute",
                inset: 0,
                transform: `rotate(${spinRotation}deg)`,
                transition: isSpinning
                  ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                  : "transform 0.5s ease",
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 400"
                style={{ display: "block" }}
              >
                <defs>
                  <linearGradient
                    id="blueGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#60A5FA", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#3B82F6", stopOpacity: 1 }}
                    />
                  </linearGradient>
                  <linearGradient
                    id="redGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#F87171", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#EF4444", stopOpacity: 1 }}
                    />
                  </linearGradient>
                  <filter id="blueGlow">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="redGlow">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d="M 200 40 A 160 160 0 0 1 200 360 L 200 280 A 80 80 0 0 0 200 120 Z"
                  fill="url(#blueGrad)"
                  filter={
                    selectedColor === "blue" && !isSpinning
                      ? "url(#blueGlow)"
                      : "none"
                  }
                  style={{
                    cursor: "pointer",
                    opacity: showResult && lastWinner === "red" ? 0.4 : 1,
                    animation:
                      selectedColor === "blue" && !isSpinning
                        ? "pulse-blue 2s infinite"
                        : "none",
                  }}
                  onClick={() =>
                    !isPlaying && !isSpinning && setSelectedColor("blue")
                  }
                />

                <path
                  d="M 200 40 A 160 160 0 0 0 200 360 L 200 280 A 80 80 0 0 1 200 120 Z"
                  fill="url(#redGrad)"
                  filter={
                    selectedColor === "red" && !isSpinning
                      ? "url(#redGlow)"
                      : "none"
                  }
                  style={{
                    cursor: "pointer",
                    opacity: showResult && lastWinner === "blue" ? 0.4 : 1,
                    animation:
                      selectedColor === "red" && !isSpinning
                        ? "pulse-red 2s infinite"
                        : "none",
                  }}
                  onClick={() =>
                    !isPlaying && !isSpinning && setSelectedColor("red")
                  }
                />

                <text
                  x="90"
                  y="185"
                  fontSize="24"
                  fontWeight="700"
                  fill="white"
                  textAnchor="middle"
                >
                  Tap
                </text>
                <text
                  x="90"
                  y="215"
                  fontSize="24"
                  fontWeight="700"
                  fill="white"
                  textAnchor="middle"
                >
                  Me
                </text>
                <text
                  x="310"
                  y="185"
                  fontSize="24"
                  fontWeight="700"
                  fill="white"
                  textAnchor="middle"
                >
                  Tap
                </text>
                <text
                  x="310"
                  y="215"
                  fontSize="24"
                  fontWeight="700"
                  fill="white"
                  textAnchor="middle"
                >
                  Me
                </text>

                <circle
                  cx="200"
                  cy="200"
                  r="70"
                  fill="white"
                  style={{
                    animation: isLastFiveSeconds
                      ? "ring-pulse 1s infinite"
                      : "none",
                  }}
                />
              </svg>
            </div>

            {/* Center Timer */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center justify-center"
              style={{ width: "35%" }}
            >
              {isSpinning ? (
                <>
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: "#6B7280" }}
                  >
                    SPINNING...
                  </p>
                  <div className="text-3xl">🎰</div>
                </>
              ) : isAwaitingOutcome ? (
                <>
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: "#6B7280" }}
                  >
                    RESOLVING
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "#FBBF24" }}
                  >
                    PENDING
                  </p>
                </>
              ) : !hasActiveRound ? (
                <>
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: "#6B7280" }}
                  >
                    ROUND
                  </p>
                  <p
                    className="text-sm font-bold leading-snug"
                    style={{ color: "#94A3B8" }}
                  >
                    Starting next round…
                  </p>
                </>
              ) : showResult ? (
                <>
                  <p className="text-2xl mb-1">
                    {lastWinner === "blue" ? "🔵" : "🔴"}
                  </p>
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: lastWinner === "blue" ? "#3B82F6" : "#EF4444",
                    }}
                  >
                    {lastWinner === "blue" ? "BLUE" : "RED"} WINS
                  </p>
                </>
              ) : (
                <>
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: "#6B7280" }}
                  >
                    TIME LEFT
                  </p>
                  <p
                    className="text-4xl font-bold"
                    style={{
                      color: isLastFiveSeconds ? "#EF4444" : "#0A84FF",
                      textShadow: isLastFiveSeconds
                        ? "0 0 10px rgba(239, 68, 68, 0.5)"
                        : "none",
                    }}
                  >
                    {formatTime(timeLeft)}
                  </p>
                </>
              )}
            </div>

            {/* Warning */}
            {isLastFiveSeconds && !isSpinning && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap"
                style={{ bottom: "-2.5rem", animation: "pulse 1s infinite" }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#EF4444" }}
                >
                  ⚠ Bets closing soon!
                </p>
              </div>
            )}

            {/* Pointer */}
            <div
              className="absolute left-1/2 transform -translate-x-1/2"
              style={{ top: "-15px", zIndex: 20 }}
            >
              <svg width="36" height="45" viewBox="0 0 40 50">
                <defs>
                  <linearGradient
                    id="pointerGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#F87171", stopOpacity: 1 }}
                    />
                    <stop
                      offset="50%"
                      style={{ stopColor: "#EF4444", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#DC2626", stopOpacity: 1 }}
                    />
                  </linearGradient>
                  <filter id="pointerShadow">
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="2"
                      floodOpacity="0.4"
                    />
                  </filter>
                </defs>
                <path
                  d="M 20 45 L 5 10 L 20 15 L 35 10 Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M 20 43 L 7 12 L 20 16 L 33 12 Z"
                  fill="url(#pointerGrad)"
                  filter="url(#pointerShadow)"
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Selection Info */}
        <div className="w-full text-center" style={{ marginBottom: "1rem" }}>
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Selected: {selectedColor === "blue" ? "🔵 BLUE" : "🔴 RED"}
          </p>
          {betAmount > 0 && (
            <p className="text-base font-bold" style={{ color: "#10B981" }}>
              Potential Win: {formatCurrency(potentialWin, true)} (+
              {potentialWinPercent}%)
            </p>
          )}
        </div>

        {/* Last Results */}
        <div
          className="w-full rounded-xl shadow-lg"
          style={{
            backgroundColor: "var(--bg-card)",
            padding: "clamp(10px, 3vw, 16px)",
            marginBottom: "1rem",
          }}
        >
          <p
            className="text-xs font-semibold mb-2 uppercase tracking-wider"
            style={{ color: "#9CA3AF" }}
          >
            LAST RESULTS
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gameHistory.map((result, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                style={{
                  backgroundColor: result === "red" ? "#FEE2E2" : "#DBEAFE",
                }}
              >
                <span className="text-sm">
                  {result === "red" ? "🔴" : "🔵"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Betting Section */}
        <div
          className="w-full rounded-xl shadow-lg"
          style={{
            backgroundColor: "var(--bg-card)",
            padding: "clamp(12px, 4vw, 20px)",
            marginBottom: "1rem",
          }}
        >
          <div
            className="flex items-center justify-between w-full"
            style={{
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <h3 className="text-sm font-bold" style={{ color: "#FFFFFF" }}>
              Place Your Bet
            </h3>
            {errorMessage && (
              <span
                className="text-xs font-bold rounded-full whitespace-nowrap"
                style={{
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  padding: "0.25rem 0.75rem",
                }}
              >
                {errorMessage}
              </span>
            )}
          </div>

          <div className="w-full" style={{ marginBottom: "0.75rem" }}>
            <div
              className="flex items-center justify-between w-full"
              style={{
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <label
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Bet Amount
              </label>
              <button
                className="text-xs font-medium whitespace-nowrap"
                style={{ color: "#0A84FF" }}
                onClick={() => setBetAmount(gameBalance)}
              >
                Balance: {formatCurrency(gameBalance, true)}
              </button>
            </div>

            <div className="relative w-full">
              <span
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-bold pointer-events-none"
                style={{ color: "var(--text-primary)" }}
              >
                $
              </span>
              <input
                type="number"
                value={betAmount || ""}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                placeholder="0.00"
                step="0.01"
                className="w-full border-2 rounded-lg text-lg font-semibold text-center"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                  backgroundColor: "var(--bg-secondary)",
                  paddingLeft: "2rem",
                  paddingRight: "4rem",
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                }}
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs pointer-events-none"
                style={{ color: "#9CA3AF", opacity: 0.7 }}
              >
                Min: $1
              </span>
            </div>
          </div>

          <div
            className="w-full grid grid-cols-3"
            style={{
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            {[1, 5, 10].map((amount, index) => (
              <button
                key={amount}
                onClick={() =>
                  setBetAmount((prev) => Number((prev + amount).toFixed(2)))
                }
                className="rounded-lg font-semibold text-sm transition-all active:scale-95"
                style={{
                  backgroundColor: index === 1 ? "#FBBF24" : "var(--bg-accent)",
                  color: index === 1 ? "#78350F" : "var(--text-primary)",
                  border: index === 1 ? "2px solid #F59E0B" : "none",
                  padding: "0.5rem",
                }}
              >
                +${amount}
              </button>
            ))}
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={
              isPlaying ||
              !selectedColor ||
              betAmount <= 0 ||
              isSpinning ||
              isAwaitingOutcome ||
              !hasActiveRound ||
              apiRound?.status !== "OPEN" ||
              timeLeft <= 0
            }
            className="w-full rounded-lg font-bold text-base transition-all disabled:opacity-50 active:scale-95"
            style={{
              background:
                !selectedColor ||
                betAmount <= 0 ||
                isPlaying ||
                isAwaitingOutcome ||
                !hasActiveRound ||
                apiRound?.status !== "OPEN" ||
                timeLeft <= 0
                  ? "#9CA3AF"
                  : "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #EF4444 100%)",
              color: "white",
              boxShadow:
                !selectedColor ||
                betAmount <= 0 ||
                isPlaying ||
                isAwaitingOutcome ||
                !hasActiveRound ||
                apiRound?.status !== "OPEN" ||
                timeLeft <= 0
                  ? "none"
                  : "0 0 20px rgba(251, 191, 36, 0.5)",
              padding: "0.75rem",
            }}
          >
            {isPlaying
              ? "✓ BET PLACED"
              : !hasActiveRound
                ? "WAITING FOR ROUND"
                : isAwaitingOutcome
                  ? "RESOLVING…"
                  : "PLACE BET"}
          </button>
        </div>

        {/* Provably Fair Badge */}
        <div
          className="flex items-center justify-center w-full"
          style={{
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <Shield className="w-4 h-4 shrink-0" style={{ color: "#10B981" }} />
          <p className="text-xs font-medium" style={{ color: "#10B981" }}>
            Provably Fair
          </p>
        </div>

        {/* Bet History */}
        <div
          className="w-full rounded-xl shadow-lg"
          style={{
            backgroundColor: "var(--bg-card)",
            padding: "clamp(12px, 4vw, 20px)",
            marginBottom: "1rem",
          }}
        >
          <div
            className="flex w-full border-b-2"
            style={{
              gap: "1rem",
              marginBottom: "1rem",
              borderColor: "var(--border-color)",
            }}
          >
            <button
              onClick={() => setActiveTab("yours")}
              className="font-semibold text-sm transition-all whitespace-nowrap"
              style={{
                color:
                  activeTab === "yours" ? "#0A84FF" : "var(--text-secondary)",
                borderBottom:
                  activeTab === "yours"
                    ? "3px solid #0A84FF"
                    : "3px solid transparent",
                marginBottom: "-2px",
                paddingBottom: "0.5rem",
                paddingLeft: "0.25rem",
                paddingRight: "0.25rem",
              }}
            >
              Your Bets
            </button>
            <button
              onClick={() => setActiveTab("recent")}
              className="font-semibold text-sm transition-all whitespace-nowrap"
              style={{
                color:
                  activeTab === "recent" ? "#0A84FF" : "var(--text-secondary)",
                borderBottom:
                  activeTab === "recent"
                    ? "3px solid #0A84FF"
                    : "3px solid transparent",
                marginBottom: "-2px",
                paddingBottom: "0.5rem",
                paddingLeft: "0.25rem",
                paddingRight: "0.25rem",
              }}
            >
              Recent Bets
            </button>
          </div>

          <div className="w-full flex flex-col" style={{ gap: "0.5rem" }}>
            {activeTab === "yours" ? (
              <>
                {yourBetHistory.map((bet) => (
                  <div
                    key={bet.key}
                    className="flex items-center justify-between w-full rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-accent)",
                      padding: "0.75rem",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      className="flex items-center min-w-0 flex-1"
                      style={{ gap: "0.5rem" }}
                    >
                      <div className="text-xl shrink-0">
                        {bet.color === "red" ? "🔴" : "🔵"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-semibold text-sm truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Round #{bet.roundShort}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Bet: {formatCurrency(bet.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className="font-bold text-base whitespace-nowrap"
                        style={{
                          color:
                            bet.result === "pending"
                              ? "var(--text-secondary)"
                              : bet.result === "win"
                                ? "#10B981"
                                : "#EF4444",
                        }}
                      >
                        {bet.result === "pending" ? (
                          <span
                            style={{ color: "#FBBF24" }}
                            className="text-xs font-semibold"
                          >
                            Pending
                          </span>
                        ) : (
                          <>
                            {bet.result === "win" ? "+" : "-"}
                            {formatCurrency(
                              bet.result === "win" ? bet.payout : bet.amount,
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {recentBets.map((bet, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between w-full rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-accent)",
                      padding: "0.75rem",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      className="flex items-center min-w-0 flex-1"
                      style={{ gap: "0.5rem" }}
                    >
                      <div className="text-xl shrink-0">
                        {bet.color === "red" ? "🔴" : "🔵"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-semibold text-sm truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {bet.user}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {bet.time}
                        </p>
                      </div>
                    </div>
                    <p
                      className="font-bold text-sm shrink-0 whitespace-nowrap"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Winner
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Provably Fair Section */}
        <div
          className="w-full rounded-xl shadow-lg"
          style={{
            backgroundColor: "var(--bg-card)",
            padding: "clamp(12px, 4vw, 20px)",
            marginBottom: "1rem",
          }}
        >
          <button
            onClick={() => setShowProvablyFair(!showProvablyFair)}
            className="flex items-center w-full"
            style={{ gap: "0.5rem" }}
          >
            <Shield className="w-4 h-4 shrink-0" style={{ color: "#0A84FF" }} />
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              🎲 Provably Fair System
            </h3>
          </button>

          {showProvablyFair && (
            <div
              className="w-full flex flex-col"
              style={{
                gap: "0.75rem",
                marginTop: "0.75rem",
              }}
            >
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Our games use cryptographic hashing to ensure fairness.
              </p>

              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Current round — server seed hash (commit)
                </label>
                <div
                  className="rounded-lg"
                  style={{
                    backgroundColor: "var(--bg-accent)",
                    padding: "0.5rem",
                  }}
                >
                  <p
                    className="text-xs font-mono break-all"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {apiRound?.serverSeedHash ?? "—"}
                  </p>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Last settled — revealed server seed
                </label>
                <div
                  className="rounded-lg"
                  style={{
                    backgroundColor: "var(--bg-accent)",
                    padding: "0.5rem",
                  }}
                >
                  <p
                    className="text-xs font-mono break-all"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {latestRevealed?.serverSeed ?? "—"}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    className="block text-xs font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Client seed
                  </label>
                  <button
                    type="button"
                    onClick={generateNewClientSeed}
                    className="flex items-center text-xs font-medium"
                    style={{ color: "#0A84FF", gap: "0.25rem" }}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Info
                  </button>
                </div>
                <div
                  className="rounded-lg"
                  style={{
                    backgroundColor: "var(--bg-accent)",
                    padding: "0.5rem",
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Not used — outcome is derived from server seed + round id on
                    the backend.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-lg text-white font-medium text-xs"
                style={{
                  backgroundColor: "#0A84FF",
                  padding: "0.5rem",
                }}
              >
                Verify using published seed (after round settles)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals remain the same - I'll add them at the end */}
      {/* Bet Confirmation Modal */}
      {showBetConfirmation && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "1rem",
          }}
        >
          <div
            className="rounded-2xl shadow-xl w-full"
            style={{
              backgroundColor: "var(--bg-card)",
              maxWidth: "28rem",
              padding: "1.5rem",
            }}
          >
            <h2
              className="text-xl font-bold"
              style={{
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              Confirm Your Bet
            </h2>

            <div
              className="flex flex-col w-full"
              style={{
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                className="rounded-lg"
                style={{
                  backgroundColor: "var(--bg-accent)",
                  padding: "1rem",
                }}
              >
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "0.5rem" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Selected Color:
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {selectedColor === "red" ? "🔴 RED" : "🔵 BLUE"}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "0.5rem" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Bet Amount:
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatCurrency(betAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Potential Win:
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ color: "#10B981" }}
                  >
                    {formatCurrency(potentialWin)} (+65%)
                  </span>
                </div>
              </div>

              <div
                className="rounded-lg"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  padding: "0.75rem",
                }}
              >
                <p className="text-xs text-center" style={{ color: "#EF4444" }}>
                  ⚠️ <strong>Warning:</strong> This action is irreversible. Your
                  bet cannot be cancelled once placed.
                </p>
              </div>
            </div>

            <div className="flex w-full" style={{ gap: "0.75rem" }}>
              <button
                onClick={() => setShowBetConfirmation(false)}
                className="flex-1 rounded-lg font-semibold"
                style={{
                  backgroundColor: "var(--bg-accent)",
                  color: "var(--text-primary)",
                  padding: "0.75rem",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmBet}
                className="flex-1 rounded-lg font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #EF4444 100%)",
                  boxShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
                  padding: "0.75rem",
                }}
              >
                Confirm Bet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "1rem",
          }}
        >
          <div
            className="rounded-2xl shadow-xl w-full"
            style={{
              backgroundColor: "var(--bg-card)",
              maxWidth: "28rem",
              padding: "1.5rem",
            }}
          >
            <h2
              className="text-xl font-bold"
              style={{
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              Game Rules
            </h2>

            <div
              className="flex flex-col"
              style={{
                gap: "0.75rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <h3
                  className="font-semibold text-sm"
                  style={{
                    color: "var(--text-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  How to Play:
                </h3>
                <ul
                  className="text-xs flex flex-col"
                  style={{
                    color: "var(--text-secondary)",
                    gap: "0.25rem",
                  }}
                >
                  <li>1. Tap RED or BLUE to select</li>
                  <li>2. Enter bet amount</li>
                  <li>3. Tap "PLACE BET"</li>
                  <li>4. Watch the spin</li>
                  <li>5. Win 1.65x if you're right!</li>
                </ul>
              </div>

              <div>
                <h3
                  className="font-semibold text-sm mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Payout:
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Win Rate: <strong>1.65x</strong> (+65%)
                </p>
              </div>

              <div
                className="rounded-lg"
                style={{
                  backgroundColor: "rgba(10, 132, 255, 0.1)",
                  padding: "0.75rem",
                }}
              >
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  💡 Watch player counts and stakes to make smart bets!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="w-full rounded-lg text-white font-semibold"
              style={{
                backgroundColor: "#0A84FF",
                padding: "0.75rem",
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowResultModal(false)}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "1rem",
          }}
        >
          <div
            className="rounded-xl shadow-xl w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-card)",
              maxWidth: "22rem",
              padding: "1rem",
            }}
          >
            {resultType === "win" && (
              <>
                <div
                  className="text-center"
                  style={{ marginBottom: "0.75rem" }}
                >
                  <div className="text-4xl" style={{ marginBottom: "0.5rem" }}>
                    🎉
                  </div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "#10B981" }}
                  >
                    Congratulations!
                  </h2>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "var(--text-primary)",
                      marginTop: "0.125rem",
                    }}
                  >
                    You Won!
                  </p>
                </div>

                <div
                  className="rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    padding: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p className="text-xs font-medium text-white/90 mb-1 text-center">
                    Amount Won
                  </p>
                  <p className="text-2xl font-bold text-white text-center">
                    {formatCurrency(winAmount)}
                  </p>
                </div>

                <div
                  className="flex flex-col"
                  style={{
                    gap: "0.375rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    className="flex items-center justify-between rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-accent)",
                      padding: "0.5rem",
                    }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Round:
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      #{roundLabel}
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-between rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-accent)",
                      padding: "0.5rem",
                    }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Your Bet:
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatCurrency(winAmount / 1.65)}
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-between rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-accent)",
                      padding: "0.5rem",
                    }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Multiplier:
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#10B981" }}
                    >
                      1.65x
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full rounded-lg text-white font-bold text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    padding: "0.625rem",
                  }}
                >
                  Continue Playing
                </button>
              </>
            )}

            {resultType === "loss" && (
              <>
                <div
                  className="text-center"
                  style={{ marginBottom: "0.75rem" }}
                >
                  <div className="text-4xl" style={{ marginBottom: "0.5rem" }}>
                    😢
                  </div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "#EF4444" }}
                  >
                    You Lost This Round
                  </h2>
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: "var(--text-secondary)",
                      marginTop: "0.125rem",
                    }}
                  >
                    Better luck next time!
                  </p>
                </div>

                <div
                  className="rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                    padding: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p className="text-xs font-medium text-white/90 mb-1 text-center">
                    Amount Lost
                  </p>
                  <p className="text-2xl font-bold text-white text-center">
                    {formatCurrency(winAmount)}
                  </p>
                </div>

                <div
                  className="flex flex-col"
                  style={{
                    gap: "0.375rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    className="flex items-center justify-between rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-accent)",
                      padding: "0.5rem",
                    }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Round:
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      #{roundLabel}
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-between rounded-lg"
                    style={{
                      backgroundColor: "var(--bg-accent)",
                      padding: "0.5rem",
                    }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Result:
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {lastWinner === "red" ? "🔴 RED Won" : "🔵 BLUE Won"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full rounded-lg text-white font-bold text-sm"
                  style={{
                    backgroundColor: "#0A84FF",
                    padding: "0.625rem",
                  }}
                >
                  Try Again
                </button>
              </>
            )}

            {resultType === "no-bet" && (
              <>
                <div
                  className="text-center"
                  style={{ marginBottom: "0.75rem" }}
                >
                  <div className="text-4xl" style={{ marginBottom: "0.5rem" }}>
                    ℹ️
                  </div>
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Round Ended
                  </h2>
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: "var(--text-secondary)",
                      marginTop: "0.125rem",
                    }}
                  >
                    You did not participate in this round
                  </p>
                </div>

                <div
                  className="rounded-lg"
                  style={{
                    backgroundColor: "var(--bg-accent)",
                    padding: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p
                    className="text-xs text-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    The winning color was:
                  </p>
                  <p
                    className="text-2xl font-bold text-center mt-1"
                    style={{
                      color: lastWinner === "red" ? "#EF4444" : "#3B82F6",
                    }}
                  >
                    {lastWinner === "red" ? "🔴 RED" : "🔵 BLUE"}
                  </p>
                </div>

                <div
                  className="rounded-lg"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    padding: "0.625rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p
                    className="text-xs text-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    💡 Place a bet before the timer runs out to participate!
                  </p>
                </div>

                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full rounded-lg text-white font-bold text-sm"
                  style={{
                    backgroundColor: "#0A84FF",
                    padding: "0.625rem",
                  }}
                >
                  Join Next Round
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "1rem",
          }}
        >
          <div
            className="rounded-2xl shadow-xl w-full"
            style={{
              backgroundColor: "var(--bg-card)",
              maxWidth: "28rem",
              padding: "1.5rem",
            }}
          >
            <h2
              className="text-xl font-bold"
              style={{
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              Deposit to Game Balance
            </h2>

            <div
              className="flex flex-col"
              style={{
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                className="rounded-lg"
                style={{
                  backgroundColor: "var(--bg-accent)",
                  padding: "1rem",
                }}
              >
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "0.5rem" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Main Balance:
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatCurrency(balance)}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "0.5rem" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Game Balance:
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatCurrency(gameBalance)}
                  </span>
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <label
                    className="block text-sm font-medium"
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Deposit Amount:
                  </label>
                  <input
                    type="number"
                    value={transferAmount || ""}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full border-2 rounded-lg text-lg font-semibold text-center"
                    style={{
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-secondary)",
                      padding: "0.75rem",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex" style={{ gap: "0.75rem" }}>
              <button
                onClick={() => setShowDepositModal(false)}
                className="flex-1 rounded-lg font-semibold"
                style={{
                  backgroundColor: "var(--bg-accent)",
                  color: "var(--text-primary)",
                  padding: "0.75rem",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                className="flex-1 rounded-lg font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #EF4444 100%)",
                  boxShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
                  padding: "0.75rem",
                }}
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "1rem",
          }}
        >
          <div
            className="rounded-2xl shadow-xl w-full"
            style={{
              backgroundColor: "var(--bg-card)",
              maxWidth: "28rem",
              padding: "1.5rem",
            }}
          >
            <h2
              className="text-xl font-bold"
              style={{
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              Withdraw from Game Balance
            </h2>

            <div
              className="flex flex-col"
              style={{
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                className="rounded-lg"
                style={{
                  backgroundColor: "var(--bg-accent)",
                  padding: "1rem",
                }}
              >
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "0.5rem" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Main Balance:
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatCurrency(balance)}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "0.5rem" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Game Balance:
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatCurrency(gameBalance)}
                  </span>
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <label
                    className="block text-sm font-medium"
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Withdrawal Amount:
                  </label>
                  <input
                    type="number"
                    value={transferAmount || ""}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full border-2 rounded-lg text-lg font-semibold text-center"
                    style={{
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-secondary)",
                      padding: "0.75rem",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex" style={{ gap: "0.75rem" }}>
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="flex-1 rounded-lg font-semibold"
                style={{
                  backgroundColor: "var(--bg-accent)",
                  color: "var(--text-primary)",
                  padding: "0.75rem",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawal}
                className="flex-1 rounded-lg font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #EF4444 100%)",
                  boxShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
                  padding: "0.75rem",
                }}
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      <GameFooter />
    </div>
  );
}
