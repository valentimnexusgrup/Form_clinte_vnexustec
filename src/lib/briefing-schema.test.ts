import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildDiagnosticWorkflow,
  buildServiceScoresFromData,
  getServiceTypeFromData,
  SERVICE_OPTIONS,
} from "./briefing-schema.ts";

describe("briefing schema v2", () => {
  it("exposes the expected service options", () => {
    assert.deepEqual(
      SERVICE_OPTIONS.map((option) => option.id),
      ["central-de-links", "landing-page", "site-institucional", "sistema"],
    );
  });

  it("infers the service from the diagnostic responses", () => {
    const data = {
      diagnostico_objetivo: "Vender mais rápido",
      diagnostico_cenario: "Ainda não tenho nada estruturado",
      diagnostico_prioridade: "Conversão e vendas",
    };

    const scores = buildServiceScoresFromData(data);
    const inferred = getServiceTypeFromData({ ...data, service_scores: scores });

    assert.ok(scores["landing-page"] > scores["site-institucional"]);
    assert.equal(inferred, "landing-page");
  });

  it("keeps the total number of steps stable across the whole flow", () => {
    const workflow = buildDiagnosticWorkflow({
      diagnostico_objetivo: "Automatizar processos internos",
      diagnostico_cenario: "Preciso organizar e automatizar processos",
      diagnostico_prioridade: "Automação e organização interna",
    });

    assert.equal(workflow.length, 7);
    assert.equal(workflow[0]?.id, "diagnostico-objetivo");
    assert.equal(workflow[3]?.id, "resultado-revelado");
    assert.equal(workflow[4]?.id, "sistema-usuarios");
  });
});
