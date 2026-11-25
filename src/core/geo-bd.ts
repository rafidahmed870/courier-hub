import { bangladeshShippingZones } from "../utils/bangladesh-location.js";
import type { DivisionInterface } from "../types/bangladesh-location.types.js";

class GeoBD {
  static async all(): Promise<DivisionInterface[]> {
    return bangladeshShippingZones;
  }

  static async bangladeshDivisions(): Promise<
    { id: number; name: string; bn_name?: string }[]
  > {
    return bangladeshShippingZones.map((division) => ({
      id: division.id,
      name: division.name,
      bn_name: division.bn_name,
    }));
  }

  static async bangladeshDistricts(): Promise<
    { id: number; name: string; bn_name?: string }[]
  > {
    return bangladeshShippingZones.flatMap((division) =>
      division.districts.map((district) => ({
        id: district.id,
        name: district.name,
        bn_name: district.bn_name,
      })),
    );
  }

  static async policeStation(
    districtId: number,
  ): Promise<{ id: number; name: string; bn_name?: string }[]> {
    const district = bangladeshShippingZones
      .flatMap((division) => division.districts)
      .find((district) => district.id === districtId);

    if (!district) return [];

    return district.thanas.map(({ id, name, bn_name }) => ({
      id,
      name,
      bn_name,
    }));
  }
}

export default GeoBD;
