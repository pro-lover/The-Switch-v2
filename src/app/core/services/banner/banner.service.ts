import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Banner } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/banners`;

@Injectable({ providedIn: 'root' })
export class BannerService {
	private bannerSubject: BehaviorSubject<Banner[]>;
	public banner: Observable<Banner[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.bannerSubject = new BehaviorSubject<Banner[]>([]);
		this.banner = this.bannerSubject.asObservable();
	}

	public get bannerValue(): Banner[] {
		return this.bannerSubject.value;
	}

	public getAll() {
		if( this.bannerValue !== null && this.bannerValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.bannerValue);
			return this.bannerSubject;

		} else {
			return this.http.get<Banner[]>(baseUrl)
				.pipe(map((modelCollection: Banner[]) => {
						// publish updated collection to subscribers
						this.bannerSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}

	}

	public getById(id: string) {
		return this.http.get<Banner>(`${baseUrl}/${id}`);
	}

	public getTemplateBannersById(id: string) {
		return this.http.get<Banner>(`${baseUrl}/template/${id}`);
	}

	public create(params: any) {
		return this.http.post<Banner>(baseUrl, params)
			.pipe(map((model: Banner) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<Banner>(`${baseUrl}/${id}`, params)
			.pipe(map((model: Banner) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<Banner>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: Banner) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<Banner>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: Banner) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<Banner>(`${baseUrl}/${id}`)
			.pipe(map((model: Banner) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: Banner, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.bannerValue !== null ) {
					const updatedObjs:Banner[] = [];
					this.bannerValue.map((x: Banner) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.bannerSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.bannerValue !== null ) {

					const updatedObjs:Banner[] = [];
					this.bannerValue.map((x:Banner) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.bannerSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.bannerValue !== null && deleteId !== undefined ) {

					const updatedObjs:Banner[] = [];
					this.bannerValue.map((x:Banner) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.bannerSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('banners');

	}

	public generateBannerComponentRules(dynamicComponents:any): any[] {

		const TemplateRules:any[] = [];

		//console.log('dynamicComponents:', dynamicComponents);

		dynamicComponents.forEach( (component:any) => {

			if( component.componenttype.name === 'Text' ) {
				const textLength:number = (component.componentmeta.find((x:any) => x.name === 'fontValue').value).length;

				TemplateRules.push({
					'componentId': component.id,
					'bannerId': component.bannerId,
					'containerId': component.containerId,
					'name': component.name,
					'type': component.componenttype.name,
					'rules': [
						{
							'maximumcharacters' : textLength
						}
					]
				});

			} else if( component.componenttype.name === 'Image' ) {

				//console.log('template rules:', component.componentmeta);

				TemplateRules.push({
					'componentId': component.id,
					'bannerId': component.bannerId,
					'containerId': component.containerId,
					'name': component.name,
					'type': component.componenttype.name,
					'rules': [
						{
							'width' : component.componentmeta.find((x:any) => x.name === 'width').value,
							'height': component.componentmeta.find((x:any) => x.name === 'height').value
						}
					]
				});
			}
		});

		return TemplateRules;
	}
}
