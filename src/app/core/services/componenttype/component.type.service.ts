import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ComponentType } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/componenttypes`;

@Injectable({ providedIn: 'root' })
export class ComponentTypeService {
	private componentTypeSubject: BehaviorSubject<ComponentType[]>;
	public componentType: Observable<ComponentType[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.componentTypeSubject = new BehaviorSubject<ComponentType[]>([]);
		this.componentType = this.componentTypeSubject.asObservable();
	}

	public get componentTypeValue(): ComponentType[] {
		return this.componentTypeSubject.value;
	}

	public getAll() {
		if( this.componentTypeValue !== null && this.componentTypeValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.componentTypeValue);
			return this.componentTypeSubject;

		} else {
			return this.http.get<ComponentType[]>(baseUrl)
				.pipe(map((modelCollection: ComponentType[]) => {
						// publish updated collection to subscribers
						this.componentTypeSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}

	}

	public getById(id: string) {
		return this.http.get<ComponentType>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<ComponentType>(baseUrl, params)
			.pipe(map((model: ComponentType) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<ComponentType>(`${baseUrl}/${id}`, params)
			.pipe(map((model: ComponentType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<ComponentType>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: ComponentType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<ComponentType>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: ComponentType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<ComponentType>(`${baseUrl}/${id}`)
			.pipe(map((model: ComponentType) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: ComponentType, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.componentTypeValue !== null ) {
					const updatedObjs:ComponentType[] = [];
					this.componentTypeValue.map((x: ComponentType) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.componentTypeSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.componentTypeValue !== null ) {

					const updatedObjs:ComponentType[] = [];
					this.componentTypeValue.map((x:ComponentType) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.componentTypeSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.componentTypeValue !== null && deleteId !== undefined ) {

					const updatedObjs:ComponentType[] = [];
					this.componentTypeValue.map((x:ComponentType) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.componentTypeSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('componenttypes');

	}

}
