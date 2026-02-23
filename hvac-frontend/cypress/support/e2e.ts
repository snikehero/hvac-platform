import "./commands";

// Clear app localStorage state before each test
beforeEach(() => {
  cy.clearLocalStorage();
});
