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
			default: '#0d1117',
			paper: '#161b27',
		},
		primary: {
			contrastText: '#d7b586',
			main: '#343434',
		},
		secondary: {
			contrastText: '#343434',
			main: '#d7b586',
		},
		text: {
			primary: '#ffffff',
			secondary: '#cbd5e0',
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
					background: 'var(--bg-base, #0d1117)',
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
