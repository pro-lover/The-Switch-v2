import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaskType } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/tasktypes`;

@Injectable({ providedIn: 'root' })
export class TaskTypeService {
	private taskTypeSubject: BehaviorSubject<TaskType[]>;
	public taskType: Observable<TaskType[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.taskTypeSubject = new BehaviorSubject<TaskType[]>([]);
		this.taskType = this.taskTypeSubject.asObservable();
	}

	public get taskTypeValue(): TaskType[] {
		return this.taskTypeSubject.value;
	}

	public getAll() {
		if( this.taskTypeValue !== null && this.taskTypeValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.taskTypeValue);
			return this.taskTypeSubject;

		} else {
			return this.http.get<TaskType[]>(baseUrl)
				.pipe(map((modelCollection: TaskType[]) => {
						// publish updated collection to subscribers
						this.taskTypeSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<TaskType>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<TaskType>(baseUrl, params)
			.pipe(map((model: TaskType) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<TaskType>(`${baseUrl}/${id}`, params)
			.pipe(map((model: TaskType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<TaskType>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: TaskType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<TaskType>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: TaskType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<TaskType>(`${baseUrl}/${id}`)
			.pipe(map((model: TaskType) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: TaskType, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.taskTypeValue !== null ) {
					const updatedObjs:TaskType[] = [];
					this.taskTypeValue.map((x: TaskType) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.taskTypeSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.taskTypeValue !== null ) {

					const updatedObjs:TaskType[] = [];
					this.taskTypeValue.map((x:TaskType) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.taskTypeSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.taskTypeValue !== null && deleteId !== undefined ) {

					const updatedObjs:TaskType[] = [];
					this.taskTypeValue.map((x:TaskType) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.taskTypeSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('tasktypes');

	}

}
