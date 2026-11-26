import type { PathaoConfig } from "./pathao.types.js";
import type { RedxConfig } from "./redx.types.js";
import type { SteadfastConfig } from "./steadfast.types.js";

export interface CourierHubConfig {
  steadfast?: SteadfastConfig;
  pathao?: PathaoConfig;
  redx?: RedxConfig;
}
