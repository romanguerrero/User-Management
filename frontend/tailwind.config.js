/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Surface colors
        'surface': 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        'surface-secondary': 'var(--surface-secondary)',
        
        // Text colors
        'foreground': 'var(--foreground)',
        'foreground-muted': 'var(--foreground-muted)',
        'foreground-subtle': 'var(--foreground-subtle)',
        
        // Border colors
        'border': 'var(--border)',
        'border-subtle': 'var(--border-subtle)',
        
        // Background colors
        'background': 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        'background-gradient-start': 'var(--background-gradient-start)',
        'background-gradient-end': 'var(--background-gradient-end)',
        
        // Component specific
        'table-hover': 'var(--table-hover)',
        'input-bg': 'var(--input-bg)',
        'button-bg': 'var(--button-bg)',
        'button-hover': 'var(--button-hover)',
      },
    },
  },
  plugins: [],
}