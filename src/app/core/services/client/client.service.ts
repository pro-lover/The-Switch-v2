import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Client } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

const baseUrl = `${environment.apiUrl}/clients`;

@Injectable({ providedIn: 'root' })
export class ClientService implements OnDestroy {

	private _destroy$ = new Subject();

	private clientSubject: BehaviorSubject<Client[]>;
	public client: Observable<Client[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.clientSubject = new BehaviorSubject<Client[]>([]);
		this.client = this.clientSubject.asObservable();
	}

	public get clientValue(): Client[] {
		return this.clientSubject.value;
	}

	public getAll() {

		if( this.clientValue !== null && this.clientValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.clientValue);
			return this.clientSubject;

		} else {
			return this.http.get<Client[]>(baseUrl)
				.pipe(map((modelCollection: Client[]) => {
						// publish updated collection to subscribers
						this.clientSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<Client>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<Client>(baseUrl, params)
			.pipe(map((model: Client) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<Client>(`${baseUrl}/${id}`, params)
			.pipe(map((model: Client) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<Client>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: Client) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<Client>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: Client) => {

				this.refreshCollection('update', model);
				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<Client>(`${baseUrl}/${id}`)
			.pipe(map((model: Client) => {

				this.refreshCollection('delete', model, id);
				return model;

			}));
	}

	ngOnDestroy(): void {
		//this._destroy$.complete();
		//this._destroy$.unsubscribe();
		this._destroy$.next(false);
		this._destroy$.complete();
	}

    // helper methods
	private refreshCollection( type: string, model: Client, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.clientValue !== null ) {
					const updatedObjs:Client[] = [];
					this.clientValue.map((x: Client) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.clientSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.clientValue !== null ) {

					const updatedObjs:Client[] = [];
					this.clientValue.map((x:Client) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.clientSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.clientValue !== null && deleteId !== undefined ) {

					const updatedObjs:Client[] = [];
					this.clientValue.map((x:Client) => {
						/** /
						if( parseInt(x.id) === parseInt(deleteId) ) {} else {
							updatedObjs.push(x);
						}
						/**/
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.clientSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('clients');

	}

}
