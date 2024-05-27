import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FontType } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/fonttypes`;

@Injectable({ providedIn: 'root' })
export class FontTypeService {
	private fontTypeSubject: BehaviorSubject<FontType[]>;
	public fontType: Observable<FontType[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.fontTypeSubject = new BehaviorSubject<FontType[]>([]);
		this.fontType = this.fontTypeSubject.asObservable();
	}

	public get fontTypeValue(): FontType[] {
		return this.fontTypeSubject.value;
	}

	public getAll() {
		if( this.fontTypeValue !== null && this.fontTypeValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.fontTypeValue);
			return this.fontTypeSubject;

		} else {
			return this.http.get<FontType[]>(baseUrl)
				.pipe(map((modelCollection: FontType[]) => {
						// publish updated collection to subscribers
						this.fontTypeSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<FontType>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<FontType>(baseUrl, params)
			.pipe(map((model: FontType) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<FontType>(`${baseUrl}/${id}`, params)
			.pipe(map((model: FontType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<FontType>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: FontType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<FontType>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: FontType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<FontType>(`${baseUrl}/${id}`)
			.pipe(map((model: FontType) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: FontType, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.fontTypeValue !== null ) {
					const updatedObjs:FontType[] = [];
					this.fontTypeValue.map((x: FontType) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.fontTypeSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.fontTypeValue !== null ) {

					const updatedObjs:FontType[] = [];
					this.fontTypeValue.map((x:FontType) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.fontTypeSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.fontTypeValue !== null && deleteId !== undefined ) {

					const updatedObjs:FontType[] = [];
					this.fontTypeValue.map((x:FontType) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.fontTypeSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('fonttypes');

	}

}
