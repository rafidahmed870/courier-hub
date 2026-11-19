export interface SteadfastConfig {
  api_key: string;
  secret_key: string;
  base_url?: string;
}

export interface CreateOrderRequest {
  invoice: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone: string;
  alternative_phone?: string;
  recipient_address: string;
  cod_amount: string;
  note?: string;
  item_description?: string;
  delivery_type?: number;
}

export interface CreateOrderResponse {
  status: number;
  message: string;
  consignment: {
    id: number;
    invoice: string;
    tracking_code: string;
    tracking_link: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    recipient_email?: string;
    alternative_phone?: string;
    item_description?: string;
    total_lot?: number;
    cod_amount: string;
    exchange: boolean;
    status: string;
    note?: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateBulkOrderRequest {
  data: CreateOrderRequest[];
}

export interface CreateBulkOrderResponse {
  status: number;
  message: string;
  data: CreateOrderResponse[];
}

export interface StatusCheckResponse {
  status: number;
  delivery_status: string;
}

export interface TrackingItem {
  consignment_id: number;
  tracking_type: number;
  text: string;
  created_at: string;
}

export interface TrackingsResponse {
  status: number;
  tracking: TrackingItem[];
}

export interface GetBalanceResponse {
  status: number;
  current_balance: number;
}

export interface FraudCheckResponse {
  status: number;
  phone: string;
  delivery_ratio: number;
  cancellation_ratio: number;
  volume_band: string;
  volume_range: string;
  delivered_count: number;
  cancelled_count: number;
  total_reports: number;
  fraud_categories: string[];
  score: number | null;
  level: string | null;
  reasons: string[];
  scoring_disabled: boolean;
  doubtful_reports: boolean;
}
