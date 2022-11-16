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

type AppProps = {
	api?: unknown;
};

const App = ({ api }: AppProps) => {
	const config = createConfig(api);

	const client = new ApolloClient({
		cache: new InMemoryCache(),
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
