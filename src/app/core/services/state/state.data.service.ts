import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
//import { map, finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class StateDataService {
	private dataSubject: BehaviorSubject<string>;
	public data: Observable<string>;

	constructor() {
		this.dataSubject = new BehaviorSubject<string>('');
		this.data = this.dataSubject.asObservable();
	}

	public get dataValue(): string {
		return this.dataSubject.value;
	}

	// Service message commands
	public announceUpdate(updateModel: string): void {
		this.dataSubject.next(updateModel);
	}

}
