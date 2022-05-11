import { Operation } from "./operation"
import { Service } from "./service";
import { Type } from "./type"

export type TypeInstance = (Type | Operation) & {
    providedBy: Service[];
}

export interface TypeInstanceRepository {
	listByType(type: string, limit: number, offset: number): Promise<TypeInstance[]>
	countByType(type: string): Promise<number>
}