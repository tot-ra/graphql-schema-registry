import React from 'react';
import { useMutation } from '@apollo/client';
import { Button } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';

import {
	DEACTIVATE_SCHEMA_ENTRY,
	ACTIVATE_SCHEMA_ENTRY,
} from '../../utils/mutations';
import { useParams } from 'react-router-dom';

const DeactivateSchemaButton = ({ schema }) => {
	const { serviceName } = useParams();
	const [
		deactivateSchema,
		{ loading: deleting, error: deleteError },
	] = useMutation(DEACTIVATE_SCHEMA_ENTRY);

	const [
		activateSchema,
		{ loading: activating, error: activateError },
	] = useMutation(ACTIVATE_SCHEMA_ENTRY);

	const deleteErrorMessage = deleteError ? deleteError.message : null;
	const activateErrorMessage = activateError ? activateError.message : null;

	return (
		<>
			{deleteError && <div>{deleteErrorMessage}</div>}
			{activateError && <div>{activateErrorMessage}</div>}

			{schema.isActive && (
				<Button
					variant="contained"
					color="secondary"
					disabled={deleting}
					onClick={() => {
						deactivateSchema({
							variables: {
								id: schema.id,
							},
						});
					}}
				>
					<DeleteIcon />
					Deactivate
				</Button>
			)}
			{!schema.isActive && (
				<Button
					variant="contained"
					color="primary"
					disabled={activating}
					onClick={() => {
						activateSchema({
							variables: {
								id: schema.id,
							},
						});
					}}
				>
					<DeleteOutlinedIcon color="white" />
					Activate
				</Button>
			)}
		</>
	);
};

export default DeactivateSchemaButton;
