import { Operation } from "./operation"
import { Type } from "./type"

export interface TypeInstanceRepository {
	listByType(type: string, limit: number, offset: number): Promise<Operation[] | Type[]>
	countByType(type: string): Promise<number>
}