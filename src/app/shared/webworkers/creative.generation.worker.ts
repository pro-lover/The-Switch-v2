/// <reference lib="webworker" />

import * as saveAs from 'file-saver';
import * as JSZip from 'jszip';

const WorkerStages: any[] = [];
//let 	stage: any | undefined;

// Get Difference between two Arrays of Objects
function getDifference(array1: any, array2: any) {
	return array1.filter((object1: any) => {
		return !array2.some((object2: any) => {
			return object1.name === object2.name;
		});
	});
}

/**
 * Generate Variations for given Creative Size
 *
 * @param stage (Object)
 * @param copyVariationsArray (Array)
 * @param variationsArray (Array)
 *
 */
function generateVariations(canvasRef: any, stageRef: any, copyVariationsArray: any[], variationsArray: any[]) {

	const allVariations: any[] = [];

	copyVariationsArray.forEach((copy) => {
		// issue #141 - This is a temporary fix until it's properly resolved.
		if (copy.type === 'Text' && typeof copy.value === 'object') {
			variationsArray.forEach((background) => {
				allVariations.push([copy, background])
			});
		}
	});

	//let counter = 0;

	return;

	/** /
	allVariations.forEach((x:any) => {

		counter++;
		// pass active banner to canvas
		//const stage = new createjs.Stage(this.elementRef.nativeElement.querySelector('canvas#' + this.canvasName));
		const stage = new createjs.Stage( canvasRef );
		stage.set({
			name: stageRef.name + '-' + counter,
			//children: this.stages[0].children,
			//nextStage: this.stages[this.stages.length - 1]
		});

		stage.enableDOMEvents(false);
		stage.enableMouseOver(0);

		// find the children relevant to the current stage variation and update their values
		x.forEach((y:any) => {
			if( y.type === 'Text' ) {

				const keeyys = Object.keys(y.value);

				keeyys.forEach( (zKey:string) => {
					//child from original stage
					const updateThisText = stageRef.getChildByName(zKey.toLowerCase());
					if( updateThisText ) {
						const cloneText = updateThisText.clone();

						cloneText.text = y.value[zKey];
						//remove og child in new stage
						//stage.removeChild(stage.getChildByName(zKey.toLowerCase()));

						//add updated og child to new stage
						stage.addChild(cloneText);
						//set index for updated og child in new stage
						stage.setChildIndex( cloneText, stageRef.getChildIndex(updateThisText) );
					}
				});

			} else if( y.type === 'Image' ) {
				const stage_image_child = stageRef.getChildByName(y.name);
				if ( stage_image_child ) {
					const cloneImage = stage_image_child.clone();
					cloneImage.image = y.value;

					//remove og child in new stage
					//stage.removeChild(stage.getChildByName(y.name));

					//add updated og child to new stage
					stage.addChild(cloneImage);
					//set index for updated og child in new stage
					stage.setChildIndex( cloneImage, stageRef.getChildIndex(stage_image_child) );
				}
			}
		});

		// add "hard" or not smart components missing in the variation
		const missingcomponents = getDifference(stageRef.children, stage.children);

		missingcomponents.forEach((x:any) => {
			const missingComponent = stageRef.getChildByName(x.name);
			if ( missingComponent ) {
				const cloneComponent = missingComponent.clone();
				stage.addChild(cloneComponent);
				//set index for updated og child in new stage
				stage.setChildIndex( cloneComponent, stageRef.getChildIndex(missingComponent) );
			}
		});

		////console.log('missingcomponents'+this.canvasName + '-' + counter+':',missingcomponents);

		stage.update();

		WorkerStages.push(stage);
	});
	/**/
	/** /
	postMessage({
		'action': 'variations-generate',
		'data': WorkerStages
	});
	/**/

}

/**
 * Download All Variations for all Creatives
 *
 * @param variationCollectionForExport (Array)
 *
 */
function downloadVariations(variationCollectionForExport: any[]) {

	const zip = new JSZip();

	variationCollectionForExport.forEach((blob: any) => {
		zip.file(blob.name + '.png', blob.blobFile)
	}
	);

	zip.generateAsync({ type: "blob" })
		.then((blob) => {
			saveAs(blob, 'variations.zip')
		})

}

addEventListener('message', ({ data }) => {
	//const response = `CG worker response to: ${data}`;

	//console.log(`CreativeGenerationWorker:`, data);

	switch (data.action) {

		case 'variations-generate':

			generateVariations(data.data.canvas, data.data.stage, data.data.copyVariationsArray, data.data.variationsArray);

			break;

		case 'variations-download':

			downloadVariations(data.data.variationCollectionForExport);

			break;

		default:

			console.error('CreativeGenerationWorker Action Not Defined:', data.action);

			break;
	}

	//postMessage(response);
});
