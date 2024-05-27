import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Taxonomy } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/taxonomies`;

@Injectable({ providedIn: 'root' })
export class TaxonomyService {
	private taxonomySubject: BehaviorSubject<Taxonomy[]>;
	public taxonomy: Observable<Taxonomy[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.taxonomySubject = new BehaviorSubject<Taxonomy[]>([]);
		this.taxonomy = this.taxonomySubject.asObservable();
	}

	public get taxonomyValue(): Taxonomy[] {
		return this.taxonomySubject.value;
	}

	public getAll() {
		if( this.taxonomyValue !== null && this.taxonomyValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.taxonomyValue);
			return this.taxonomySubject;

		} else {
			return this.http.get<Taxonomy[]>(baseUrl)
				.pipe(map((modelCollection: Taxonomy[]) => {
						// publish updated collection to subscribers
						this.taxonomySubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<Taxonomy>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<Taxonomy>(baseUrl, params)
			.pipe(map((model: Taxonomy) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<Taxonomy>(`${baseUrl}/${id}`, params)
			.pipe(map((model: Taxonomy) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<Taxonomy>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: Taxonomy) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<Taxonomy>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: Taxonomy) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<Taxonomy>(`${baseUrl}/${id}`)
			.pipe(map((model: Taxonomy) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: Taxonomy, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.taxonomyValue !== null ) {
					const updatedObjs:Taxonomy[] = [];
					this.taxonomyValue.map((x: Taxonomy) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.taxonomySubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.taxonomyValue !== null ) {

					const updatedObjs:Taxonomy[] = [];
					this.taxonomyValue.map((x:Taxonomy) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.taxonomySubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.taxonomyValue !== null && deleteId !== undefined ) {

					const updatedObjs:Taxonomy[] = [];
					this.taxonomyValue.map((x:Taxonomy) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.taxonomySubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('taxonomies');

	}

}
