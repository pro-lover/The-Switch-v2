
export class Task {
	id!: string;
	name!: string;
	description!: string;
	jobNumber!: string;
	status!: boolean;
	created!: string;
	updated!: string;
	deletedAt!: string;
	version!: number;
	history!: any[];
	lastEditedBy!: number;
}
