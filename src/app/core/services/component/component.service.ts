import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ComponentModel } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/components`;

@Injectable({ providedIn: 'root' })
export class ComponentService {
	private componentSubject: BehaviorSubject<ComponentModel[]>;
	public component: Observable<ComponentModel[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.componentSubject = new BehaviorSubject<ComponentModel[]>([]);
		this.component = this.componentSubject.asObservable();
	}

	public get componentValue(): ComponentModel[] {
		return this.componentSubject.value;
	}

	public getAll() {
		if( this.componentValue !== null && this.componentValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.componentValue);
			return this.componentSubject;

		} else {
			return this.http.get<ComponentModel[]>(baseUrl)
				.pipe(map((modelCollection: ComponentModel[]) => {
						// publish updated collection to subscribers
						this.componentSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}

	}

	public getById(id: string) {
		return this.http.get<ComponentModel>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<ComponentModel>(baseUrl, params)
			.pipe(map((model: ComponentModel) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

	public upload(params: any) {
		const formData = new FormData();
    	formData.append('file', params?.file);
		formData.append('filepath', params?.path);

		return this.http.post(`${baseUrl}/upload-asset`, formData);
	}

    public update(id:string, params: any) {
		return this.http.put<ComponentModel>(`${baseUrl}/${id}`, params)
			.pipe(map((model: ComponentModel) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateComponentMeta(id:string, params: any) {
		return this.http.put<ComponentModel>(`${baseUrl}/${id}/update-meta`, params)
			.pipe(map((model: ComponentModel) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<ComponentModel>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: ComponentModel) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateSmartStatus(id: string, params: any) {
		return this.http.put<ComponentModel>(`${baseUrl}/${id}/update-smartstatus`, params)
			.pipe(map((model: ComponentModel) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<ComponentModel>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: ComponentModel) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<ComponentModel>(`${baseUrl}/${id}`)
			.pipe(map((model: ComponentModel) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: ComponentModel, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.componentValue !== null ) {
					const updatedObjs:ComponentModel[] = [];
					this.componentValue.map((x: ComponentModel) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.componentSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.componentValue !== null ) {

					const updatedObjs:ComponentModel[] = [];
					this.componentValue.map((x:ComponentModel) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.componentSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.componentValue !== null && deleteId !== undefined ) {

					const updatedObjs:ComponentModel[] = [];
					this.componentValue.map((x:ComponentModel) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.componentSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('components');

	}

}
