import { Button, Typography } from '@material-ui/core';
import { useCallback } from 'react';
import styled from 'styled-components';

const Container = styled.section`
	width: auto;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	row-gap: 1rem;
`;

type ErrorRetryProps = {
	children?: React.ReactNode;
	onRetry?: () => unknown;
};

export const ErrorRetry = ({ children, onRetry }: ErrorRetryProps) => {
	const handleOnClick = useCallback(() => {
		onRetry();
	}, [onRetry]);

	return (
		<Container>
			{children ?? (
				<Typography variant="h6" component="h6" color="error">
					Something wrong happened :(
				</Typography>
			)}
			{onRetry && (
				<Button
					type="button"
					variant="contained"
					color="secondary"
					onClick={handleOnClick}
				>
					Retry
				</Button>
			)}
		</Container>
	);
};
