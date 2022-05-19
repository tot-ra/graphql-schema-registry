import { Chip, makeStyles } from '@material-ui/core';
import styled from 'styled-components';
import { CommonLink } from '../../components/Link';
import { colors } from '../../utils';

const Container = styled.section`
	width: auto;
	column-gap: 1rem;
	display: flex;
	align-items: center;
`;

type ArgumentProps = {
	name?: string;
	type: {
		id: number;
		name: string;
		kind: string;
	};
	isNullable: boolean;
	isArray: boolean;
	isArrayNullable: boolean;
	isDeprecated?: boolean;
};

const useStyles = makeStyles({
	name: {
		color: colors.black.hex8,
	},
	symbol: {
		color: colors.black.hex64,
	},
});

export const Argument = ({
	name,
	type,
	isArray,
	isArrayNullable,
	isNullable,
	isDeprecated = false,
}: ArgumentProps) => {
	const styles = useStyles();
	return (
		<Container>
			{name?.length > 0 && (
				<span>
					{name}
					<span className={styles.symbol}>:</span>
				</span>
			)}
			<span>
				{(isArray || isArrayNullable) && (
					<span className={styles.symbol}>[</span>
				)}
				<CommonLink to={`/types/${type.kind.toLowerCase()}/${type.id}`}>
					{type.name}
				</CommonLink>
				{isArrayNullable && <span className={styles.symbol}>!</span>}
				{(isArray || isArrayNullable) && (
					<span className={styles.symbol}>]</span>
				)}
				{isNullable && <span className={styles.symbol}>!</span>}
			</span>
			{isDeprecated && (
				<Chip label="Deprecated" size="small" color="primary" />
			)}
		</Container>
	);
};
