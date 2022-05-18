import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	ApolloProvider,
	defaultDataIdFromObject,
} from '@apollo/client';
import { HashRouter as Router } from 'react-router-dom';

import { GlobalConfigContext, createConfig } from './utils/globalConfig';
import Main from './components/Main';

import './style.css';
import './prism-material-light.css';

type AppProps = {
	api?: unknown;
};

const cache = new InMemoryCache({
	dataIdFromObject(responseObject) {
		if (responseObject.__typename === 'TypeInstance') {
			return `${defaultDataIdFromObject(responseObject)}:${
				responseObject.type
			}`;
		}
		return defaultDataIdFromObject(responseObject);
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
			<ApolloProvider client={client}>
				<Router>
					<Main />
				</Router>
			</ApolloProvider>
		</GlobalConfigContext.Provider>
	);
};

export default App;
