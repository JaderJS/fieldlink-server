import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        globals: true, // habilita describe/it sem importar
        environment: "node", // backend bun, então node é safe
        include: ["./src/tests/**/*.test.ts"], // onde achar testes
        coverage: {
            provider: "istanbul",
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
