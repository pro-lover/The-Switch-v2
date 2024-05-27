import { Role } from './role';

export class Account {
	id!: string;
	title!: string;
	firstName!: string;
	lastName!: string;
	email!: string;
	role!: Role;
	jwtToken?: string;
	created!: Date;
	updated!: Date;
	deletedAt!: Date | null;
	version!: number;
	status!: boolean;
	lastEditedBy!: number;
	history!: any[];
	//
	get fullname() {
		return `${this.firstName} ${this.lastName}`;
	}
}
