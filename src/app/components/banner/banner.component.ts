import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { PageEvent } from '@angular/material/paginator';
import { Template } from '@app/core/models';
import { AlertService, BannerCreatorService, TemplateService, WebWorkerService } from '@app/core/services';
import * as createjs from 'createjs-module';
import { gsap } from "gsap";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx';

//const GIF = (window as any).GIF;

@Component({
    selector: 'app-banner',
	templateUrl: './banner.component.html',
	styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	// collection of Templates retrieved from the server.
	public Templates!: Template[];

	// MatPaginator Inputs
	public pageLength = 0;
	public pageSize = 1;
	public currentPage = 0;
	public pageSizeOptions: number[] = [1];
	public sortedData!: any[];

	// MatPaginator Output
	public pageEvent!: PageEvent;

	//
	public stages: any[] = [];
    public stage: any | undefined;
    private stageName!: string;
	private canvasName!: string;
	private stageCounter = 0;

	//private activeBanner: any = [];
	//private activeContainer: any = [];

	//NEW VARS
	@Input() dataTemplate: any;
	@Input() dataBanner: any;
	@Input() dataContainer: any;

	@Output() CreativeReadyEvent = new EventEmitter<any>();

	// VARS FOR VARIATIONS
	private variationsArray: any[] = [];
	private copyVariationsArray: any[] = [];
	public BannerVariations: any[] = [];
	@Input() populateVariations: any;
	@Input() downloadVariations: any;

	@Input() percentage!: number;

	public progressPercentage!: any
	public downloadAllVariations: any;

	// send variation data back to dashboard component
	@Output() variationCounter: EventEmitter<any> = new EventEmitter<any>();
	@Output() variationCollectionForDownloadEvent = new EventEmitter<any>();

	// Receive Rules from Dashboard.page.component to validate user uploads
	@Input() BannerComponentTemplateRules!: any;
	private ActiveBannerComponentTemplateRules!: any[];

	//animations
	private renderAnimationsActive = false;
	private containerTimeline: any;
	public animationProgressTicker = 0;
	public animationsRendered = false;
	public timelineIsPlaying = false;

	@Input() playAnimationStageReceived: any;
	@Input() playAnimationGlobalStageReceived: any;
	@Input() pauseAnimationStageReceived: any;
	@Input() loopAnimationStageReceived: any;

	@Output() FrameAnimationPlayEventStart = new EventEmitter<any>();
	@Output() FrameAnimationPlayEventEnd = new EventEmitter<any>();
	@Output() GlobalAnimationPlayEventEnd = new EventEmitter<any>();

	//
	@Input() newDropReceive: any;
	@Input() removeDrop: any;
	@Input() resetVariations: any;

	constructor(
		private alertService: AlertService,
		private elementRef: ElementRef,
		private _bottomSheet: MatBottomSheet,
		private templateService: TemplateService,
		private webWorkerService: WebWorkerService,
		private bannerCreatorService: BannerCreatorService
	) {

		this.templateService.template.pipe(takeUntil(this._destroy$)).subscribe((x:any) => {
			//console.log('TemplateService Subscription:', x);
			this.Templates = x;
		});
	}

	ngOnInit() {
		console.log('bannerComponent__ngOnInit ');
		// run default population functions

		//this.initialiseBanner();
		this.initialiseCreative();

		//dropping item
		this.newDropReceive.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			//console.warn( 'New File Received:', evt);

            if (!evt || !evt.data) return;

			if (this.stage.name === evt.stage && this.dataContainer.id === evt.containerId) {

				//console.warn( 'Container:', this.dataContainer.id);
				//console.warn( this.stage.name + ' New File Received:', evt);

				evt.data.uid = this.generateUUID();

				evt.data.forEach( (x:any)=>{
					x.id = this.generateUUID();

					this.populateVariationsArray( evt.type, evt.componentName, x );
					// dont update original template
					//this.updateStageContents( evt.type, evt.componentName, x );
				});

            }

		});

		this.removeDrop.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			if (!evt || !evt.stage || !evt.data) return;

			//if (this.stage.name === evt.stage) {
			if (this.stage.name === evt.stage && this.dataContainer.id === evt.containerId) {

				console.warn( this.stage.name + ' Remove Variation:', evt);

				switch (evt.type) {

					case 'Image':

						this.variationsArray = this.variationsArray.filter( (x:any)=> x.id !== evt.data[0].id );

						console.log('this.variationsArray:', this.variationsArray);

						break;

					case 'Copy':
					case 'Text':
					case 'Button':

						this.copyVariationsArray = [];

						console.log('this.copyVariationsArray:', this.copyVariationsArray);

						break;
				}

				console.log('this.variationsArray:', this.variationsArray);
				console.log('this.BannerVariations:', this.BannerVariations);
				console.log('this.copyVariationsArray:', this.copyVariationsArray);

				//this.variationsArray = [];
				//this.copyVariationsArray = [];
				//this.BannerVariations = [];

			}

		});

		//Listen to Request to generate variations
		this.populateVariations.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			if (!evt || !evt.bannersize.width || !evt.bannersize.height) return;

			if( this.stage.name === ('bannerCanvas-' + evt.bannersize.width + '-' + evt.bannersize.height) ) {

				console.warn( 'Banner Directive Populate Variations::', evt);
				console.warn( 'Banner Directive Populate Variations Container::', this.dataContainer.id);

				const allVariations = this.prepareVariationsarray();

				console.warn( 'Banner Directive Populate Variations::', allVariations);

				// Get Difference between two Arrays of Objects
				function getDifference(array1:any, array2:any) {
					return array1.filter((object1:any) => {
					  return !array2.some((object2:any) => {
						return object1.name === object2.name;
					  });
					});
				}

				let counter = 0;

				const allNewComponentSet:any[] = [];

				allVariations.forEach((variatation:any) => {

					counter++;
					// pass active banner to canvas
					console.warn( 'Variations1::', allVariations);
					const stage = new createjs.Stage(this.elementRef.nativeElement.querySelector('canvas#' + this.canvasName));
					stage.set({
						mastername: this.canvasName, // for HTML5
						name: this.canvasName + '-' + counter,
						//children: this.stages[0].children,
						//nextStage: this.stages[this.stages.length - 1]
					});

					stage.enableDOMEvents(false);
					stage.enableMouseOver(0);

					// eslint-disable-next-line prefer-const
					let stageVariationComponents = this.stages[0].components;

					// find the children relevant to the current stage variation and update their values
					variatation.forEach((y:any) => {
						console.warn( 'Variations2::', allVariations);
						if( y.type === 'Text' || y.type === 'Button' ) {

							const keeyys = Object.keys(y.value);

							keeyys.forEach( (zKey:string) => {
								//child from original stage
								const updateThisText = this.stage.getChildByName(zKey.toLowerCase());
								if( updateThisText ) {
									const cloneText = updateThisText.clone(true);

									//console.log('typeof updateThisText:',typeof updateThisText, updateThisText, updateThisText instanceof this.bannerCreatorService.BAPP_Button);
									//console.warn('typeof cloneText:',typeof cloneText, cloneText);

									//console.log('Cloning Text:', cloneText, updateThisText, typeof cloneText);
									/**/
									if(  updateThisText instanceof this.bannerCreatorService.BAPP_Button ) {

										cloneText.text = y.value[zKey];
										//Shape is always at a lower index for buttons
										const ButtonText = cloneText.getChildAt(1);

										ButtonText.text = y.value[zKey];
										console.log('Cloning Button Text:', cloneText);

									} else {

										cloneText.text = y.value[zKey];
									}
									//remove og child in new stage
									//stage.removeChild(stage.getChildByName(zKey.toLowerCase()));
									cloneText.id = parseInt(updateThisText.id);

									cloneText.set({componentId: parseInt(updateThisText.componentId)});
									cloneText.set({smart: updateThisText.smart});
									cloneText.set({componentMetaId: parseInt(updateThisText.componentMetaId)});

									//add updated og child to new stage
									stage.addChild(cloneText);
									//set index for updated og child in new stage
									stage.setChildIndex( cloneText, this.stage.getChildIndex(updateThisText) );
								}
							});

						} else if( y.type === 'Image' ) {
							console.warn( 'Variations3::', allVariations);
							const stage_image_child = this.stage.getChildByName(y.name);
							if ( stage_image_child ) {
								const cloneImage = stage_image_child.clone();
								cloneImage.image = y.value;

								//remove og child in new stage
								//stage.removeChild(stage.getChildByName(y.name));
								cloneImage.id = parseInt(stage_image_child.id);

								cloneImage.set({componentId: parseInt(stage_image_child.componentId)});
								cloneImage.set({smart: stage_image_child.smart});
								cloneImage.set({componentMetaId: parseInt(stage_image_child.componentMetaId)});

								//add updated og child to new stage
								stage.addChild(cloneImage);
								//set index for updated og child in new stage
								stage.setChildIndex( cloneImage, this.stage.getChildIndex(stage_image_child) );
							}
						}
					});

					// add "hard" or not smart components missing in the variation
					const missingcomponents = getDifference(this.stage.children, stage.children);
					console.warn( 'Variations4::', allVariations);
					missingcomponents.forEach((misscomp:any) => {
						const missingComponent = this.stage.getChildByName(misscomp.name);
						if ( missingComponent ) {
							const cloneComponent = missingComponent.clone();

							cloneComponent.id = parseInt(missingComponent.id);

							cloneComponent.set({componentId: parseInt(missingComponent.componentId)});
							cloneComponent.set({smart: missingComponent.smart});
							cloneComponent.set({componentMetaId: parseInt(missingComponent.componentMetaId)});

							stage.addChild(cloneComponent);
							//set index for updated og child in new stage
							stage.setChildIndex( cloneComponent, this.stage.getChildIndex(missingComponent) );
						}
					});

					console.log('missingcomponents'+this.canvasName + '-' + counter+':',missingcomponents);

					this.sortStageChildern(stage);
					//stage.update();

					// HTML5: update variation component data
					//stage.children.forEach( (child:any) => {

					/**/
					const componentUpdates:any[] = [];
					console.warn( 'Variations5::', allVariations);
					stageVariationComponents.forEach( (b:any, index:number, ogArray:any) => {

						if( b.smart === true ) {

							const child = stage.getChildByName(b.name.toLowerCase()) as any;

							if( b.id === child.componentId && b.name.toLowerCase() === child.name.toLowerCase() ) {
								//console.log('Text Component Found:', cloneText.text);
								b.componentmeta.forEach( (c:any, index2:number, ogMeta:any) => {
									//console.log('Text componentmeta:', c, updateThisText.componentMetaId);
									if( c.name === 'fontValue' && c.id === child.componentMetaId ) {

										if( c.value !== child.text ) {

											//c.value = child.text;
											componentUpdates.push({
												'counter': counter,
												'containerId': this.dataContainer.id,
												'componentIndex': index,
												'componentMetaIndex': index2,
												'componentId': b.id,
												'componentMetaId': c.id,
												'value': child.text
											});
										}

										/** /
										stageVariationComponents[index].componentmeta[index2].value = child.text;
										console.warn('NEW TEXT :', {
											'componentIndex': index,
											'componentMetaIndex': index2,
											'componentId': b.id,
											'componentMetaId': c.id,
											'value': c.value
										});
										/**/

									}
									if( c.name === 'path' && c.id === child.componentMetaId ) {
										//console.log('Image Component Found:', c);
										//c.variationImage = child.image;

										componentUpdates.push({
											'counter': counter,
											'containerId': this.dataContainer.id,
											'componentIndex': index,
											'componentMetaIndex': index2,
											'componentId': b.id,
											'componentMetaId': c.id,
											'value': child.image.src
										});
									}
								});

							}

						}
					});
					/**/

					//});

					//allNewComponentSet.push(stageVariationComponents);

					//this.stages.push(stage);
					console.warn( 'Variations6::', allVariations);
					this.stages.push({
						stage: stage,
						components: stageVariationComponents,
						componentUpdates: componentUpdates,
						timeline: this.stages[0].timeline,
						tweens: this.stages[0].tweens
					});

				});
				/**/

				if( this.renderAnimationsActive === true ) {

					this.stages.forEach( (stagevariation:any, index:number) => {
						if( index === 0 ) {} else {

							const animationPromises:any[] = [];
							stagevariation.components.forEach( (displayObject:any) => {
								if( displayObject.animations.length > 0 ) {
									animationPromises.push(this.animateGSAPComponent(stagevariation.stage, displayObject));
								}
							});

							Promise.all(animationPromises)
							.then((displayObjectsAnimations:any[]) => {

								//console.log('displayObjectsAnimations:', displayObjectsAnimations);

								stagevariation.tweens = displayObjectsAnimations;
								//this.stages[index].tweens = displayObjectsAnimations;

								this.buildGSAPAnimationTimeline( displayObjectsAnimations.flat() )
									.then((timeline:any) => {

										stagevariation.timeline = timeline;
										//this.stages[index].timeline = timeline;

										console.warn( 'this.stages:', this.stages );

										stagevariation.componentUpdates.forEach( (update:any) => {
											if( this.dataContainer.id === update.containerId && update.counter === index) {
												/** /
												console.warn(
													'update:',
													stagevariation.components[update.componentIndex].componentmeta[update.componentMetaIndex].value,
													' | ',
													update.value
												);
												/**/
												stagevariation.components[update.componentIndex].componentmeta[update.componentMetaIndex].value = update.value;
											}
										});

									});

							});

						}
					});

					this.intialisePagination();

					this.BannerVariations = allVariations;

					console.warn( 'this.stages:', this.stages );

				} else {

					this.intialisePagination();

					this.BannerVariations = allVariations;

					console.warn( 'this.stages:', this.stages );
				}
				/**/

				console.warn( 'allNewComponentSet:', allNewComponentSet );

				console.warn( 'allVariations:', allVariations, this.stages );
				console.warn( 'copyVariationsArray:', this.copyVariationsArray );
				console.warn( 'variationsArray:', this.variationsArray );
				console.warn( 'allVariations:', allVariations );

				/** WIP * /
				const offscreenCanvas: any = document.createElement('canvas');
				offscreenCanvas.setAttribute( "width", evt.bannersize.width.toString() );
				offscreenCanvas.setAttribute( "height", evt.bannersize.height.toString() );
				const offscreen = offscreenCanvas.transferControlToOffscreen();

				this.webWorkerService.generateVariations(
					offscreen,
					this.stage,
					//this.activeBanner[0],
					this.copyVariationsArray,
					this.variationsArray
				);
				/**/

			}
			console.warn( 'Variations7 i think problem is here::');
		});

		//Listen to Request to export variations
		this.downloadVariations.pipe(takeUntil(this._destroy$)).subscribe(async (evt:any) => {

			if (!evt || !evt.bannersize.width || !evt.bannersize.height) return;

			console.warn( 'Export Variations Event Received::', evt,);
			console.warn( 'Stage Name::',  this.stage.name);
			console.warn( 'Container ID::',  this.dataContainer.id);

			// RESET STAGE TO FIRST ONE
			this.stage = this.stages[0].stage;

			if( this.stage.name === ('bannerCanvas-' + evt.bannersize.width + '-' + evt.bannersize.height) ) {

				console.warn( 'Export Variations Stages::',  this.stage.name, this.stages.length, evt);

				console.warn( 'Export Variations Event Received::', evt,);
				console.warn( 'Stage Name::',  this.stage.name, this.stages.length);
				console.warn( 'Container ID::',  this.dataContainer.id);

				const variationsForExport = [];

				// progress indicator for banner
				let counter = 0;
				const totalCount = this.stages.length

				for (let index = 0; index < this.stages.length; index++) {

					const currentStage = this.stages[index].stage;
					const currentStageComponents = this.stages[index].components;
					//this.stage = currentStage;
					currentStage.update();

					counter++;

					this.percentage = (counter/totalCount *100)
					 console.log(this.percentage);

					variationsForExport.push({
						uid: this.generateUUID(),
						name: currentStage.name,
						bannerId: this.dataBanner.id,
						containerId: this.dataContainer.id,
						bannersizeId: this.dataBanner.bannersizeId,
						blobFile: await (await fetch(currentStage.toDataURL())).blob(),
						image: currentStage.toDataURL(),
						bannerComponent: evt,
						stageChildren: currentStage.children,
						stageComponents: currentStageComponents,
						stageUpdateComponents: this.stages[index]?.componentUpdates
					});

					// emit counter after blobFile is created
					this.variationCounter.emit({
						bannersizeId: this.dataBanner.bannersizeId,
						value: this.percentage
					});

				}

				console.warn( 'EMIT Export Variations::', variationsForExport);

				this.variationCollectionForDownloadEvent.emit({
					bannerComponent: evt,
					bannerId: this.dataBanner.id,
					containerId: this.dataContainer.id,
					bannersizeId: this.dataBanner.bannersizeId,
					data: variationsForExport,
				});

			}

		});

		this.resetVariations.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			console.warn( 'New File Received:', evt);

			if (!evt || !evt.stage) return;

			//if (this.stage.name === evt.stage) {
			if (this.stage.name === evt.stage && this.dataContainer.id === evt.containerId) {

				console.warn( this.stage.name + ' Reset Variations:', evt);

				this.variationsArray = [];
				this.copyVariationsArray = [];
				this.BannerVariations = [];

			}

		});

		//animations
		// play animation request for active frame/container
		this.playAnimationStageReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			console.log('Playing animation for stage:', this.stage, evt );

			if(
				this.stage &&
				evt.state === true &&
				evt.container.id === this.dataContainer.id &&
				(
					this.stage.name === ('bannerCanvas-' + evt.banner.bannersize.width + '-' + evt.banner.bannersize.height) ||
					this.stage.mastername === ('bannerCanvas-' + evt.banner.bannersize.width + '-' + evt.banner.bannersize.height)
				)
			) {

				if( this.stage.mastername !== undefined ) {

					//console.log('Playing variation for stage:', this.currentPage );
					//console.log('Playing variation for container:', evt.container.id );

					this.containerTimeline = this.stages[this.currentPage].timeline;

					this.playGSAPFrameAnimation(this.containerTimeline);

				} else {

					//console.log('Playing animation for stage:', this.stage.name );
					//console.log('Playing animation for container:', evt.container.id );
					//console.log('timeline:', this.containerTimeline );

					//this.playGSAPFrameAnimation(this.stages[this.currentPage].timeline);
					this.playGSAPFrameAnimation(this.containerTimeline);

				}

				this.timelineIsPlaying = true;

			} else if(
				this.stage &&
				evt.state === false &&
				evt.container.id === this.dataContainer.id &&
				this.stage.name === ('bannerCanvas-' + evt.banner.bannersize.width + '-' + evt.banner.bannersize.height)
			) {

				//this.stages[0].timeline.pause();
				this.containerTimeline.pause();
				//this.stages[this.currentPage].timeline.pause();

				this.timelineIsPlaying = false;
			}
		});

		console.warn( 'Variations8::');
		this.renderAnimationsActive = (['HTML5'].includes(this.dataBanner.bannertype.name) === true ? true : false);

	}

	ngOnDestroy(): void {
		console.warn('Banner Component ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
		//this._destroy$.complete();
		//this._destroy$.unsubscribe();
	}

	/* ------------------------------------------
	 * START: NEW BUILD FUNCTIONS
	 -------------------------------------------*/
	private initialiseCreative():void {

		this._createCanvas()
			.then((newcanvas:HTMLCanvasElement) => {
				return this._setupStage(newcanvas);
			})
			.then((newStage:createjs.Stage) => {

				//this.BannerComponents = this.dataContainer.components;

				return this._populate( newStage, this.dataContainer.components );
			})
			.then((stageComponentObj:any) => {

				this.stage = stageComponentObj.stage;

				this.stages.push({
					stage: stageComponentObj.stage,
					components: stageComponentObj.components,
					timeline: stageComponentObj.timeline,
					tweens: stageComponentObj.tweens
				});

				if( this.renderAnimationsActive === true ) {
					return stageComponentObj;
				} else {
					return stageComponentObj;
				}

			})
			.then((stageComponentObj:any) => {

				console.warn('InitialiseCreative complete:', stageComponentObj);

				this.intialisePagination();
				this.stage.update();

				console.log('this.stages', this.stages);

				//this.setupStageEventListeners( this.stage );

				if( this.renderAnimationsActive === true ) {

					this.initialiseGSAPAnimations( this.stage, stageComponentObj.tweens.flat() );

				} else {

					this.CreativeReadyEvent.emit({
						state: true,
						containerId: this.dataContainer.id
					});
				}
			});
	}

	private _createCanvas(): Promise<HTMLCanvasElement> {

		//console.log('createCanvas', this.dataBanner);

		return new Promise<HTMLCanvasElement>((resolve, reject) => {

			const canvas = document.createElement("canvas");
			this.canvasName = "bannerCanvas-" + this.dataBanner.bannersize.width + '-' + this.dataBanner.bannersize.height; //+ '-' + this.dataContainer.id;

			canvas.setAttribute( "id", this.canvasName);
			canvas.setAttribute( "class", 'canvas-banner');
			canvas.setAttribute( "data-container-id", this.dataContainer.id);
			canvas.setAttribute( "width", this.dataBanner.bannersize.width.toString() );
			canvas.setAttribute( "height", this.dataBanner.bannersize.height.toString() );

			this.elementRef.nativeElement.querySelector('.banner-holder').prepend(canvas);

			resolve(canvas);

		});

    }

	private _setupStage( canvas: HTMLCanvasElement ): Promise<createjs.Stage> {

		// Add tick method.
		//createjs.Ticker.addEventListener("tick", (evt)=> {
		//	this.tick(evt);
		//}, false);

		return new Promise<createjs.Stage>((resolve, reject) => {

			this.stageCounter++;

			const stage = new createjs.Stage(canvas);
			//const stage = new createjs.Stage(this.elementRef.nativeElement.querySelector('canvas#' + this.canvasName));

			stage.name = this.canvasName;

			// Enable touch interactions if supported on the current device:
			createjs.Touch.enable(stage);
			// Enabled mouse over / out events
			stage.enableMouseOver(10);
			// keep tracking the mouse even when it leaves the canvas
			stage.mouseMoveOutside = false;

			createjs.Ticker.setFPS(60);
			createjs.Ticker.paused = false;

			//this.stages.push(stage);

			//this.stage.addEventListener("added", (evt:any)=> {
			//	console.log('display object added:', evt);
			//});

			resolve(stage);

		});
	}

	private _populate ( stage:createjs.Stage, components:any[] ): Promise<any> {

		return new Promise<any>((resolve, reject) => {

			const Componentpromises = [];

			components.forEach((component:any) => {

				//console.log('component', component);

				switch (component.componenttype.name) {

					case 'Shape':

						Componentpromises.push(this._populateShape(stage, component));

						//this.populateShape(stage, component);

						break;

					case 'Image':

						//this.populateImage(stage, component);

						Componentpromises.push(this._populateImage(stage, component));

						break;

					case 'Text':

						Componentpromises.push(this._populateText(stage, component));

						//this.populateText(stage, component);
						break;

					case 'Button':

						Componentpromises.push(this._populateButton(stage, component));

						break;

				}

				//this.BannerComponents.push(component);
			});

			Componentpromises.push(this._populateBannerBorder(stage));

			Promise.all(Componentpromises)
				.then((displayObjects:any[]) => {

					if( this.renderAnimationsActive === true ) {

						const animationPromises:any[] = [];

						displayObjects.forEach( (displayObject:any) => {
							if( displayObject.component?.animations.length > 0 ) {
								animationPromises.push(this.animateGSAPComponent(stage, displayObject.component));
							}
						});

						//console.log('animationPromises');

						return Promise.all(animationPromises);

					} else {
						return [false];
					}

				})
				.then((displayObjectsAnimations:any[]) => {

					if( this.renderAnimationsActive === true ) {

						this.sortStageChildern( stage );

						resolve({
							stage: stage,
							components: components,
							timeline: null,
							tweens: displayObjectsAnimations
							//timeline: GSAPanimationTimeline
						});

					} else {

						//console.log('NOT initialiseGSAPAnimations');

						this.sortStageChildern( stage );

						resolve({
							stage: stage,
							timeline: null,
							tweens: null,
							components: components
						});
					}
				});

		});

	}

	private _populateShape( stage:createjs.Stage, component: any): Promise<any> {

		return new Promise<any>((resolve, reject) => {

			//console.warn('populateShape:', component);

			const componentMeta = component.componentmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {});
			const componentShape = new this.bannerCreatorService.BAPP_Shape( component );

			stage.addChild(componentShape);
			stage.setChildIndex( componentShape, parseInt(componentMeta.zIndex) );

			stage.update();

			//componentShape.interact(stage);

			resolve({
				'component': component,
				'displayobject': componentShape
			});

		});

	}

	private _populateImage( stage:createjs.Stage, component: any): Promise<any> {

		//console.warn('populateImage:', component);

		return new Promise<any>((resolve, reject) => {

			const componentMeta = component.componentmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {});
			const componentImage = new this.bannerCreatorService.BAPP_Image( stage, component, componentMeta );

			stage.addChild(componentImage);
			stage.setChildIndex( componentImage, parseInt(componentMeta.zIndex) );

			stage.update();

			//componentImage.interact(stage);

			resolve({
				'component': component,
				'displayobject': componentImage
			});


		});
	}

	private _populateText( stage:createjs.Stage, component: any): Promise<any> {

		//console.warn('populateText:', component);

		return new Promise<any>((resolve, reject) => {

			const componentMeta = component.componentmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {});
			const canvasText = new this.bannerCreatorService.BAPP_Text( component, componentMeta );

			stage.addChild(canvasText);
			stage.setChildIndex( canvasText, parseInt(componentMeta.zIndex) );

			stage.update();

			//canvasText.interact(stage);

			resolve({
				'component': component,
				'displayobject': canvasText
			});

		});
	}

	private _populateButton( stage:createjs.Stage, component: any): Promise<any> {

		return new Promise<any>((resolve, reject) => {

			const componentMeta = component.componentmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {});
			const canvasButton = new this.bannerCreatorService.BAPP_Button( component );

			stage.addChild(canvasButton);
			stage.setChildIndex( canvasButton, parseInt(componentMeta.zIndex) );

			stage.update();

			//canvasButton.interact(stage);

			resolve({
				'component': component,
				'displayobject': canvasButton
			});

			//console.warn('populateButton:', canvasButton);

		});

	}

	private _populateBannerBorder( stage:createjs.Stage ): Promise<createjs.DisplayObject> {

		return new Promise<createjs.DisplayObject>((resolve, reject) => {

			const width_border = this.dataBanner.bannersize.width;
			const height_border = this.dataBanner.bannersize.height;
			const position_x_border = 0;
			const position_y_border = 0;
			const bgColour = '#222222';//colour_border ? colour_border : '#' + this.randomColor();
			const z_index_border = "99";//component.componentmeta.find((x:any) => x.name === 'zIndex').value;

			const border_obj = new createjs.Graphics()
											.setStrokeStyle(1)
											.beginStroke(bgColour)
											.drawRect(0, 0, width_border, height_border);

			const component_border = new createjs.Shape(border_obj);
			component_border.name = 'canvas_border'//component.name.toLowerCase();
			component_border.x = position_x_border;
			component_border.y = position_y_border;
			component_border.id = parseInt(z_index_border);

			stage.addChild(component_border);
			stage.setChildIndex( component_border, parseInt(z_index_border) );

			stage.update();

			resolve(component_border);

		});

	}

	private emptyActiveStage( stage:createjs.Stage ):void {
		stage.removeAllEventListeners();
		stage.removeAllChildren();
	}

	private prepareVariationsarray(): any[] {

		console.log('prepareVariationsarray');

		const variationsHolder:any[] = [];

		console.log(this.copyVariationsArray.length +" > 0 && "+this.variationsArray.length);

		if( this.copyVariationsArray.length > 0 && this.variationsArray.length > 0 ) {
			console.log("in if copy n1");
			this.copyVariationsArray.forEach( (copy) =>{
				// issue #141 - This is a temporary fix until it's properly resolved.
				if( (copy.type === 'Text' && typeof copy.value === 'object') || (copy.type === 'Button' && typeof copy.value === 'object') ) {
					this.variationsArray.forEach( (background) => {
						variationsHolder.push([copy, background])
					});
				}
			});

		} else if (this.variationsArray.length > 0) {
			console.log("in if image");
			this.variationsArray.forEach( (image) => {
				variationsHolder.push([image])
			});

		} else if (this.copyVariationsArray.length > 0) {
			console.log("in if copy");
			this.copyVariationsArray.forEach( (copy) =>{
				if( (copy.type === 'Text' && typeof copy.value === 'object') || copy.type === 'Button' && typeof copy.value === 'object' ) {
					variationsHolder.push([copy])
				}
			});

		}
		console.log("variationsHolder ",variationsHolder);
		return variationsHolder;

	}

	/**
	 * Validate Received user file against ActiveBannerComponentTemplateRules
	 *
	 * @param componentData (Object)
	 *
	 */
	private doesReceivedFilePassComponentRules( type:string, componentName: string, componentData:any ) : any {

		let validationResult = {
			error: true,
			result: false,
			message: ''
		}
		let rulecheck = this.BannerComponentTemplateRules.find((x:any) => x.bannersizeId === this.dataBanner.bannersizeId).templaterules;
		// get rules for specific container
		rulecheck = rulecheck.filter((x:any) => x.containerId === this.dataContainer.id);
		switch (type) {
			case 'Text':
			case 'Button':

				console.log('rulecheck:', rulecheck, componentData);

				const ruleHeadings:any = [];
				const spreadsheetHeadings = Object.keys(componentData[0]).map((x:any) => x.toLowerCase());

				rulecheck.forEach((rule:any) => {
					if( rule.type === 'Text' || rule.type === 'Button' ) {
						ruleHeadings.push(rule.name);
					}
				});

				// https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript
				const difference = spreadsheetHeadings.filter((x:any) => !ruleHeadings.includes(x));

				//console.log('rulesHeadings:', ruleHeadings);
				//console.log('spreadsheetHeadings:', spreadsheetHeadings);
				//console.warn('DifferenceColumns:', difference );

				if( difference.length > 0 ) {

					validationResult = {
						error: true,
						result: false,
						message: 'The following columns are not valid for the\nselected component: ' + difference.join(', ')
					}

				} else {

					// validate column lengths.
					//validationResult = false;

					loop1:
					for (let index = 0; index < componentData.length; index++) {

						// https://bobbyhadz.com/blog/javascript-lowercase-object-keys
						function toLowerKeys(obj:any) {
							return Object.keys(obj).reduce((accumulator:any, key:string) => {
							  accumulator[key.toLowerCase()] = obj[key];
							  return accumulator;
							}, {});
						}

						const row = toLowerKeys(componentData[index]);

						loop2:
						for (let index2 = 0; index2 < ruleHeadings.length; index2++) {
							const ruleHeading = ruleHeadings[index2];

							const rule = rulecheck.find((x:any) => x.name === ruleHeading).rules[0].maximumcharacters;

							if( row[ruleHeading] ) {
								if( row[ruleHeading].length > rule ) {

									validationResult = {
										error: true,
										result: false,
										message: `ROW: ${(index+1)}\nCOLUMN: ${ruleHeading}\nCOPY: ${row[ruleHeading]}\nISSUE: ${(row[ruleHeading].length - rule)} characters too long.`,
									}

									//console.error('doesReceivedFilePassComponentRules:', 'Copy to long', row[ruleHeading], row[ruleHeading].length, rule);

									break loop1;

								} else {
									validationResult = {
										error: false,
										result: true,
										message: `${componentName.toUpperCase()} added successfully.`
									}
								}
							} else {
								//console.error('doesReceivedFilePassComponentRules:', 'Case Sensitivity', row[ruleHeading], ruleHeading);

								validationResult = {
									error: true,
									result: false,
									message: `ROW: ${(index+1)}\nCOLUMN: ${ruleHeading}\nCOPY: ${row[ruleHeading]}\nISSUE: Not valid for the selected component.`,
									//message: `ROW  ${index} (${row[ruleHeading]}): is not valid for the selected component.`
								}
							}
						}

					}
				}

				break;

			case 'Image':

				rulecheck = rulecheck.find((x:any) => x.name === componentName);

				//console.log('componentData', componentData)

				// check image dimensions
				for (let index = 0; index < rulecheck.rules.length; index++) {
					const rule = rulecheck.rules[index];
					if( parseInt(rule.width) === componentData.width && parseInt(rule.height) === componentData.height ) {
						validationResult = {
							error: false,
							result: true,
							message: `${componentName.toUpperCase()} added successfully.`
						}

					} else if( parseInt(rule.width) < componentData.width && parseInt(rule.height) < componentData.height ) {

						const ruleRatio = (parseInt(rule.width) / parseInt(rule.height)).toFixed(1);
						const componentDataRatio = (parseInt(componentData.width) / parseInt(componentData.height)).toFixed(1);

						console.log('ruleRatio:', ruleRatio);
						console.log('componentDataRatio:', componentDataRatio);

						if( ruleRatio === componentDataRatio ) {

							validationResult = {
								error: false,
								result: true,
								message: `${componentName.toUpperCase()} added successfully.`
							}

						} else {
							validationResult = {
								error: true,
								result: false,
								message: `Image Dimensions does not match the\nRequired Ratio with the following dimensions: Width: ${rule.width}px\nHeight: ${rule.height}px.`
							}
						}

					} else {

						validationResult = {
							error: true,
							result: false,
							message: `Component dimensions are not valid for the selected component.\nRequired Dimensions: Width: ${rule.width}px\nHeight: ${rule.height}px.`
						}
						//console.error('doesReceivedFilePassComponentRules:', componentData.width, componentData.height, rule);
						break;
					}
				}

				break;

			case 'Shape':

				validationResult = {
					error: false,
					result: true,
					message: `${componentName.toUpperCase()} added successfully.`
				}

				break;

			default:
				break;
		}

		/** /
		if( validationResult.result === false ) {
			this.openBottomSheet();
		}
		/**/

		return validationResult;
	}

	/**
	 * Update Existing Banner Componenets
	 *
	 */
	private populateVariationsArray( type:string, componentName: string, data:any) {
		console.log('populateVariationsArray	',type);

		switch (type) {

            case 'Text':
			case 'Button':

                //this.stage.removeChild(this.stage.getChildByName('copy'));
				//this.stage.update();

				const FR1 = new FileReader();
				FR1.readAsArrayBuffer(data);
				FR1.addEventListener("load", (excelsheetLoadEvt: any) => {

					const bufferArray = excelsheetLoadEvt.target.result;
					const wb: XLSX.WorkBook = XLSX.read(bufferArray, { type: 'buffer' });
					const wsname: string = wb.SheetNames[0];
					const ws: XLSX.WorkSheet = wb.Sheets[wsname];

					const datax: any = XLSX.utils.sheet_to_json(ws);

					// validate data before continuing:
					const validationPassed = this.doesReceivedFilePassComponentRules(type, componentName, datax);

					if( validationPassed.result === true ) {

						//const copy_variations:any[] = [];

						const options:any = {};
						datax.forEach(function (item:any)
							{
							for (const prop in item)
								{
									if (options[prop])
									{
										options[prop].push(item[prop]);
									} else
									{
										options[prop] = [item[prop]];
									}
								}
							}
						);

						console.log('getCartesianProduct options:', options);

						const c:any = this.getCartesianProduct(options);

						console.warn('getCartesianProduct:', c);

						// https://stackoverflow.com/questions/2218999/how-to-remove-all-duplicates-from-an-array-of-objects
						const uniqueArray = c.filter((value:any, index:number) => {
							const _value = JSON.stringify(value);
							return index === c.findIndex((obj:any) => {
								return JSON.stringify(obj) === _value;
							});
						});

						uniqueArray.forEach((x:any) => {
							this.copyVariationsArray.push({
								id: this.generateUUID(),
								type: type,
								name: componentName,
								value: x
							});
							console.log('cvArr')
							console.log(this.copyVariationsArray)
						});

						this.alertService.success(validationPassed.message, { keepAfterRouteChange: true });

					} else {

						console.error('populateVariationsArray validationPassed:', validationPassed);

						this.alertService.error(validationPassed.message, { keepAfterRouteChange: true });

						this.openBottomSheet();

					}

				});

                break;

			case 'Image':

				const FR3 = new FileReader();
				FR3.addEventListener("load", (imageLoadEvt: any) => {
					const img = new Image();
					img.addEventListener("load", (imgLoadedEvent) => {

						// validate data before continuing:
						const validationPassed = this.doesReceivedFilePassComponentRules(type, componentName, img);

						if( validationPassed.result === true ) {

							this.variationsArray.push({
								id: data.id,
								type: type,
								name: componentName,
								value: img,
							});

							this.alertService.success(validationPassed.message, { keepAfterRouteChange: true });

						} else {

							console.error('populateVariationsArray validationPassed:', validationPassed);

							this.alertService.error(validationPassed.message, { keepAfterRouteChange: true });

						}

						//console.warn( 'this.imageVariations:', this.imageVariations);

					});
					img.src = imageLoadEvt.target.result;

				});

				FR3.readAsDataURL(data);

				break;

			case 'Shape':

				// validate data before continuing:
				const validationPassed = this.doesReceivedFilePassComponentRules(type, componentName, data);

				if( validationPassed.result === true ) {

					this.variationsArray.push({
						id: this.generateUUID(),
						type: type,
						name: componentName,
						value: data
					});

					this.alertService.success(validationPassed.message, { keepAfterRouteChange: true });

				} else {

					this.alertService.error(validationPassed.message, { keepAfterRouteChange: true });

				}

				break;

            default:
                break;
		}
	}

	/* ------------------------------------------
	 * ANIMATIONS
	 -------------------------------------------*/
	private playGSAPFrameAnimation( activeTimeline:GSAPTimeline ) {

		if( this.stage.hasEventListener('tick') ) {} else {
			createjs.Ticker.addEventListener("tick", this.stage);
			this.stage.update();
		}

		const onCompletion = (evt:any) => {
			console.warn('Frame Complete:', evt);
			this.timelineIsPlaying = false;
			this.FrameAnimationPlayEventEnd.emit(this.dataContainer.id);
		}

		activeTimeline.eventCallback("onComplete", onCompletion, ["param1","param2"]);

		if( activeTimeline['_time'] === activeTimeline.totalDuration() ) {
			activeTimeline.play(0);
		} else {
			activeTimeline.play();
		}

	}

	private animateGSAPComponent( stage:createjs.Stage, component: any): Promise<any[]> {

		return new Promise<any[]>((resolve, reject) => {

			const displayObj = stage.getChildByName(component.name.toLowerCase());

			//const instanceTimeline = gsap.timeline();
			const tweens:any[] = [];

			component.animations.forEach((animation:any, index:number) => {

				const animationmeta = animation.animationmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {});

				if( animationmeta.duration === 0 || animation.animationtype.name === 'Start' ) {

					const setValues = gsap.set(
						displayObj,
						{
							x: parseInt(animationmeta.positionX),
							y: parseInt(animationmeta.positionY),
							alpha: parseInt(animationmeta.opacity),
							ease: "power3.out",
							paused:false
						},
					);

					tweens.push({
						position: animationmeta.startTime,
						tween: setValues
					});

					//instanceTimeline.add(setValues, animationmeta.startTime);

				} else {

					const tween = gsap.to(
						displayObj,
						{
							duration: animationmeta.duration,
							x: parseInt(animationmeta.positionX),
							y: parseInt(animationmeta.positionY),
							alpha: parseInt(animationmeta.opacity),
							paused:false
						}
					);

					//tween.pause();

					tweens.push({
						position: animationmeta.startTime,
						tween: tween
					});

					//instanceTimeline.add(tween, animationmeta.startTime);

				}

			});

			resolve(tweens);

		});
	}

	private buildGSAPAnimationTimeline( tweens:GSAPTimeline[] ): Promise<GSAPTimeline> {

		return new Promise<GSAPTimeline>((resolve, reject) => {

			//gsap.globalTimeline.pause();

			const masterTimeline = gsap.timeline({ paused:false });

			tweens.forEach((tween:GSAPTimeline) => {
				masterTimeline.add(tween['tween'], tween['position']);
			});

			resolve(masterTimeline);

		});

	}

	private initialiseGSAPAnimations( stage:createjs.Stage, tweens:any[] ) {
		//console.log('initialiseGSAPAnimations:', tweens);

		//return this.buildGSAPAnimationTimeline(tweens.flat());

		this.buildGSAPAnimationTimeline( tweens )
			.then((timeline:any) => {

				//console.warn('Master Timeline Ready:', timeline);

				this.stages[0].timeline  = timeline;

				this.containerTimeline = timeline;

				this.animationsRendered = true;

				this.animationProgressTicker = 100;

				stage.update();
				this.stage.update();

				this.CreativeReadyEvent.emit({
					state: true,
					containerId: this.dataContainer.id
				});

			});
	}

	/*
	 * Stage Pagination
	 *
	 */
	public setPageSizeOptions(setPageSizeOptionsInput: string) {
		if (setPageSizeOptionsInput) {
			this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
		}
	}

	public handlePage(e: any) {

		//if( e.pageIndex ) {
		//	return
		//}

		/** /
		console.log('Paginating:', e, {
			'previousStage': this.stages[e.previousPageIndex],
			'currentStage': this.stages[e.pageIndex]
		});
		/**/

		this.currentPage = e.pageIndex;
		this.pageSize = e.pageSize;
		this.iterator();

		this.stage = this.stages[e.pageIndex].stage;
		this.stage.sortChildren(this.sortStageChildren);

		if( this.renderAnimationsActive === true && this.stages[e.pageIndex].timeline !== undefined ) {
			this.stage.update();
			this.containerTimeline = this.stages[e.pageIndex].timeline;
			this.playGSAPFrameAnimation(this.stages[e.pageIndex].timeline);
			this.timelineIsPlaying = true;
			this.FrameAnimationPlayEventStart.emit(this.dataContainer.id);
		}

		this.stage.update();
	}

	private iterator() {
		const end = (this.currentPage + 1) * this.pageSize;
		const start = this.currentPage * this.pageSize;
		const part = this.stages.slice(start, end);
		this.sortedData = part;
	}

	private intialisePagination() {
		this.sortedData = this.stages.slice();
		this.pageLength = this.sortedData.length;
		this.iterator();
	}
	/**/

	/*
	 * Helper functions
	 *
	 */
	private openBottomSheet(): void {
		this._bottomSheet.open(
			BottomSheetBannerTemplateRulesComponent,
			{
				data: this.downloadTemplateRulesCopyExample()
			}
		);
	}

	public downloadTemplateRulesCopyExample(): void {

		let rules = this.BannerComponentTemplateRules.find((x:any) => x.bannersizeId === this.dataBanner.bannersizeId).templaterules;
		// get rules for specific container
		rules = rules.filter((x:any) => x.containerId === this.dataContainer.id);
		return rules;

	}

	private sortStageChildern( stage:any ) {

		const sortFunction = function(obj1:any, obj2:any, options:any) {
			if (obj1.id > obj2.id) { return 1; }
			if (obj1.id < obj2.id) { return -1; }
			return 0;
		}

		stage.sortChildren(sortFunction);
		stage.update();
	}

	private sortStageChildren (obj1:any, obj2:any, options:any) {
		if (obj1.id > obj2.id) { return 1; }
		if (obj1.id < obj2.id) { return -1; }
		return 0;
	}

	private getCartesianProduct(a:any) {

		const cartesian:any = (objXarr:any) => {
				const 	names 		= Object.keys( objXarr ),
						len   		= names.length -1,
						resp:any  	= [];

				buildIn( {}, 0)

				return resp;

				function buildIn(obj:any, indx:any) {
					const key = names[indx];
					for (const val of objXarr[ key ] )
					{
						const oo = {...obj,[key]:val}
						if (indx < len )  buildIn(oo, indx +1)
						else resp.push( oo )
					}
				}
		}

		const c:any = cartesian(a);
		return c;

	}

	private randomColor () {
		return Math.floor(Math.random()*16777215).toString(16);
	}

	private generateUUID() { // Public Domain/MIT
		let d = new Date().getTime();//Timestamp
		let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			let r = Math.random() * 16;//random number between 0 and 16
			if(d > 0){//Use timestamp until depleted
				r = (d + r)%16 | 0;
				d = Math.floor(d/16);
			} else {//Use microseconds since page-load if supported
				r = (d2 + r)%16 | 0;
				d2 = Math.floor(d2/16);
			}
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	}

	//https://stackoverflow.com/questions/44698967/requesting-blob-images-and-transforming-to-base64-with-fetch-api
	private urlContentToDataUri(url:string): Promise<string | ArrayBuffer | null>{
		return  fetch(url)
				.then( response => response.blob() )
				.then( blob => new Promise( callback =>{
					const reader = new FileReader() ;
					reader.onload = function(){ callback(this.result) } ;
					reader.readAsDataURL(blob) ;
				}) ) ;
	}

	// https://stackoverflow.com/questions/12168909/blob-from-dataurl
	private dataURItoBlob(dataURI:string): Blob {
		// convert base64 to raw binary data held in a string
		// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
		const byteString = atob(dataURI.split(',')[1]);

		// separate out the mime component
		const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

		// write the bytes of the string to an ArrayBuffer
		const ab = new ArrayBuffer(byteString.length);

		// create a view into the buffer
		const ia = new Uint8Array(ab);

		// set the bytes of the buffer to the correct values
		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		// write the ArrayBuffer to a blob, and you're done
		const blob = new Blob([ab], {type: mimeString});
		return blob;

	}

	// https://www.sitepoint.com/delay-sleep-pause-wait/
	private sleep( milliseconds:number) {
		const date = Date.now();
		let currentDate = null;
		do {
		  currentDate = Date.now();
		} while (currentDate - date < milliseconds);
	}

}


