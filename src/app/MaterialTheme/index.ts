import { createTheme } from '@mui/material/styles';
import { common } from '@mui/material/colors';
import shadow from './shadow';
import typography from './typography';

/**
 * LIGHT THEME (DEFAULT)
 */
const light = {
	palette: {
		type: 'light',
		background: {
			default: '#f7f6f2', // --paper
			paper: '#ffffff',
		},
		primary: {
			contrastText: '#ffffff',
			main: '#1e2a5a', // --navy
		},
		secondary: {
			contrastText: '#ffffff',
			main: '#8a6a12', // --gold-deep
		},
		text: {
			primary: '#141b2b', // --ink
			secondary: '#4a5263', // --ink-soft
			dark: common.black,
		},
	},
	components: {
		MuiContainer: {
			styleOverrides: {
				root: {
					height: '100%',
				},
			},
		},
		MuiCssBaseline: {
			styleOverrides: {
				html: { height: '100%' },
				body: {
					background: 'var(--bg-base, #f7f6f2)',
					height: '100%',
					minHeight: '100%',
				},
			},
		},
	},
	shadow,
	typography,
};

// A custom theme for this app
let theme = createTheme(light);
theme = createTheme(theme, {
	components: {
		MuiContainer: {
			styleOverrides: {
				maxWidthLg: {
					[theme.breakpoints.up('lg')]: {
						maxWidth: '1300px',
					},
				},
			},
		},
	},
});

export default theme;
