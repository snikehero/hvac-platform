import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: [
        "src/domain/**",
        "src/hooks/**",
        "src/context/**",
        "src/components/MetricCards/**",
        "src/components/GenericCommandsPanel/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
