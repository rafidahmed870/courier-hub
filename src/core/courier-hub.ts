import { Pathao, Steadfast } from "../providers/index.js";
import type { CourierHubConfig } from "../types/courier-hub.types.js";

class CourierHub {
  private steadfast?: Steadfast;
  private pathao?: Pathao;

  constructor(config: CourierHubConfig = {}) {
    if (config.steadfast) {
      this.steadfast = new Steadfast(config.steadfast);
    }

    if (config.pathao) {
      this.pathao = new Pathao(config.pathao);
    }
  }

  get Steadfast(): Steadfast {
    if (!this.steadfast) {
      throw new Error(
        "Steadfast provider is not configured. Pass `steadfast` in the CourierHub config.",
      );
    }

    return this.steadfast;
  }

  get Pathao(): Pathao {
    if (!this.pathao) {
      throw new Error(
        "Pathao provider is not configured. Pass `pathao` in the CourierHub config.",
      );
    }

    return this.pathao;
  }
}

export default CourierHub;
