import { useQuery } from '@apollo/client';
import { SERVICE_COUNT } from '../utils/queries';

const ServicesTab = () => {
	const { data } = useQuery(SERVICE_COUNT);

	return <span>Services {data && `(${data.serviceCount})`}</span>;
};

export default ServicesTab;
