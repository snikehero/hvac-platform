/**
 * E2E Tests: Settings Threshold Changes
 *
 * These tests do NOT require the backend — settings are fully localStorage-driven.
 * Run with: npm run dev (port 5173) + npm run cy:open
 */

// Helper: find the temperature ALARM number input (first ALARM input in the thresholds tab)
function getTempAlarmInput() {
  return cy
    .contains("label", /Alarma \(ALARM\)/)
    .first()
    .closest(".space-y-2")
    .find('input[type="number"]');
}

describe("Settings - Threshold Changes", () => {
  beforeEach(() => {
    cy.visit("/hvac/settings");
  });

  it("shows the settings page title", () => {
    cy.contains("h1", "Configuración").should("be.visible");
  });

  it("changes temperature alarm threshold and persists across page reload", () => {
    // {selectall} selects existing value before typing — avoids appending to existing number
    getTempAlarmInput().type("{selectall}42");

    cy.contains("button", "Guardar cambios").click();

    cy.reload();

    getTempAlarmInput().should("have.value", "42");
  });

  it("resets settings to defaults after changing a value", () => {
    getTempAlarmInput().type("{selectall}99");
    cy.contains("button", "Guardar cambios").click();

    cy.contains("button", "Restablecer valores por defecto").click();

    // Default temperatureAlarm is 35
    getTempAlarmInput().should("have.value", "35");
  });

  it("shows unsaved changes indicator when a value is modified", () => {
    getTempAlarmInput().type("{selectall}40");

    cy.contains("Cambios sin guardar").should("be.visible");
  });

  it("language switch to English updates visible text", () => {
    // Navigate to General tab and wait for its content to appear
    cy.contains("button", "General").click();
    cy.contains("label", "Idioma").should("be.visible");

    // The label is inside div.space-y-0.5; its parent is the flex row;
    // the combobox trigger is a sibling of div.space-y-0.5 inside that row.
    // Using .parent().parent() is more reliable than .closest() with compound classes.
    cy.contains("label", "Idioma")
      .parent()   // div.space-y-0.5
      .parent()   // div.flex (the row containing label group + Select)
      .find("button[role='combobox']")
      .click();

    cy.contains("[role='option']", "English").click();

    cy.contains("button", "Guardar cambios").click();

    // Navigate to the alarms page — should now show English text
    cy.visit("/hvac/alarms");

    cy.contains("h1", "Alarm System").should("be.visible");
  });
});
