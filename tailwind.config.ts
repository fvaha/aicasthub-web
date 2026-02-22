import type { Config } from "tailwindcss"

const config: Config = {
    darkMode: "class",
    presets: [require("@medusajs/ui-preset")],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
export default config
