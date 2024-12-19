import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Obter o diretório e o nome do arquivo atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar o compat com o diretório base
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Configuração ESLint com os "extends" corretos
const eslintConfig = compat.extends([
  "next/core-web-vitals",  // Configurações do Next.js para performance e acessibilidade
  "next/typescript"        // Configurações do Next.js para TypeScript
]);

export default eslintConfig;
