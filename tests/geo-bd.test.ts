import { describe, expect, it, vi } from "vitest";

import GeoBD from "../src/core/geo-bd";
import { bangladeshShippingZones } from "../src/utils/bangladesh-location";

/** Every thana id in the whole dataset, flattened once for reuse. */
const allThanas = bangladeshShippingZones.flatMap((division) =>
  division.districts.flatMap((district) => district.thanas),
);

const allDistricts = bangladeshShippingZones.flatMap(
  (division) => division.districts,
);

describe("GeoBD", () => {
  describe("static API", () => {
    it("exposes every method as a static function", () => {
      expect(GeoBD.all).toBeInstanceOf(Function);
      expect(GeoBD.bangladeshDivisions).toBeInstanceOf(Function);
      expect(GeoBD.bangladeshDistricts).toBeInstanceOf(Function);
      expect(GeoBD.policeStation).toBeInstanceOf(Function);
    });

    it("can be called without creating an instance", () => {
      // No `new GeoBD()` anywhere: the methods hang off the class itself.
      expect(GeoBD.all()).toBeInstanceOf(Promise);
      expect(GeoBD.bangladeshDivisions()).toBeInstanceOf(Promise);
      expect(GeoBD.bangladeshDistricts()).toBeInstanceOf(Promise);
      expect(GeoBD.policeStation(1)).toBeInstanceOf(Promise);
    });

    it("does not put the methods on instances", () => {
      const instance = new GeoBD();

      expect(instance).not.toHaveProperty("all");
      expect(instance).not.toHaveProperty("bangladeshDivisions");
      expect(instance).not.toHaveProperty("bangladeshDistricts");
      expect(instance).not.toHaveProperty("policeStation");
    });
  });

  describe("all", () => {
    it("resolves the full shipping-zone dataset", async () => {
      await expect(GeoBD.all()).resolves.toEqual(bangladeshShippingZones);
    });

    it("returns the underlying data by reference", async () => {
      expect(await GeoBD.all()).toBe(bangladeshShippingZones);
    });

    it("returns an array of divisions", async () => {
      const result = await GeoBD.all();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(bangladeshShippingZones.length);
    });

    it("includes all eight Bangladesh divisions", async () => {
      const names = (await GeoBD.all()).map((division) => division.name);

      expect(names).toEqual([
        "Barisal",
        "Chittagong",
        "Dhaka",
        "Khulna",
        "Mymensingh",
        "Rajshahi",
        "Rangpur",
        "Sylhet",
      ]);
    });

    it("gives every division an id, name and districts array", async () => {
      for (const division of await GeoBD.all()) {
        expect(typeof division.id).toBe("number");
        expect(Number.isInteger(division.id)).toBe(true);
        expect(typeof division.name).toBe("string");
        expect(division.name.length).toBeGreaterThan(0);
        expect(Array.isArray(division.districts)).toBe(true);
        expect(division.districts.length).toBeGreaterThan(0);
      }
    });

    it("gives every district an id, name and thanas array", async () => {
      for (const division of await GeoBD.all()) {
        for (const district of division.districts) {
          expect(typeof district.id).toBe("number");
          expect(Number.isInteger(district.id)).toBe(true);
          expect(typeof district.name).toBe("string");
          expect(district.name.length).toBeGreaterThan(0);
          expect(Array.isArray(district.thanas)).toBe(true);
          expect(district.thanas.length).toBeGreaterThan(0);
        }
      }
    });

    it("gives every thana an id and name", async () => {
      for (const thana of allThanas) {
        expect(typeof thana.id).toBe("number");
        expect(Number.isInteger(thana.id)).toBe(true);
        expect(typeof thana.name).toBe("string");
        expect(thana.name.length).toBeGreaterThan(0);
      }
    });

    it("uses unique division ids", async () => {
      const ids = (await GeoBD.all()).map((division) => division.id);

      expect(new Set(ids).size).toBe(ids.length);
    });

    it("uses unique district ids across all divisions", async () => {
      const ids = allDistricts.map((district) => district.id);

      expect(new Set(ids).size).toBe(ids.length);
    });

    it("uses unique thana ids across all districts", () => {
      const ids = allThanas.map((thana) => thana.id);

      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("bangladeshDivisions", () => {
    it("returns one entry per division", async () => {
      const divisions = await GeoBD.bangladeshDivisions();

      expect(divisions).toHaveLength(bangladeshShippingZones.length);
    });

    it("maps each division to its id, name and bn_name only", async () => {
      const expected = bangladeshShippingZones.map((division) => ({
        id: division.id,
        name: division.name,
        bn_name: division.bn_name,
      }));

      expect(await GeoBD.bangladeshDivisions()).toEqual(expected);
    });

    it("does not leak the districts array", async () => {
      const divisions = await GeoBD.bangladeshDivisions();

      for (const division of divisions) {
        expect(division).not.toHaveProperty("districts");
        expect(Object.keys(division).sort()).toEqual(["bn_name", "id", "name"]);
      }
    });

    it("returns plain objects with the expected primitive types", async () => {
      for (const division of await GeoBD.bangladeshDivisions()) {
        expect(typeof division.id).toBe("number");
        expect(typeof division.name).toBe("string");
      }
    });

    it("includes Dhaka among the divisions", async () => {
      const divisions = await GeoBD.bangladeshDivisions();

      expect(divisions.some((division) => division.name === "Dhaka")).toBe(
        true,
      );
    });

    it("returns a fresh array on each call", async () => {
      const first = await GeoBD.bangladeshDivisions();
      const second = await GeoBD.bangladeshDivisions();

      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });

    it("does not mutate the source data", async () => {
      const snapshot = JSON.parse(JSON.stringify(bangladeshShippingZones));

      await GeoBD.bangladeshDivisions();

      expect(bangladeshShippingZones).toEqual(snapshot);
    });
  });

  describe("bangladeshDistricts", () => {
    it("returns every district across all divisions", async () => {
      const districts = await GeoBD.bangladeshDistricts();

      expect(districts).toHaveLength(allDistricts.length);
    });

    it("flattens districts from every division", async () => {
      const expected = bangladeshShippingZones.flatMap((division) =>
        division.districts.map((district) => ({
          id: district.id,
          name: district.name,
          bn_name: district.bn_name,
        })),
      );

      expect(await GeoBD.bangladeshDistricts()).toEqual(expected);
    });

    it("does not leak the thanas array", async () => {
      for (const district of await GeoBD.bangladeshDistricts()) {
        expect(district).not.toHaveProperty("thanas");
        expect(Object.keys(district).sort()).toEqual(["bn_name", "id", "name"]);
      }
    });

    it("returns districts from more than one division", async () => {
      const districts = await GeoBD.bangladeshDistricts();
      const districtIds = new Set(districts.map((district) => district.id));

      const divisionsRepresented = bangladeshShippingZones.filter((division) =>
        division.districts.some((district) => districtIds.has(district.id)),
      );

      expect(divisionsRepresented.length).toBe(bangladeshShippingZones.length);
    });

    it("keeps district ids unique in the flattened result", async () => {
      const ids = (await GeoBD.bangladeshDistricts()).map(
        (district) => district.id,
      );

      expect(new Set(ids).size).toBe(ids.length);
    });

    it("includes Barguna (a Barisal division district)", async () => {
      const districts = await GeoBD.bangladeshDistricts();

      expect(districts).toContainEqual({ id: 1001, name: "Barguna" });
    });

    it("returns a fresh array on each call", async () => {
      const first = await GeoBD.bangladeshDistricts();
      const second = await GeoBD.bangladeshDistricts();

      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });
  });

  describe("policeStation", () => {
    it("returns the thanas of a known district", async () => {
      const barguna = bangladeshShippingZones[0].districts[0];

      const expected = barguna.thanas.map(({ id, name, bn_name }) => ({
        id,
        name,
        bn_name,
      }));

      expect(await GeoBD.policeStation(barguna.id)).toEqual(expected);
    });

    it("returns the first thana of a district with its shape", async () => {
      const thanas = await GeoBD.policeStation(1001);

      expect(thanas[0]).toEqual({ id: 100001, name: "Amtali" });
    });

    it("maps thanas to only id, name and bn_name", async () => {
      for (const thana of await GeoBD.policeStation(1001)) {
        expect(Object.keys(thana).sort()).toEqual(["bn_name", "id", "name"]);
      }
    });

    it("finds a district that is not in the first division", async () => {
      const lastDivision =
        bangladeshShippingZones[bangladeshShippingZones.length - 1];
      const district = lastDivision.districts[0];

      const thanas = await GeoBD.policeStation(district.id);

      expect(thanas).toHaveLength(district.thanas.length);
    });

    it("works for a district picked from any location in the data", async () => {
      for (const district of allDistricts) {
        const thanas = await GeoBD.policeStation(district.id);

        expect(thanas).toHaveLength(district.thanas.length);
      }
    });

    it("keeps thana ids unique within a district", async () => {
      const thanas = await GeoBD.policeStation(1001);
      const ids = thanas.map((thana) => thana.id);

      expect(new Set(ids).size).toBe(ids.length);
    });

    it("returns an empty array for an unknown district id", async () => {
      await expect(GeoBD.policeStation(999999)).resolves.toEqual([]);
    });

    it("returns an empty array for a negative id", async () => {
      await expect(GeoBD.policeStation(-1)).resolves.toEqual([]);
    });

    it("returns an empty array for zero", async () => {
      await expect(GeoBD.policeStation(0)).resolves.toEqual([]);
    });

    it("returns an empty array for NaN", async () => {
      await expect(GeoBD.policeStation(Number.NaN)).resolves.toEqual([]);
    });

    it("does not match a thana id when passed as a district id", async () => {
      // 100001 is a thana id, not a district id.
      await expect(GeoBD.policeStation(100001)).resolves.toEqual([]);
    });

    it("returns a fresh array on each call", async () => {
      const first = await GeoBD.policeStation(1001);
      const second = await GeoBD.policeStation(1001);

      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });

    it("handles being called many times without state leaking", async () => {
      const barguna = await GeoBD.policeStation(1001);
      await GeoBD.policeStation(999999);
      const again = await GeoBD.policeStation(1001);

      expect(again).toEqual(barguna);
    });
  });

  describe("integration between methods", () => {
    it("agrees with the source data on division count", async () => {
      const divisions = await GeoBD.bangladeshDivisions();
      const all = await GeoBD.all();

      expect(divisions).toHaveLength(all.length);
    });

    it("agrees with the source data on district count", async () => {
      const districts = await GeoBD.bangladeshDistricts();
      const all = await GeoBD.all();

      const totalDistricts = all.reduce(
        (sum, division) => sum + division.districts.length,
        0,
      );

      expect(districts).toHaveLength(totalDistricts);
    });

    it("returns the same thanas policeStation does for a given district", async () => {
      const [firstDistrict] = allDistricts;
      const fromDivisions = bangladeshShippingZones
        .flatMap((division) => division.districts)
        .find((district) => district.id === firstDistrict.id)?.thanas;

      expect(await GeoBD.policeStation(firstDistrict.id)).toEqual(
        fromDivisions?.map(({ id, name, bn_name }) => ({ id, name, bn_name })),
      );
    });

    it("does not call fetch for the in-memory lookups", async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal("fetch", fetchSpy);

      await GeoBD.all();
      await GeoBD.bangladeshDivisions();
      await GeoBD.bangladeshDistricts();
      await GeoBD.policeStation(1001);

      expect(fetchSpy).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });
});
