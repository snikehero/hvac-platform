/**
 * E2E Tests: Alarm Acknowledgment Flow
 *
 * Tests that verify the alarms page renders correctly and the
 * acknowledgment localStorage persistence works.
 * No backend required for the localStorage-based tests.
 */

describe("Alarms Page - Basic Rendering", () => {
  it("shows the alarms page title when navigating to /hvac/alarms", () => {
    cy.visit("/hvac/alarms");
    cy.contains("h1", "Sistema de Alarmas").should("be.visible");
  });

  it("shows the KPI count cards on load", () => {
    cy.visit("/hvac/alarms");

    // These cards always render regardless of backend state
    cy.contains("Alarmas Críticas").should("be.visible");
    cy.contains("Advertencias").should("be.visible");
  });

  it("shows the filter tabs (ALL, ALARM, WARNING, ACKNOWLEDGED)", () => {
    cy.visit("/hvac/alarms");

    cy.contains("[role='tab']", "Todos").should("be.visible");
    cy.contains("[role='tab']", "Alarmas").should("be.visible");
    cy.contains("[role='tab']", "Warnings").should("be.visible");
    cy.contains("[role='tab']", "Reconocidas").should("be.visible");
  });

  it("shows empty state when no active alarms (no backend)", () => {
    cy.visit("/hvac/alarms");

    // Without backend, there are no active alarms — show the normal empty state
    cy.contains("Todos los sistemas están operando normalmente").should("be.visible");
  });
});

describe("Alarms Page - ACKNOWLEDGED tab", () => {
  it("shows 'No hay alarmas reconocidas' on the ACKNOWLEDGED tab when empty", () => {
    cy.visit("/hvac/alarms");

    // Click the ACKNOWLEDGED tab
    cy.contains("[role='tab']", "Reconocidas").click();

    cy.contains("No hay alarmas reconocidas").should("be.visible");
  });

  it("persists seeded ack across page reload", () => {
    // Seed an ack into localStorage using the custom command
    cy.seedAck("PLANT-A", "AHU-01", "ALARM");

    cy.visit("/hvac/alarms");

    // Reload to verify localStorage survived
    cy.reload();

    // Click the ACKNOWLEDGED tab
    cy.contains("[role='tab']", "Reconocidas").click();

    // Verify localStorage survived the reload
    cy.window().then((win) => {
      const stored = win.localStorage.getItem("hvac-acks");
      expect(stored).not.to.be.null;
      const acks = JSON.parse(stored!);
      expect(acks).to.have.length(1);
      expect(acks[0].ahuId).to.equal("AHU-01");
    });
  });
});

describe("Alarms Page - Search", () => {
  it("search input is visible and accepts text", () => {
    cy.visit("/hvac/alarms");

    cy.get('input[placeholder*="Buscar"]').should("be.visible").type("AHU-01");

    cy.get('input[placeholder*="Buscar"]').should("have.value", "AHU-01");
  });
});
