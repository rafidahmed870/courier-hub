export interface ThanaInterface {
  id: number;
  name: string;
  bn_name?: string;
}

export interface DistrictInterface {
  id: number;
  name: string;
  bn_name?: string;
  thanas: ThanaInterface[];
}

export interface DivisionInterface {
  id: number;
  name: string;
  bn_name?: string;
  districts: DistrictInterface[];
}
