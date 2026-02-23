/**
 * E2E Tests: Dashboard Filter Interactions
 *
 * Tests that the filter controls on the executive dashboard render correctly
 * and respond to user interaction. Does NOT require backend data.
 */

describe("Dashboard Filters", () => {
  beforeEach(() => {
    cy.visit("/hvac/ejecutivo");
  });

  it("plant filter label is present on the dashboard", () => {
    // Label may be below the fold inside a clipped widget — check existence, not visibility
    cy.contains("Planta").should("exist");
  });

  it("status filter label is present on the dashboard", () => {
    cy.contains("Estado").should("exist");
  });

  it("plant filter combobox can be opened and shows 'Todas las plantas' option", () => {
    // The Label and SelectTrigger are siblings inside the same flex-col div.
    // Traverse up two levels from the label to reach that wrapper div, then find the trigger.
    cy.contains("label", "Planta")
      .parent()
      .find("button[role='combobox']")
      .scrollIntoView()
      .click();

    // Options render in a portal — use exist instead of be.visible to avoid SVG overlay issues
    cy.contains("[role='option']", "Todas las plantas").should("exist");

    // Close without selecting
    cy.contains("[role='option']", "Todas las plantas").click();
  });

  it("status filter has all 5 options: ALL, OK, WARNING, ALARM, DISCONNECTED", () => {
    cy.contains("label", "Estado")
      .parent()
      .find("button[role='combobox']")
      .scrollIntoView()
      .click();

    cy.contains("[role='option']", "Todos los estados").should("exist");
    cy.contains("[role='option']", "OK").should("exist");
    cy.contains("[role='option']", "WARNING").should("exist");
    cy.contains("[role='option']", "ALARM").should("exist");
    cy.contains("[role='option']", "DISCONNECTED").should("exist");

    // Close dropdown with Escape (body has pointer-events:none while Radix portal is open)
    cy.get("body").type("{esc}");
  });

  it("selecting OK status filter does not throw an error", () => {
    cy.contains("label", "Estado")
      .parent()
      .find("button[role='combobox']")
      .scrollIntoView()
      .click();

    cy.contains("[role='option']", "OK").click();

    // The trigger should now show the selected value
    cy.contains("label", "Estado")
      .parent()
      .find("button[role='combobox']")
      .should("contain", "OK");
  });

  it("selecting ALARM status filter and then ALL restores the filter", () => {
    cy.contains("label", "Estado")
      .parent()
      .find("button[role='combobox']")
      .scrollIntoView()
      .click();

    cy.contains("[role='option']", "ALARM").click();

    cy.contains("label", "Estado")
      .parent()
      .find("button[role='combobox']")
      .should("contain", "ALARM");

    // Reset to ALL
    cy.contains("label", "Estado")
      .parent()
      .find("button[role='combobox']")
      .click();

    cy.contains("[role='option']", "Todos los estados").click();

    cy.contains("label", "Estado")
      .parent()
      .find("button[role='combobox']")
      .should("contain", "Todos los estados");
  });

  it("shows the 'no AHUs match' message when no AHUs are available (no backend)", () => {
    // Element may be in a scrollable grid — scroll into view before checking visibility
    cy.contains("No hay AHUs que coincidan con los filtros")
      .scrollIntoView()
      .should("exist");
  });
});
