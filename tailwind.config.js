/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Uncomment if using App Router
  ],
  // content key was duplicated, removed the duplicate line above this comment.
  // safelist: [ // Removing safelist, it was for v4 testing
  //   'bg-orange-500',
  //   'text-white',
  // ],
  theme: {
    extend: {
      colors: {
        'dga-verde': '#22c55e', // verde principal DGA-inspired
        'dga-verde-oscuro': '#16a34a', // navegación, botones CTA
        'dga-verde-profundo': '#15803d', // headers, elementos importantes
        'dga-verde-suave': '#dcfce7', // backgrounds, highlights sutiles
        'dga-verde-menta': '#bbf7d0', // accents, hover states
        // Complementarios
        'dga-blanco': '#ffffff', // fondos principales (renamed from blanco puro for consistency)
        'dga-gris-claro': '#f8fafc', // fondos cards
        'dga-gris-neutro': '#64748b', // textos secundarios
        'dga-gris-oscuro': '#1e293b', // textos principales
        // Estados funcionales
        'dga-success': '#10b981',
        'dga-warning': '#f59e0b',
        'dga-error': '#ef4444',
        'dga-info': '#06b6d4',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
