import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventType } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


const baseUrl = `${environment.apiUrl}/eventtypes`;

@Injectable({ providedIn: 'root' })
export class EventTypeService {
	private eventTypeSubject: BehaviorSubject<EventType[]>;
	public eventType: Observable<EventType[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.eventTypeSubject = new BehaviorSubject<EventType[]>([]);
		this.eventType = this.eventTypeSubject.asObservable();
	}

	public get eventTypeValue(): EventType[] {
		return this.eventTypeSubject.value;
	}

	public getAll() {
		if( this.eventTypeValue !== null && this.eventTypeValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.eventTypeValue);
			return this.eventTypeSubject;

		} else {
			return this.http.get<EventType[]>(baseUrl)
				.pipe(map((modelCollection: EventType[]) => {
						// publish updated collection to subscribers
						this.eventTypeSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<EventType>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<EventType>(baseUrl, params)
			.pipe(map((model: EventType) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<EventType>(`${baseUrl}/${id}`, params)
			.pipe(map((model: EventType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<EventType>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: EventType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<EventType>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: EventType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<EventType>(`${baseUrl}/${id}`)
			.pipe(map((model: EventType) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: EventType, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.eventTypeValue !== null ) {
					const updatedObjs:EventType[] = [];
					this.eventTypeValue.map((x: EventType) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.eventTypeSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.eventTypeValue !== null ) {

					const updatedObjs:EventType[] = [];
					this.eventTypeValue.map((x:EventType) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.eventTypeSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.eventTypeValue !== null && deleteId !== undefined ) {

					const updatedObjs:EventType[] = [];
					this.eventTypeValue.map((x:EventType) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.eventTypeSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('eventtypes');

	}

}
