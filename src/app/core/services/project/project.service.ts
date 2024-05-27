import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Project } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/projects`;

@Injectable({ providedIn: 'root' })
export class ProjectService {
	private projectSubject: BehaviorSubject<Project[]>;
	public project: Observable<Project[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.projectSubject = new BehaviorSubject<Project[]>([]);
		this.project = this.projectSubject.asObservable();
	}

	public get projectValue(): Project[] {
		return this.projectSubject.value;
	}

	public getAll() {
		if( this.projectValue !== null && this.projectValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.projectValue);
			return this.projectSubject;

		} else {
			return this.http.get<Project[]>(baseUrl)
				.pipe(map((modelCollection: Project[]) => {
						// publish updated collection to subscribers
						this.projectSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<Project>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<Project>(baseUrl, params)
			.pipe(map((model: Project) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<Project>(`${baseUrl}/${id}`, params)
			.pipe(map((model: Project) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<Project>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: Project) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<Project>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: Project) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<Project>(`${baseUrl}/${id}`)
			.pipe(map((model: Project) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: Project, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.projectValue !== null ) {
					const updatedObjs:Project[] = [];
					this.projectValue.map((x: Project) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.projectSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.projectValue !== null ) {

					const updatedObjs:Project[] = [];
					this.projectValue.map((x:Project) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.projectSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.projectValue !== null && deleteId !== undefined ) {

					const updatedObjs:Project[] = [];
					this.projectValue.map((x:Project) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.projectSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('projects');

	}

}
