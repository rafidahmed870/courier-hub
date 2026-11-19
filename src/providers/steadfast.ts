import type {
  SteadfastConfig,
  CreateOrderRequest,
  CreateOrderResponse,
  CreateBulkOrderRequest,
  CreateBulkOrderResponse,
  StatusCheckResponse,
  TrackingsResponse,
  GetBalanceResponse,
  FraudCheckResponse,
} from "../types/steadfast.types.js";

class Steadfast {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string = "https://portal.packzy.com/api/v1";

  constructor({ api_key, secret_key, base_url }: SteadfastConfig) {
    this.apiKey = api_key;
    this.secretKey = secret_key;

    if (base_url) {
      this.baseUrl = base_url.replace(/\/+$/, "");
    }
  }

  private headers(): Record<string, string> {
    return {
      "Api-Key": this.apiKey,
      "Secret-Key": this.secretKey,
      "Content-Type": "application/json",
    };
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { ...this.headers(), ...init.headers },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Steadfast API error ${res.status}: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    return this.request<CreateOrderResponse>("/create_order", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createBulkOrders(
    data: CreateBulkOrderRequest,
  ): Promise<CreateBulkOrderResponse> {
    return this.request<CreateBulkOrderResponse>("/create_order/bulk-order", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async statusByConsignmentId(
    consignmentId: number,
  ): Promise<StatusCheckResponse> {
    return this.request<StatusCheckResponse>(
      `/status_by_cid/${consignmentId}`,
      {
        method: "GET",
      },
    );
  }

  async statusByInvoice(invoice: string): Promise<StatusCheckResponse> {
    return this.request<StatusCheckResponse>(`/status_by_invoice/${invoice}`, {
      method: "GET",
    });
  }

  async statusByTrackingCode(
    trackingCode: string,
  ): Promise<StatusCheckResponse> {
    return this.request<StatusCheckResponse>(
      `/status_by_trackingcode/${trackingCode}`,
      {
        method: "GET",
      },
    );
  }

  async trackingsByInvoice(invoice: string): Promise<TrackingsResponse> {
    return this.request<TrackingsResponse>(`/trackings_by_invoice/${invoice}`, {
      method: "GET",
    });
  }

  async getBalance(): Promise<GetBalanceResponse> {
    return this.request<GetBalanceResponse>("/get_balance", {
      method: "GET",
    });
  }

  async fraudCheck(phone: string): Promise<FraudCheckResponse> {
    return this.request<FraudCheckResponse>(`/fraud_check/score/${phone}`, {
      method: "GET",
    });
  }
}

export default Steadfast;
