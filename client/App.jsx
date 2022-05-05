import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	ApolloProvider,
} from '@apollo/client';

import { GlobalConfigContext, createConfig } from './utils/globalConfig';
import Main from './components/Main';

import './style.css';
import './prism-material-light.css';

const App = ({ api }) => {
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
				<Main />
			</ApolloProvider>
		</GlobalConfigContext.Provider>
	);
};

export default App;
