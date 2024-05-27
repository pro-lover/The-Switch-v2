import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
//import { filter, map, takeUntil } from 'rxjs/operators';
@Injectable({
	providedIn: 'root',
})
export class WebWorkerService implements OnDestroy {
	destroy$ = new Subject();

	private worker!: Worker;

	constructor() {
		if (typeof Worker !== 'undefined') {

			this.worker = new Worker(new URL('./../../../shared/webworkers/creative.generation.worker.ts', import.meta.url));
			this.worker.onmessage = ({ data }) => {
				console.warn(`WebWokerService got message: ${data}`);
			};

		} else {
			console.error('Web Workers Not Supported.');
		}
	}

	async init(): Promise<void> {
		this.worker.postMessage('WebWokerService Instruction: init()');
	}

	public generateVariations( canvasRef:any, stageRef: any, copyVariationsArray:any[], variationsArray: any[] ): void {

		/** /
		const variationsArrayTrans = variationsArray.map(x=>{
			return x.value = new Uint8Array(x.value);
		});
		/**/

		this.worker.postMessage(
			{
				'action': 'variations-generate',
				'data': {
					//'banner': stageRef,
					'canvas': canvasRef,
					//'stage': stageRef,
					//'copyVariationsArray': [],
					'variationsArray': [],
					'copyVariationsArray': copyVariationsArray,
					//'variationsArray': variationsArray
				}
			},
			[canvasRef]
		);
	}

	public downloadAllVariations(variationCollectionForExport: any[]): void {

		this.worker.postMessage({
			'action': 'downloadAllVariations',
			'data': variationCollectionForExport,
		});
	}

	ngOnDestroy(): void {
		this.destroy$.complete();
		this.destroy$.unsubscribe();
		this.worker.terminate();
	}
}
