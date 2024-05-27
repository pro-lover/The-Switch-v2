import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EasingType } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/easingtypes`;

@Injectable({ providedIn: 'root' })
export class EasingTypeService {
	private easingTypeSubject: BehaviorSubject<EasingType[]>;
	public easingType: Observable<EasingType[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.easingTypeSubject = new BehaviorSubject<EasingType[]>([]);
		this.easingType = this.easingTypeSubject.asObservable();
	}

	public get easingTypeValue(): EasingType[] {
		return this.easingTypeSubject.value;
	}

	public getAll() {
		if( this.easingTypeValue !== null && this.easingTypeValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.easingTypeValue);
			return this.easingTypeSubject;

		} else {
			return this.http.get<EasingType[]>(baseUrl)
				.pipe(map((modelCollection: EasingType[]) => {
						// publish updated collection to subscribers
						this.easingTypeSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<EasingType>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<EasingType>(baseUrl, params)
			.pipe(map((model: EasingType) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<EasingType>(`${baseUrl}/${id}`, params)
			.pipe(map((model: EasingType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<EasingType>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: EasingType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<EasingType>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: EasingType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<EasingType>(`${baseUrl}/${id}`)
			.pipe(map((model: EasingType) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: EasingType, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.easingTypeValue !== null ) {
					const updatedObjs:EasingType[] = [];
					this.easingTypeValue.map((x: EasingType) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.easingTypeSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.easingTypeValue !== null ) {

					const updatedObjs:EasingType[] = [];
					this.easingTypeValue.map((x:EasingType) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.easingTypeSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.easingTypeValue !== null && deleteId !== undefined ) {

					const updatedObjs:EasingType[] = [];
					this.easingTypeValue.map((x:EasingType) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.easingTypeSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('easingtypes');

	}

}
