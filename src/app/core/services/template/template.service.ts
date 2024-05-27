import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Template } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/templates`;

@Injectable({ providedIn: 'root' })
export class TemplateService implements OnDestroy {
	private templateSubject: BehaviorSubject<Template[]>;
	public template: Observable<Template[]>;

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.templateSubject = new BehaviorSubject<Template[]>([]);
		this.template = this.templateSubject.asObservable();

		this.stateDataService.data
			.pipe(takeUntil(this._destroy$))
			.subscribe((dataName) => {

				console.warn('TEMPLATE SERVICE EMPTY COLLECTION:', dataName);

				switch (dataName) {
					case 'animations':
					case 'components':
					case 'containers':

						this.templateSubject.next([]);

						break;

				}

			});
	}

	ngOnDestroy() {
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	public get templateValue(): Template[] {
		return this.templateSubject.value;
	}

	public getAll() {
		if( this.templateValue !== null && this.templateValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.templateValue);
			return this.templateSubject;

		} else {
			return this.http.get<Template[]>(baseUrl)
				.pipe(map((modelCollection: Template[]) => {
						// publish updated collection to subscribers
						this.templateSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<Template>(`${baseUrl}/${id}`);
	}

	public getTemplateBannersById(id: string) {
		return this.http.get<Template>(`${baseUrl}/${id}/banners`);
	}

	public create(params: any) {
		return this.http.post<Template>(baseUrl, params)
			.pipe(map((model: Template) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<Template>(`${baseUrl}/${id}`, params)
			.pipe(map((model: Template) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<Template>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: Template) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<Template>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: Template) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<Template>(`${baseUrl}/${id}`)
			.pipe(map((model: Template) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: Template, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.templateValue !== null ) {
					const updatedObjs:Template[] = [];
					this.templateValue.map((x: Template) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.templateSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.templateValue !== null ) {

					const updatedObjs:Template[] = [];
					this.templateValue.map((x:Template) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.templateSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.templateValue !== null && deleteId !== undefined ) {

					const updatedObjs:Template[] = [];
					this.templateValue.map((x:Template) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.templateSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('templates');

	}

}
