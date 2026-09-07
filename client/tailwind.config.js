/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B1F2A',
          light: '#2C3140',
        },
        paper: {
          DEFAULT: '#FBF9F5',
          dark: '#14161D',
          darkcard: '#1C1F29',
        },
        accent: {
          DEFAULT: '#B8863A',
          dark: '#D9A65C',
        },
        moss: {
          DEFAULT: '#4B6455',
          light: '#EDF1EC',
        },
        rust: {
          DEFAULT: '#A8432F',
        },
        line: {
          DEFAULT: '#E4DED1',
          dark: '#2B2E38',
        },
        slate: {
          DEFAULT: '#6B7280',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
      typography: () => ({
        DEFAULT: {
          css: {
            maxWidth: '68ch',
          },
        },
      }),
    },
  },
  plugins: [],
};
