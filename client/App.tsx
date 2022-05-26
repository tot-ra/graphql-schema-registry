import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	ApolloProvider,
} from '@apollo/client';
import { HashRouter as Router } from 'react-router-dom';

import { GlobalConfigContext, createConfig } from './utils/globalConfig';
import Main from './components/Main';

import './style.css';
import './prism-material-light.css';
import { createTheme, ThemeProvider } from '@material-ui/core';

const theme = createTheme({
	overrides: {
		MuiTableHead: {
			root: {
				backgroundColor: '#e4e9e4f7',
			},
		},
		MuiTableCell: {
			head: {
				color: '#666666',
			},
		},
	},
});

type AppProps = {
	api?: unknown;
};

const cache = new InMemoryCache({
	typePolicies: {
		TypeInstance: {
			keyFields: ['id', 'type'],
		},
	},
});

const App = ({ api }: AppProps) => {
	const config = createConfig(api);

	const client = new ApolloClient({
		cache,
		link: new HttpLink({
			uri: config.grapqhlEndpoint,
			credentials: 'include',
		}),
	});

	return (
		<GlobalConfigContext.Provider value={config}>
			<ThemeProvider theme={theme}>
				<ApolloProvider client={client}>
					<Router>
						<Main />
					</Router>
				</ApolloProvider>
			</ThemeProvider>
		</GlobalConfigContext.Provider>
	);
};

export default App;
