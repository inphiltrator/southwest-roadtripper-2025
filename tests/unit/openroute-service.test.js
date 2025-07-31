import { describe, it, expect } from "vitest";

describe("OpenRouteService API Mock", () => {
  const mockService = {
    async getRoute(start, end) {
      if (!start || !end) throw new Error("Coordinates required");
      return { routes: [{ geometry: "mock", summary: { distance: 1234 } }] };
    },
    async searchPlaces(query) {
      if (!query || query.length < 2) return { features: [] };
      return { features: [{ properties: { name: query } }] };
    }
  };

  it("should get route between points", async () => {
    const result = await mockService.getRoute([-112, 33], [-115, 36]);
    expect(result).toHaveProperty("routes");
    expect(result.routes).toHaveLength(1);
  });

  it("should return search results", async () => {
    const result = await mockService.searchPlaces("Phoenix");
    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.name).toBe("Phoenix");
  });
});