@Component({
	selector: 'app-bottom-sheet-banner-template-rules',
	templateUrl: 'bottom-sheet.banner.template.rules.component.html',
})
export class BottomSheetBannerTemplateRulesComponent {
	constructor(
		private _bottomSheetRef: MatBottomSheetRef<BottomSheetBannerTemplateRulesComponent>,
		@Inject(MAT_BOTTOM_SHEET_DATA) public data: any[]
	) {
		console.log('BottomSheetBannerTemplateRulesComponent', data);
	}

	//generate characters based on rule Maximumcharacters
	private generateRandomWords(characterCount:number) {
		let text = "";
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const chaactersLength = characters.length;

		for (let i = 0; i < characterCount; i++)
			text += characters.charAt(Math.floor(Math.random() * chaactersLength));

		return text;
	}

	public openLink(event: MouseEvent): void {

		const dataSheet:any = [];
		const columnames:any = [];

		for (let i = 0; i < this.data.length;i++)
		{

			if(this.data[i].type === "Text" || this.data[i].type === "Button")
			{
				// https://www.samanthaming.com/tidbits/37-dynamic-property-name-with-es6/
				dataSheet.push(
					{
						[this.data[i].name]: `Maximum Characters: ${this.data[i].rules[0].maximumcharacters}` //this.generateRandomWords( this.data[i].rules[0].maximumcharacters )
					}
				);

				columnames.push({
					name: this.data[i].name,
					maxChar: this.data[i].rules[0].maximumcharacters
				});

			}
		}

		// making sure all the objects in DataSheet have the same heading/properties so that our spreadsheet
		// is properly populated
		dataSheet.forEach((x:any) => {
			columnames.forEach((y:any) => {
				if( !x.hasOwnProperty(y.name) ) {
					x[y.name] = `Maximum Characters: ${y.maxChar}` //this.generateRandomWords( y.maxChar )
				}
			});
		});

		//console.log("generate worksheet", dataSheet);
		// https://www.npmjs.com/package/xlsx#utility-functions
		/* generate worksheet */
		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataSheet);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

		/* save to file */
		XLSX.writeFile(wb, 'Example_Template_Rules.xlsx');
		/**/

		this._bottomSheetRef.dismiss();
		event.preventDefault();
	}
}
