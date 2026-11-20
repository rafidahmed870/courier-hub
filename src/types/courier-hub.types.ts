import { PathaoConfig } from "./pathao.types.js";
import { SteadfastConfig } from "./steadfast.types.js";

export interface CourierHubConfig {
  steadfast?: SteadfastConfig;
  pathao?: PathaoConfig;
}
