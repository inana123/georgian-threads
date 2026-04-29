import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#09b1ba",   // Vinted-style teal
          dark: "#078a91",
          light: "#e6fafb",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        cardHover: "0 8px 24px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
} satisfies Config;
