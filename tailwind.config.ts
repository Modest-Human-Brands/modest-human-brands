import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    fontSize: {
      '2xs': ['0.625rem', '0.75rem'],
      xs: ['0.75rem', '0.875rem'],
      sm: ['0.875rem', '1.0625rem'],
      base: ['1rem', '1.5rem'],
      lg: ['1.25rem', '1.5625rem'],
      xl: ['1.5rem', '1.875rem'],
      '2xl': ['2rem', '2.5rem'],
      '3xl': ['2.5rem', '3.125rem'],
      '4xl': ['3rem', '3.625rem'],
      '5xl': ['3.5rem', '4.1875rem'],
    },
    fontFamily: {
      main: ['"Exo 2"', 'sans-serif'],
      sub: ['"Exo 2"', 'sans-serif'],
    },
    fontWeight: {
      light: '300',
      regular: '400',
      'semi-bold': '500',
      bold: '600',
    },
    colors: {
      transparent: 'transparent',
      white: '#FFFFFF',
      light: {
        400: '#8D8D8D',
        500: '#B4B4B4',
        600: '#D9D9D9',
      },
      black: '#000000',
      dark: {
        400: '#191919',
        500: '#2B2B2B',
        600: '#3D3D3D',
      },
      accent: {
        400: '#6672FF',
        500: '#5945EA',
        600: '#4533CC',
      },
      info: {
        400: '#66C1FF',
        500: '#47A8EB',
        600: '#338ECC',
      },
      success: {
        400: '#66FFB6',
        500: '#47EB9C',
        600: '#33CC83',
      },
      warning: {
        400: '#FFCF6B',
        500: '#FFB83D',
        600: '#FF9F1A',
      },
      alert: {
        400: '#FF6680',
        500: '#EB4864',
        600: '#CC334D',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
