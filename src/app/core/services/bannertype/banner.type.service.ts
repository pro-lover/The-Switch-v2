import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BannerType } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/bannertypes`;

@Injectable({ providedIn: 'root' })
export class BannerTypeService {
	private bannerTypeSubject: BehaviorSubject<BannerType[]>;
	public bannerType: Observable<BannerType[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.bannerTypeSubject = new BehaviorSubject<BannerType[]>([]);
		this.bannerType = this.bannerTypeSubject.asObservable();
	}

	public get bannerTypeValue(): BannerType[] {
		return this.bannerTypeSubject.value;
	}

	public getAll() {
		if( this.bannerTypeValue !== null && this.bannerTypeValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.bannerTypeValue);
			return this.bannerTypeSubject;

		} else {
			return this.http.get<BannerType[]>(baseUrl)
				.pipe(map((modelCollection: BannerType[]) => {
						// publish updated collection to subscribers
						this.bannerTypeSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}

	}

	public getById(id: string) {
		return this.http.get<BannerType>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<BannerType>(baseUrl, params)
			.pipe(map((model: BannerType) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<BannerType>(`${baseUrl}/${id}`, params)
			.pipe(map((model: BannerType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<BannerType>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: BannerType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<BannerType>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: BannerType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<BannerType>(`${baseUrl}/${id}`)
			.pipe(map((model: BannerType) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: BannerType, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.bannerTypeValue !== null ) {
					const updatedObjs:BannerType[] = [];
					this.bannerTypeValue.map((x: BannerType) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.bannerTypeSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.bannerTypeValue !== null ) {

					const updatedObjs:BannerType[] = [];
					this.bannerTypeValue.map((x:BannerType) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.bannerTypeSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.bannerTypeValue !== null && deleteId !== undefined ) {

					const updatedObjs:BannerType[] = [];
					this.bannerTypeValue.map((x:BannerType) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.bannerTypeSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('bannertypes');

	}

}
