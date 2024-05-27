import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnimationType } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const baseUrl = `${environment.apiUrl}/animationtypes`;

@Injectable({ providedIn: 'root' })
export class AnimationTypeService {
	private animationTypeSubject: BehaviorSubject<AnimationType[]>;
	public animationType: Observable<AnimationType[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.animationTypeSubject = new BehaviorSubject<AnimationType[]>([]);
		this.animationType = this.animationTypeSubject.asObservable();
	}

	public get animationTypeValue(): AnimationType[] {
		return this.animationTypeSubject.value;
	}

	public getAll() {
		if( this.animationTypeValue !== null && this.animationTypeValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.animationTypeValue);
			return this.animationTypeSubject;

		} else {
			return this.http.get<AnimationType[]>(baseUrl)
				.pipe(map((modelCollection: AnimationType[]) => {
						// publish updated collection to subscribers
						this.animationTypeSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}
	}

	public getById(id: string) {
		return this.http.get<AnimationType>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<AnimationType>(baseUrl, params)
			.pipe(map((model: AnimationType) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<AnimationType>(`${baseUrl}/${id}`, params)
			.pipe(map((model: AnimationType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<AnimationType>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: AnimationType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<AnimationType>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: AnimationType) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<AnimationType>(`${baseUrl}/${id}`)
			.pipe(map((model: AnimationType) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: AnimationType, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.animationTypeValue !== null ) {
					const updatedObjs:AnimationType[] = [];
					this.animationTypeValue.map((x: AnimationType) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.animationTypeSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.animationTypeValue !== null ) {

					const updatedObjs:AnimationType[] = [];
					this.animationTypeValue.map((x:AnimationType) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.animationTypeSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.animationTypeValue !== null && deleteId !== undefined ) {

					const updatedObjs:AnimationType[] = [];
					this.animationTypeValue.map((x:AnimationType) => {
						if( parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.animationTypeSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('animationtypes');

	}
}
