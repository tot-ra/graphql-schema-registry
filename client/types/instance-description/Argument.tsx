import { CommonLink } from '../../components/Link';

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
};

export const Argument = ({
	name,
	type,
	isArray,
	isArrayNullable,
	isNullable,
}: ArgumentProps) => (
	<>
		{name?.length > 0 && <span>{name}: </span>}
		{(isArray || isArrayNullable) && <span>[</span>}
		<CommonLink to={`/types/${type.kind}/${type.id}`}>
			{type.name}
		</CommonLink>
		{isArrayNullable && <span>!</span>}
		{(isArray || isArrayNullable) && <span>]</span>}
		{isNullable && <span>!</span>}
	</>
);
