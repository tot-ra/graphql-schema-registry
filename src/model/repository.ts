import { Operation } from "./operation"
import { Service } from "./service";
import { Type } from "./type"

export type TypeInstance = (Type | Operation) & {
    providedBy: Service[];
}

interface Parent {
	id: number;
	name: string;
	type: string;
}

interface Nullable {
	isNullable: boolean;
	isArray: boolean;
	isArrayNullable: boolean;
}

type ArgumentParent = Parent & Nullable & {
	id: number;
	name: string;
	type: string;
}

export interface Argument {
	name: string;
	description?: string;
	parent: ArgumentParent;
}

export type Field = Nullable & {
	description?: string;
	parent: Parent;
	key: string;
	isDeprecated: Boolean;
	arguments?: Argument[];
}

export type InputParam = Nullable & {
	description?: string;
	parent: Parent;
	key: string;
}

export type OutputParam = Nullable & {
	description?: string;
	parent: Parent;
}

export type ParamProvidedBy = {
	description?: string;
	parent: Parent;
	key: string;
	providedBy: Service[];
}

export interface TypeInstanceDetail {
    id: number;
	name: string;
	description?: string;
	type: string;
	fields: Field[];
	usedBy: ParamProvidedBy[];
	implementations: ParamProvidedBy[];
}

export interface OperationInstanceDetail {
	id: number;
	name: string;
	description?: string;
	type: string;
	inputParams: InputParam[];
	outputParams: OutputParam[];
}

export interface TypeInstanceRepository {
	listByType(type: string, limit: number, offset: number): Promise<TypeInstance[]>
	countByType(type: string): Promise<number>
	getDetails(id: number): Promise<TypeInstanceDetail | OperationInstanceDetail>
}