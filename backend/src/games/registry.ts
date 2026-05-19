import { diceConfig } from "./dice/dice.config.js";
import type { GameConfig } from "./game.interface.js";

/** Register game configs for scheduler + bootstrapping. */
export const gameConfigs: GameConfig[] = [diceConfig];
