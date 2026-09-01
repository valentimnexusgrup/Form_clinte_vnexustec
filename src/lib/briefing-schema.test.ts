import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildDiagnosticWorkflow,
  buildServiceScoresFromData,
  getServiceTypeFromData,
  SERVICE_OPTIONS,
  shouldAskTieBreaker,
} from "./briefing-schema.ts";

describe("briefing schema", () => {
  it("exposes the four service flows", () => {
    assert.deepEqual(
      SERVICE_OPTIONS.map((option) => option.id),
      ["central-de-links", "landing-page", "site-institucional", "sistema"],
    );

    const flow = buildDiagnosticWorkflow({
      objetivo_principal: "Vender um produto ou captar contato por uma oferta específica",
    });

    assert.equal(flow[0]?.fields[0]?.id, "objetivo_principal");
    assert.ok(flow.some((step) => step.id === "diagnostico-objetivo_principal"));
  });

  it("infers service type and scores from diagnosis answers", () => {
    const data = {
      objetivo_principal: "Vender um produto ou captar contato por uma oferta específica",
      presenca_digital_atual: "Não tenho nada estruturado ainda",
      acao_esperada: "Que ela veja uma oferta clara e feche a ação na hora",
      processos_internos: "Não é o foco do momento",
      principal_dor: "Preciso vender uma oferta ou captar clientes de forma direta",
    };

    const scores = buildServiceScoresFromData(data);
    const inferred = getServiceTypeFromData({ ...data, service_scores: scores });

    assert.ok(scores["landing-page"] > scores["site-institucional"]);
    assert.equal(inferred, "landing-page");
  });

  it("asks a tie-breaker only when the top scores are close", () => {
    const tiedScores = {
      "central-de-links": 3,
      "landing-page": 3,
      "site-institucional": 2,
      sistema: 1,
    };

    assert.equal(shouldAskTieBreaker({ service_scores: tiedScores }), true);
  });
});
