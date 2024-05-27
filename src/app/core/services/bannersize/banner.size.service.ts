import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BannerSize } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/bannersizes`;

@Injectable({ providedIn: 'root' })
export class BannerSizeService {
	private bannerSizeSubject: BehaviorSubject<BannerSize[]>;
	public bannerSize: Observable<BannerSize[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.bannerSizeSubject = new BehaviorSubject<BannerSize[]>([]);
		this.bannerSize = this.bannerSizeSubject.asObservable();
	}

	public get bannerSizeValue(): BannerSize[] {
		return this.bannerSizeSubject.value;
	}

	public getAll() {
		if( this.bannerSizeValue !== null && this.bannerSizeValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.bannerSizeValue);
			return this.bannerSizeSubject;

		} else {
			return this.http.get<BannerSize[]>(baseUrl)
				.pipe(map((modelCollection: BannerSize[]) => {
						// publish updated collection to subscribers
						this.bannerSizeSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<BannerSize>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<BannerSize>(baseUrl, params)
			.pipe(map((model: BannerSize) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<BannerSize>(`${baseUrl}/${id}`, params)
			.pipe(map((model: BannerSize) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<BannerSize>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: BannerSize) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<BannerSize>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: BannerSize) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<BannerSize>(`${baseUrl}/${id}`)
		.pipe(map((model: BannerSize) => {

			this.refreshCollection('delete', model, id);

			return model;

		}));
	}

    // helper methods
	private refreshCollection( type: string, model: BannerSize, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.bannerSizeValue !== null ) {
					const updatedObjs:BannerSize[] = [];
					this.bannerSizeValue.map((x: BannerSize) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.bannerSizeSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.bannerSizeValue !== null ) {

					const updatedObjs:BannerSize[] = [];
					this.bannerSizeValue.map((x:BannerSize) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.bannerSizeSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.bannerSizeValue !== null && deleteId !== undefined ) {

					const updatedObjs:BannerSize[] = [];
					this.bannerSizeValue.map((x:BannerSize) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.bannerSizeSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('bannersizes');

	}

}
