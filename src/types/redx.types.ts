export interface RedxConfig {
  api_token: string;
  base_url?: string;
}

export interface TrackingResponse {
  tracking: {
    message_en: string;
    message_bn: string;
    time: string;
  }[];
}

export interface ParcelInfo {
  parcel: {
    tracking_id: string;
    customer_address: string;
    delivery_area: string;
    delivery_area_id: number;
    charge: number;
    customer_name: string;
    customer_phone: string;
    cash_collection_amount: number;
    parcel_weight: number;
    merchant_invoice_id: string;
    status: string;
    instruction: string;
    created_at: string;
    delivery_type: string;
    value: string;
    pickup_location: {
      id: number;
      name: string;
      address: string;
      area: string;
      area_id: number;
    };
  };
}

export interface ParcelDetail {
  name: string;
  category: string;
  value: number;
}

export interface CreateParcelRequest {
  customer_name: string;
  customer_phone: string;
  delivery_area: string;
  delivery_area_id: number;
  customer_address: string;
  cash_collection_amount: string;
  parcel_weight: string;
  value: string;
  merchant_invoice_id?: string;
  paid_return_charge?: number;
  instruction?: string;
  type?: string;
  is_closed_box?: boolean;
  pickup_store_id?: string;
  parcel_details_json?: ParcelDetail[];
}

export interface CreateParcelResponse {
  tracking_id: string;
}

export interface UpdateParcelDetails {
  property_name: string;
  new_value: string;
  reason?: string;
}

export interface UpdateParcelRequest {
  entity_type: string;
  entity_id: string;
  update_details: UpdateParcelDetails;
}

export interface UpdateParcelResponse {
  success: boolean;
  message: string;
}

export interface Area {
  id: number;
  name: string;
  post_code: number;
  division_name: string;
  zone_id: number;
}

export interface AreasResponse {
  areas: Area[];
}

export interface CreatePickupStoreRequest {
  name: string;
  phone: string;
  address: string;
  area_id: number;
}

export interface PickupStore {
  id: number;
  name: string;
  address: string;
  area_name: string;
  area_id: number;
  phone: string;
  created_at?: string;
}

export interface PickupStoresResponse {
  pickup_stores: PickupStore[];
}

export interface PickupStoreResponse {
  pickup_store: PickupStore;
}

export interface ChargeCalculatorParams {
  delivery_area_id: number;
  pickup_area_id: number;
  cash_collection_amount: number;
  weight: number;
}

export interface ChargeCalculatorResponse {
  deliveryCharge: number;
  codCharge: number;
}
