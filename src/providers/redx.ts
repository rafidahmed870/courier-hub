import type {
  AreasResponse,
  ChargeCalculatorParams,
  ChargeCalculatorResponse,
  CreateParcelRequest,
  CreateParcelResponse,
  CreatePickupStoreRequest,
  ParcelInfo,
  PickupStore,
  PickupStoreResponse,
  PickupStoresResponse,
  RedxConfig,
  TrackingResponse,
  UpdateParcelRequest,
  UpdateParcelResponse,
} from "../types/redx.types.js";

const JSON_HEADERS = { "Content-Type": "application/json" };

class Redx {
  private api_key: string;
  private base_url: string;

  constructor(config: RedxConfig) {
    this.api_key = config.api_token;
    this.base_url =
      config.base_url || "https://openapi.redx.com.bd/v1.0.0-beta";
  }

  private headers() {
    return {
      "API-ACCESS-TOKEN": this.api_key,
    };
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.base_url}${path}`, {
      ...init,
      headers: { ...this.headers(), ...init.headers },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Redx API error ${res.status}: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  async trackParcel(parcelId: string): Promise<TrackingResponse> {
    return this.request(`/parcel/track/${parcelId}`);
  }

  async parcelInfo(trackingId: string): Promise<ParcelInfo> {
    return this.request(`/parcel/info/${trackingId}`);
  }

  async createParcel(
    payload: CreateParcelRequest,
  ): Promise<CreateParcelResponse> {
    return this.request("/parcel", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });
  }

  async updateParcel(
    payload: UpdateParcelRequest,
  ): Promise<UpdateParcelResponse> {
    return this.request("/parcels", {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });
  }

  async getAreas(): Promise<AreasResponse> {
    return this.request("/areas");
  }

  async getAreasByPostCode(postCode: number): Promise<AreasResponse> {
    const query = new URLSearchParams({ post_code: String(postCode) });
    return this.request(`/areas?${query.toString()}`);
  }

  async getAreasByDistrict(districtName: string): Promise<AreasResponse> {
    const query = new URLSearchParams({ district_name: districtName });
    return this.request(`/areas?${query.toString()}`);
  }

  async createPickupStore(
    payload: CreatePickupStoreRequest,
  ): Promise<PickupStore> {
    return this.request("/pickup/store", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });
  }

  async getPickupStores(): Promise<PickupStoresResponse> {
    return this.request("/pickup/stores");
  }

  async pickupStoreDetails(
    pickupStoreId: number,
  ): Promise<PickupStoreResponse> {
    return this.request(`/pickup/store/info/${pickupStoreId}`);
  }

  async calculateCharge(
    params: ChargeCalculatorParams,
  ): Promise<ChargeCalculatorResponse> {
    const query = new URLSearchParams({
      delivery_area_id: String(params.delivery_area_id),
      pickup_area_id: String(params.pickup_area_id),
      cash_collection_amount: String(params.cash_collection_amount),
      weight: String(params.weight),
    });

    return this.request(`/charge/charge_calculator?${query.toString()}`);
  }
}

export default Redx;
