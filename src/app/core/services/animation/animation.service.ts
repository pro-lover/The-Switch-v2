import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Animation } from '@app/core/models';
import { StateDataService } from '@app/core/services/state/state.data.service';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const baseUrl = `${environment.apiUrl}/animations`;

@Injectable({ providedIn: 'root' })
export class AnimationService {

	private animationSubject: BehaviorSubject<Animation[]>;
	public animation: Observable<Animation[]>;

	constructor(
		private http: HttpClient,
		private stateDataService: StateDataService
	) {
		this.animationSubject = new BehaviorSubject<Animation[]>([]);
		this.animation = this.animationSubject.asObservable();
	}

	public get animationValue(): Animation[] {
		return this.animationSubject.value;
	}

	public getAll() {
		if( this.animationValue !== null && this.animationValue.length > 0 ) {

			//console.warn('Collection initialised in service:', this.animationValue);
			return this.animationSubject;

		} else {
			return this.http.get<Animation[]>(baseUrl)
				.pipe(map((modelCollection: Animation[]) => {
						// publish updated collection to subscribers
						this.animationSubject.next(modelCollection);
						return modelCollection;
					})
				);
		}

	}

	public getById(id: string) {
		return this.http.get<Animation>(`${baseUrl}/${id}`);
	}

	public create(params: any) {
		return this.http.post<Animation>(baseUrl, params)
			.pipe(map((model: Animation) => {

				this.refreshCollection('create', model);

				return model;

			}));
	}

    public update(id:string, params: any) {
		return this.http.put<Animation>(`${baseUrl}/${id}`, params)
			.pipe(map((model: Animation) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateAnimationMeta(id:string, params: any) {
		return this.http.put<Animation>(`${baseUrl}/${id}/update-meta`, params)
			.pipe(map((model: Animation) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public updateStatus(id: string, params: any) {
		return this.http.put<Animation>(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((model: Animation) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public restore(id: string) {
		return this.http.put<Animation>(`${baseUrl}/${id}/restore`, {})
			.pipe(map((model: Animation) => {

				this.refreshCollection('update', model);

				return model;

			}));
	}

	public delete(id: string) {
		return this.http.delete<Animation>(`${baseUrl}/${id}`)
			.pipe(map((model: Animation) => {

				this.refreshCollection('delete', model, id);

				return model;

			}));
	}

    // helper methods
	private refreshCollection( type: string, model: Animation, deleteId?:string ) : void {

		switch (type)
		{
			case 'create':

				if( this.animationValue !== null ) {
					const updatedObjs:Animation[] = [];
					this.animationValue.map((x: Animation) => {
						updatedObjs.push(x);
					});
					updatedObjs.push(model);

					// publish updated collection to subscribers
					this.animationSubject.next(updatedObjs);
				}

				break;

			case 'update':

				if( this.animationValue !== null ) {

					const updatedObjs:Animation[] = [];
					this.animationValue.map((x:Animation) => {
						if( x.id === model.id ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});

					// publish updated collection to subscribers
					this.animationSubject.next(updatedObjs);

				}

				break;

			case 'delete':

				if( this.animationValue !== null && deleteId !== undefined ) {

					const updatedObjs:Animation[] = [];
					this.animationValue.map((x:Animation) => {
						if( x !== null && parseInt(x.id) === parseInt(deleteId) ) {
							updatedObjs.push(model);
						} else {
							updatedObjs.push(x);
						}
					});
					// publish updated collection to subscribers
					this.animationSubject.next(updatedObjs);

				}

				break;

		}

		// tell state data service to announce that model collection has been updated
		this.stateDataService.announceUpdate('animations');

	}
}
