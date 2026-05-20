import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
  	container: {
  		center: true,
  		padding: '1.5rem',
  		screens: {
  			'2xl': '1280px'
  		}
  	},
  	extend: {
  		colors: {
  			terracotta: {
  				DEFAULT: '#C84B31',
  				deep: '#A6361F',
  				darker: '#7A2818'
  			},
  			cream: {
  				DEFAULT: '#FAF3E7',
  				warm: '#fdf8ee',
  				deep: '#f3e9d4'
  			},
  			sand: {
  				DEFAULT: '#e8dcc1',
  				deep: '#d9c9a7'
  			},
  			ink: {
  				DEFAULT: '#2D2A26',
  				soft: '#4a3f31',
  				faded: '#8a7d6a'
  			},
  			favor: {
  				DEFAULT: '#7A8450',
  				bg: '#f4f6ec'
  			},
  			avoid: {
  				DEFAULT: '#6b2a1a',
  				bg: '#fbf0ec'
  			},
  			saffron: {
  				DEFAULT: '#C99A4D',
  				soft: '#ECD9B2',
  				deep: '#A87E36'
  			},
  			khus: {
  				DEFAULT: '#6B7F4F',
  				soft: '#C8D2B3',
  				deep: '#4F5F39'
  			},
  			mulberry: {
  				DEFAULT: '#4A2E2A',
  				deep: '#2E1C1A'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			display: [
  				'var(--font-fraunces)',
  				'Georgia',
  				'serif'
  			],
  			body: [
  				'var(--font-inter-tight)',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-jetbrains-mono)',
  				'ui-monospace',
  				'monospace'
  			],
  			sanskrit: [
  				'var(--font-noto-devanagari)',
  				'var(--font-fraunces)',
  				'"Noto Serif Devanagari"',
  				'Georgia',
  				'serif'
  			]
  		},
  		letterSpacing: {
  			widest2: '0.2em',
  			widest3: '0.3em'
  		},
  		boxShadow: {
  			report: '0 24px 60px -20px rgba(45, 42, 38, 0.25)',
  			cta: '0 12px 30px -12px rgba(122, 40, 24, 0.45)'
  		},
  		maxWidth: {
  			copy: '540px',
  			prose540: '540px'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'moon-drift': {
  				'0%, 100%': {
  					transform: 'translateY(0) rotate(0deg)'
  				},
  				'50%': {
  					transform: 'translateY(-8px) rotate(2deg)'
  				}
  			},
  			marquee: {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-100% - var(--gap)))'
  				}
  			},
  			'marquee-vertical': {
  				from: {
  					transform: 'translateY(0)'
  				},
  				to: {
  					transform: 'translateY(calc(-100% - var(--gap)))'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '0% 50%'
  				},
  				'100%': {
  					backgroundPosition: '100% 50%'
  				}
  			},
  			'soft-pulse': {
  				'0%, 100%': {
  					opacity: '0.5',
  					transform: 'scale(1)'
  				},
  				'50%': {
  					opacity: '1',
  					transform: 'scale(1.4)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'moon-drift': 'moon-drift 18s ease-in-out infinite',
  			marquee: 'marquee var(--duration) linear infinite',
  			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
  			shimmer: 'shimmer 4s ease-in-out infinite alternate',
  			'soft-pulse': 'soft-pulse 2.4s ease-in-out infinite'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};

export default config;
