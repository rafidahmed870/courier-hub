import { Pathao, Steadfast, Redx } from "../providers/index.js";
import type { CourierHubConfig } from "../types/courier-hub.types.js";

class CourierHub {
  private steadfast?: Steadfast;
  private redx?: Redx;
  private pathao?: Pathao;

  constructor(config: CourierHubConfig = {}) {
    if (config.steadfast) {
      this.steadfast = new Steadfast(config.steadfast);
    }

    if (config.pathao) {
      this.pathao = new Pathao(config.pathao);
    }

    if (config.redx) {
      this.redx = new Redx(config.redx);
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

  get Redx(): Redx {
    if (!this.redx) {
      throw new Error(
        "Redx provider is not configured. Pass `redx` in the CourierHub config.",
      );
    }

    return this.redx;
  }
}

export default CourierHub;
