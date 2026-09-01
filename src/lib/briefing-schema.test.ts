import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  getServiceFlow,
  getServiceTypeFromData,
  SERVICE_OPTIONS,
  type ServiceType,
} from "./briefing-schema";

describe("briefing schema", () => {
  it("exposes the four service flows", () => {
    assert.deepEqual(
      SERVICE_OPTIONS.map((option) => option.id),
      ["central-de-links", "landing-page", "site-institucional", "sistema"],
    );

    const flow = getServiceFlow("central-de-links");
    assert.equal(flow[0]?.title, "Sobre você");
    assert.equal(flow[1]?.title, "Sobre o negócio");
    assert.ok(flow.some((step) => step.id === "links-incluir"));
  });

  it("detects service type from persisted data", () => {
    const serviceType = getServiceTypeFromData({ service_type: "site-institucional" as ServiceType });
    assert.equal(serviceType, "site-institucional");

    const fallback = getServiceTypeFromData({});
    assert.equal(fallback, "landing-page");
  });
});
