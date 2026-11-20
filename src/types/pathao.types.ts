export interface PathaoConfig {
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
  store_id: number;
  base_url?: string;
}

export interface PathaoTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface PathaoPriceResponse {
  data: {
    price: number;
    discount: number;
    plan_id: number;
    cod_enabled: boolean;
  };
}

export interface CreateOrderRequest {
  merchant_order_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: number;
  recipient_zone: number;
  recipient_area?: number;
  delivery_type: number;
  item_type: number;
  item_quantity: number;
  item_weight: number;
  amount_to_collect: number;
  item_description?: string;
}

export interface PathaoCancelOrderResponse {
  message: string;
}

export interface PathaoCity {
  city_id: number;
  city_name: string;
}

export interface PathaoZone {
  zone_id: number;
  zone_name: string;
}

export interface PathaoArea {
  area_id: number;
  area_name: string;
}

export interface PathaoLocationResponse<T> {
  data: T[];
}

export interface PathaoOrderData {
  order_id: number;
  consignment_id: string;
  merchant_order_id: string;
  order_status: string;
  delivery_fee: number;
}

export interface PathaoCreateOrderResponse {
  message: string;
  data: PathaoOrderData;
}

export interface PathaoBulkOrderResponse {
  message: string;
  data: {
    order_id: number;
    consignment_id: string;
    merchant_order_id: string;
    order_status: string;
    delivery_fee: number;
    error?: string;
  }[];
}

export interface PathaoOrderInfoResponse {
  data: {
    order_id: number;
    consignment_id: string;
    order_status: string;
    delivery_fee: number;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    amount_to_collect: number;
  };
}
