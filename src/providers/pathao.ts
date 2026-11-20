import type {
  PathaoConfig,
  PathaoTokenResponse,
  CreateOrderRequest,
  PathaoLocationResponse,
  PathaoCity,
  PathaoZone,
  PathaoArea,
  PathaoCreateOrderResponse,
  PathaoBulkOrderResponse,
  PathaoOrderInfoResponse,
  PathaoPriceResponse,
  PathaoCancelOrderResponse,
} from "../types/pathao.types.js";

class Pathao {
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;
  private storeId: number;
  private baseUrl: string;

  private tokenCache: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  } | null = null;

  constructor(config: PathaoConfig) {
    this.clientId = config.client_id;
    this.clientSecret = config.client_secret;
    this.username = config.username;
    this.password = config.password;
    this.storeId = config.store_id;
    this.baseUrl = config.base_url ?? "https://api-hermes.pathao.com";
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, options);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        `Pathao API Error ${response.status}: ${JSON.stringify(data)}`,
      );
    }
    return data;
  }

  public async getToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.accessToken;
    }

    if (this.tokenCache && this.tokenCache.refreshToken) {
      try {
        const data = (await this.request("/aladdin/api/v1/issue-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: "refresh_token",
            refresh_token: this.tokenCache.refreshToken,
          }),
        })) as PathaoTokenResponse;

        this.tokenCache = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + (data.expires_in - 60) * 1000,
        };
        return data.access_token;
      } catch {
        // pass
      }
    }

    const data = (await this.request("/aladdin/api/v1/issue-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "password",
        username: this.username,
        password: this.password,
      }),
    })) as PathaoTokenResponse;

    this.tokenCache = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
  }

  private async getAuthHeaders() {
    const token = await this.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  public async getCities(): Promise<PathaoLocationResponse<PathaoCity>> {
    const headers = await this.getAuthHeaders();
    return this.request("/aladdin/api/v1/city-list", { headers });
  }

  public async getZones(
    cityId: number,
  ): Promise<PathaoLocationResponse<PathaoZone>> {
    const headers = await this.getAuthHeaders();
    return this.request(`/aladdin/api/v1/zones?city_id=${cityId}`, { headers });
  }

  public async getAreas(
    zoneId: number,
  ): Promise<PathaoLocationResponse<PathaoArea>> {
    const headers = await this.getAuthHeaders();
    return this.request(`/aladdin/api/v1/areas?zone_id=${zoneId}`, { headers });
  }

  public async calculatePrice(
    weight: number,
    deliveryType: number = 48,
  ): Promise<PathaoPriceResponse> {
    const headers = await this.getAuthHeaders();
    return this.request("/aladdin/api/v1/merchant/price-plan", {
      method: "POST",
      headers,
      body: JSON.stringify({
        delivery_type: deliveryType,
        item_weight: weight,
      }),
    });
  }

  public async createOrder(
    orderData: CreateOrderRequest,
  ): Promise<PathaoCreateOrderResponse> {
    const headers = await this.getAuthHeaders();

    const payload = {
      store_id: this.storeId,
      merchant_order_id: orderData.merchant_order_id,
      recipient_name: orderData.recipient_name,
      recipient_phone: orderData.recipient_phone,
      recipient_address: orderData.recipient_address,
      recipient_city: orderData.recipient_city,
      recipient_zone: orderData.recipient_zone,
      recipient_area: orderData.recipient_area,
      delivery_type: orderData.delivery_type,
      item_type: orderData.item_type,
      item_quantity: orderData.item_quantity,
      item_weight: orderData.item_weight,
      amount_to_collect: orderData.amount_to_collect,
      item_description: orderData.item_description,
    };

    return this.request("/aladdin/api/v1/orders", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  }

  public async cancelOrder(
    orderId: string,
  ): Promise<PathaoCancelOrderResponse> {
    const headers = await this.getAuthHeaders();
    return this.request(`/aladdin/api/v1/orders/${orderId}/cancel`, {
      method: "POST",
      headers,
    });
  }

  public async createBulkOrder(
    orders: CreateOrderRequest[],
  ): Promise<PathaoBulkOrderResponse> {
    const headers = await this.getAuthHeaders();

    const payload = orders.map((order) => ({
      store_id: this.storeId,
      merchant_order_id: order.merchant_order_id,
      recipient_name: order.recipient_name,
      recipient_phone: order.recipient_phone,
      recipient_address: order.recipient_address,
      recipient_city: order.recipient_city,
      recipient_zone: order.recipient_zone,
      recipient_area: order.recipient_area,
      delivery_type: order.delivery_type,
      item_type: order.item_type,
      item_quantity: order.item_quantity,
      item_weight: order.item_weight,
      amount_to_collect: order.amount_to_collect,
      item_description: order.item_description,
    }));

    return this.request("/aladdin/api/v1/orders/bulk", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  }

  public async getOrderInfo(
    consignmentId: string,
  ): Promise<PathaoOrderInfoResponse> {
    const headers = await this.getAuthHeaders();
    return this.request(`/aladdin/api/v1/orders/${consignmentId}/info`, {
      headers,
    });
  }
}

export default Pathao;
