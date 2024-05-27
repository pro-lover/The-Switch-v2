
export class ComponentModel {
	id!: string;
	name!: string;
	description!: string;
	smart!: boolean;
	componenttypeId!: number;
	componenttype!: any;
	componentmeta!: any[];
	animation!: any[];
	status!: boolean;
	created!: string;
	updated!: string;
	deletedAt!: string;
	version!: number;
	history!: any[];
	lastEditedBy!: number;
}
