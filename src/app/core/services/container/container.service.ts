import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Container } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/containers`;

@Injectable({ providedIn: 'root' })
export class ContainerService {
	private containerSubject: BehaviorSubject<Container[]>;
	public container: Observable<Container[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.containerSubject = new BehaviorSubject<Container[]>([]);
		this.container = this.containerSubject.asObservable();
	}

	public get containerValue(): Container[] {
		return this.containerSubject.value;
	}

	public getAll() {
		if( this.containerValue !== null && this.containerValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.containerValue);
			return this.containerSubject;

		} else {
			return this.http.get<Container[]>(baseUrl)
				.pipe(map((modelCollection: Container[]) => {
						// publish updated collection to subscribers
						this.containerSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<Container>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<Container>(baseUrl, params)
			.pipe(map((model: Container) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<Container>(`${baseUrl}/${id}`, params)
			.pipe(map((model: Container) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<Container>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: Container) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<Container>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: Container) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<Container>(`${baseUrl}/${id}`)
			.pipe(map((model: Container) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: Container, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.containerValue !== null ) {
					const updatedObjs:Container[] = [];
					this.containerValue.map((x: Container) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.containerSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.containerValue !== null ) {

					const updatedObjs:Container[] = [];
					this.containerValue.map((x:Container) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.containerSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.containerValue !== null && deleteId !== undefined ) {

					const updatedObjs:Container[] = [];
					this.containerValue.map((x:Container) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.containerSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('containers');

	}

}
