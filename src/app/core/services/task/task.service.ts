import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Task } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/tasks`;

@Injectable({ providedIn: 'root' })
export class TaskService {
	private taskSubject: BehaviorSubject<Task[]>;
	public task: Observable<Task[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.taskSubject = new BehaviorSubject<Task[]>([]);
		this.task = this.taskSubject.asObservable();
	}

	public get taskValue(): Task[] {
		return this.taskSubject.value;
	}

	public getAll() {
		if( this.taskValue !== null && this.taskValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.taskValue);
			return this.taskSubject;

		} else {
			return this.http.get<Task[]>(baseUrl)
				.pipe(map((modelCollection: Task[]) => {
						// publish updated collection to subscribers
						this.taskSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<Task>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<Task>(baseUrl, params)
			.pipe(map((model: Task) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<Task>(`${baseUrl}/${id}`, params)
			.pipe(map((model: Task) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<Task>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: Task) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<Task>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: Task) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<Task>(`${baseUrl}/${id}`)
			.pipe(map((model: Task) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: Task, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.taskValue !== null ) {
					const updatedObjs:Task[] = [];
					this.taskValue.map((x: Task) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.taskSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.taskValue !== null ) {

					const updatedObjs:Task[] = [];
					this.taskValue.map((x:Task) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.taskSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.taskValue !== null && deleteId !== undefined ) {

					const updatedObjs:Task[] = [];
					this.taskValue.map((x:Task) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.taskSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('tasks');

	}

}
