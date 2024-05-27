
export class Template {
	id!: string;
	name!: string;
	description!: string;
	status!: boolean;
	clientId!: number;
	bannertypeId!: number;
	client!: any;
	bannertype!: any;
	banners!: any[];
	created!: string;
	updated!: string;
	deletedAt!: string | null;
	version!: number;
	history!: any[];
	lastEditedBy!: number;
}
