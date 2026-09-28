/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B1D2A',
        slate: {
          950: '#12141F',
        },
        canvas: '#F6F5F1',
        panel: '#FFFFFF',
        brand: {
          50: '#EEF3FF',
          100: '#DCE7FF',
          400: '#5C7CFA',
          500: '#3B5BDB',
          600: '#2F49B0',
          700: '#26397F',
        },
        signal: {
          amber: '#C08A2E',
          rust: '#B5502A',
          moss: '#3F7A54',
          plum: '#7B4B94',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(27, 29, 42, 0.06), 0 1px 0 rgba(27, 29, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
