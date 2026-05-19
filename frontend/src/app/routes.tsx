import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { HomePage } from "./pages/HomePage";
import { Dashboard } from "./pages/Dashboard";
import { Game } from "./pages/Game";
import { Predictions } from "./pages/Predictions";
import { VIPTasks } from "./pages/VIPTasks";
import { DailyRewards } from "./pages/DailyRewards";
import { DailyRebate } from "./pages/DailyRebate";
import { Wallet } from "./pages/Wallet";
import { Referrals } from "./pages/Referrals";
import { Profile } from "./pages/Profile";
import { Upgrade } from "./pages/Upgrade";
import { Settings } from "./pages/Settings";
import { Notifications } from "./pages/Notifications";
import { Leaderboard } from "./pages/Leaderboard";
import { ReferralWallet } from "./pages/ReferralWallet";
import { AdvertiserDashboard } from "./pages/AdvertiserDashboard";
import { CreateCampaign } from "./pages/CreateCampaign";
import { AdvertiseEarn } from "./pages/AdvertiseEarn";
import { DicePool } from "./pages/DicePool";
import { WheelGame } from "./pages/WheelGame";
import { AffiliateWallet } from "./pages/AffiliateWallet";
import { CrashGame } from "./pages/CrashGame";
import { PvPWheel } from "./pages/PvPWheel";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "dashboard", Component: Dashboard },
      { path: "game", Component: Game },
      { path: "dice-pool", Component: DicePool },
      { path: "wheel-game", Component: WheelGame },
      { path: "crash-game", Component: CrashGame },
      { path: "pvp-wheel", Component: PvPWheel },
      { path: "predictions", Component: Predictions },
      { path: "vip-tasks", Component: VIPTasks },
      { path: "daily-rewards", Component: DailyRewards },
      { path: "daily-rebate", Component: DailyRebate },
      { path: "wallet", Component: Wallet },
      { path: "referrals", Component: Referrals },
      { path: "referral-wallet", Component: ReferralWallet },
      { path: "affiliate-wallet", Component: AffiliateWallet },
      { path: "profile", Component: Profile },
      { path: "upgrade", Component: Upgrade },
      { path: "settings", Component: Settings },
      { path: "notifications", Component: Notifications },
      { path: "leaderboard", Component: Leaderboard },
      { path: "advertiser", Component: AdvertiserDashboard },
      { path: "advertiser/create", Component: CreateCampaign },
      { path: "advertiser/earn", Component: AdvertiseEarn },
    ],
  },
]);
