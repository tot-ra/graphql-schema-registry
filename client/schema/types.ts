export enum Order {
	ASC = 'ASC',
	DESC = 'DESC',
}

export enum SortField {
	NAME = 'NAME',
	ADDEDD_TIME = 'ADDEDD_TIME',
}

export interface Sort {
	sortField: SortField;
	[SortField.NAME]: Order;
	[SortField.ADDEDD_TIME]: Order;
}

export interface Service {
	id: number;
	name: string;
	isActive: boolean;
	updatedTime: Date;
	addedTime: Date;
	url: string;
}
