import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AlertService, BannerCreatorService, BannerService, ComponentService, TemplateService } from '@app/core/services';
import { environment } from '@env/environment';
import * as createjs from 'createjs-module';
import { gsap } from "gsap";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Declaring Global Variables in TypeScript
//https://mariusschulz.com/blog/declaring-global-variables-in-typescript#:~:text=%23Declare%20a%20Global%20Variable,__INITIAL_DATA__%20variable%20directly%20%E2%80%A6
const ruler = (window as any).ruler;
const GIF = (window as any).GIF;

@Component({
    selector: 'app-banner-creator',
	templateUrl: './banner.creator.component.html',
	styleUrls: ['./banner.creator.component.scss']
})
export class BannerCreatorComponent implements AfterViewInit, OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	public update!: boolean;

	private rulerpadding = 30;

	/**/
	// MatPaginator Inputs
	public pageLength = 0;
	public pageSize = 1;
	public currentPage = 0;
	public pageSizeOptions: number[] = [1];
	public sortedData!: any[];

	// MatPaginator Output
	public pageEvent!: PageEvent;
	/**/
	//
	public stages: any[] = [];
    public stage!: createjs.Stage;
    private stageName!: string;
	private canvasName!: string;
	private stageCounter = 0;

	// collection of Templates retrieved from the server.

    // variables for determing banner layout and positioning of elements
	@Input() dataBanner!: any;
	@Input() dataContainer!: any;
	private BannerComponents: any[] = [];

	@Input() newComponentReceived: any;
	@Input() updateComponentReceived: any;
	@Input() unlockComponentReceived: any;
	@Input() componentMenuStateReceived: any;
	@Input() deleteComponentReceived: any;

	private ComponentControlsActive!: boolean;
	@Input() editableComponentsReceived: any;
	@Input() refreshStageReceived: any;

	@Input() previewCreativeReceived: any;

	// animations
	@Input() playAnimationStageReceived: any;
	@Input() playAnimationGlobalStageReceived: any;
	@Input() pauseAnimationStageReceived: any;
	@Input() loopAnimationStageReceived: any;
	private animationTimelineComplete = false;

	private playCounter = 0;
	private loopTimeline = false;
	private loopGlobalTimeline = false;
	//private componentTweens: any[] = [];
	private containerTimeline: any;
	//private containerTimelines: any[] = [];
	private renderAnimationsActive = false;

	public animationProgressTicker = 0;
	public animationsRendered = false;
	private timelineIsPlaying = false;

	private previewIsActive = false;

	@Output() componentEditDialogEvent = new EventEmitter<any>();
	@Output() componentEditComponentActionsMenuEvent = new EventEmitter<any>();

	// Drag and Drop Event Listeners
	@Output() componentPositionUpdateEvent = new EventEmitter<any>();

	// Export GIF/HTML/Static Request
	@Input() generateExportReceived: any;

	//
	@Output() CreativeReadyEvent = new EventEmitter<any>();

	@Output() FrameAnimationPlayEventEnd = new EventEmitter<any>();
	@Output() GlobalAnimationPlayEventEnd = new EventEmitter<any>();

	constructor(
		private elementRef: ElementRef,
		private alertService: AlertService,
		private bannerCreatorService: BannerCreatorService,
		private bannerService: BannerService,
		private templateService: TemplateService,
		private componentService: ComponentService,
		@Inject(DOCUMENT) private document: Document
	) {

	}

	@HostListener('mousemove', ['$event']) onMouseMove($event: MouseEvent){

		const elemOfInterest = this.elementRef.nativeElement.querySelector('#' + this.canvasName);

		const  	x_input:HTMLInputElement = this.document.querySelector('#coordinate-x') as HTMLInputElement,
				y_input:HTMLInputElement = this.document.querySelector('#coordinate-y') as HTMLInputElement;

		let mouseX = ($event.clientX - elemOfInterest.getBoundingClientRect().left);
		let mouseY = ($event.clientY - elemOfInterest.getBoundingClientRect().top);
		if( x_input !== null ){
			if ( mouseX > this.dataBanner.bannersize.width ) {
				mouseX = this.dataBanner.bannersize.width;
			} else if ( mouseX < 0  ){
				mouseX = 0;
			}
			x_input.value = mouseX.toFixed(1);
		}
		if( x_input !== null ){
			if ( mouseY > this.dataBanner.bannersize.height ) {
				mouseY = this.dataBanner.bannersize.height;
			} else if ( mouseY < 0  ){
				mouseY = 0;
			}
			y_input.value = mouseY.toFixed(1);
		}
	}

	@HostListener('dblclick', ['$event']) ondblclick($event: MouseEvent){

		if( this.previewIsActive === true || this.timelineIsPlaying === true ) {
			return;
		}

		const displayObj = this.stage.getObjectUnderPoint(this.stage.mouseX, this.stage.mouseY, 0) as any;

		this.stage.children.forEach((child: any) => {
			if( child.name === displayObj.name ) {} else {
				child.mouseEnabled = false;
			}
		});

		//if( displayObj.positionLock === true ) {

			const relevantComponent = this.BannerComponents.find( (component: any) => component.id === displayObj.componentId);
			console.log('Clicked on Banner Creator', displayObj, relevantComponent );
			//console.log('this.BannerComponents:', this.BannerComponents );

			this.componentEditComponentActionsMenuEvent.emit(relevantComponent);

		//} else {

		//}

		//this.componentEditDialogEvent.emit(relevantComponent);
	};

	ngOnInit() {

		// new components added
		this.newComponentReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			//console.warn(' New File Received:', evt);

			if (this.stage === undefined ) {
				return;
			}

			if (!evt || !evt.data) return;

			switch (evt.type.toLowerCase()) {

				case 'image':

					this.stage.removeChild(this.stage.getChildByName(evt.data.name ));

					//this.addImage( evt.data );
					this.populateImage(this.stage, evt.data);

					break;

				case 'shape':

					this.stage.removeChild(this.stage.getChildByName(evt.data.name ));

					//this.addShape( evt.data );
					this.populateShape( this.stage, evt.data );

					break;

				case 'text':

					this.stage.removeChild(this.stage.getChildByName(evt.data.name ));

					//this.addText(  evt.data );
					this.populateText( this.stage, evt.data );

					break;

				case 'button':

					this.stage.removeChild(this.stage.getChildByName(evt.data.name ));

					this.populateButton( this.stage, evt.data );

					break;

				default:
					break;
			}

			this.BannerComponents.push(evt.data);

			console.log('Updated BannerComponents: ', this.BannerComponents);

		});

		//
		this.componentMenuStateReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			//console.warn('componentMenuStateReceived Received:', evt);

			//if (!evt) return;

			if( evt === false && this.stage?.children.length > 0 ) {

				//console.warn('componentMenuStateReceived Yo!:');

				this.stage.children.forEach((child: any) => {
					child.mouseEnabled = true;
					//child.interact(this.stage);
				});

				this.stage.update();

			}
		});

		// updating component details based on Dialog Inputs
		this.updateComponentReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			//console.warn(' Updated Component Received:', evt);

			if (!evt || !evt.data || this.stage === undefined) return;

			evt.data.name = evt.data.name.toLowerCase();

			//const child = this.stage.getChildByName(evt.data.name) as unknown as BannerCreatorService["BAPP_Text"];
			//const child = this.stage.getChildByName(evt.data.name );
			const child = this.stage.getChildByName(evt.data.name) as any;

			switch (evt.type.toLowerCase()) {

				case 'image':

						if( evt.data.componentmeta.dataFile === undefined ) {

							//this.updateImageCoordinates( this.stage, evt.data );

							child.updatePositioning( evt.data );
							this.sortStageChildern(this.stage);

						} else {

							child.updateImage( evt.data )
							.then(() => {

								this.stage.update();
								this.sortStageChildern(this.stage);
							});

							//this.stage.removeChild(this.stage.getChildByName(evt.data.name ));
							//this.addImage( this.stage, evt.data );
							//this.sortStageChildern();

						}

					break;

				case 'shape':

					child.update( evt.data );
					this.sortStageChildern(this.stage);

					//this.stage.removeChild(this.stage.getChildByName(evt.data.name ));
					//this.addShape( this.stage, evt.data );
					//this.sortStageChildern(this.stage);

					break;

				case 'text':

					child.update( evt.data );
					//this.stage.update();
					this.sortStageChildern(this.stage);

					//this.stage.removeChild(this.stage.getChildByName(evt.data.name ));
					//this.addText(  this.stage, evt.data );
					//this.sortStageChildern(this.stage);

					break;

				case 'button':

					child.update( evt.data );
					//this.stage.update();
					this.sortStageChildern(this.stage);

					break;

				default:
					break;
			}

		});

		// lock/unlock component
		this.unlockComponentReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			//console.warn(' Unlock Component Received:', evt);

			if (!evt || !evt.name) return;

			evt.name = evt.name.toLowerCase();

			const stageComp = this.stage.getChildByName(evt.name) as any;

			//console.warn(' Unlock Component Received:', evt, stageComp);

			if( [undefined, null].includes(stageComp) ) {} else {
				stageComp.positionLock = evt.data;
			}

			/** /
			if( evt.data === false ) {
				this.alertService.success( evt.name + ' drag and drop activated.', { keepAfterRouteChange: true });
			} else {
				this.alertService.info( evt.name + ' drag and drop deactivated.', { keepAfterRouteChange: true });
			}
			/**/

		});

		// remove component
		this.deleteComponentReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			//console.warn(' Delete Component Received:', evt);

			if (!evt || !evt.data || this.stage === undefined) return;

			evt.data.name = evt.data.name.toLowerCase();

			const stageComp = this.stage.getChildByName(evt.data.name);
			this.stage.removeChild(stageComp);

			this.BannerComponents = this.BannerComponents.filter( (comp: any) => comp.id !== evt.data.id );

			console.log('Updated BannerComponents: ', this.BannerComponents);

			//this.removeMenuButton(this.stage, evt.data);

			this.sortStageChildern(this.stage);

		});

		// refresh stage request / switch between active containers
		this.refreshStageReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {
			// refresh stage request
			if (this.stage && evt === true ) {
				//console.log('Refresh Banner Event Received.');
				//this.stage.update();
				this.rebuildBanner(this.stage)
				.then((stageComponentObj:any) => {
					this.alertService.info( 'Canvas Refreshed.', { keepAfterRouteChange: true });

					this.setupStageEventListeners(this.stage);

					if( this.renderAnimationsActive === true ) {

						this.initialiseGSAPAnimations( this.stage, stageComponentObj.tweens.flat() );

					}
				});

			// switch between active containers
			} else if( typeof evt === 'object' ) {

				//this.emptyActiveComponentsAndAnimations();
				//this.emptyActiveAnimations();
				this.emptyActiveStage(this.stage);

				this.dataContainer = evt;
				this.BannerComponents = this.dataContainer.components;

				this.populate(this.stage, this.dataContainer.components)
				.then((stageComponentObj:any) => {
					this.alertService.success( evt.name + ' Loaded.', { keepAfterRouteChange: true });

					this.setupStageEventListeners(this.stage);

					if( this.renderAnimationsActive === true ) {

						this.initialiseGSAPAnimations( this.stage, stageComponentObj.tweens.flat() );

					}
				});

				//console.log('New Frame Boet!', evt);
			}
		});

		// play animation request for all frames/containers
		this.playAnimationGlobalStageReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			if (this.stage && evt === true ) {

				//this.playGlobalAnimation( this.stages[this.currentPage].timeline );
				this.playGSAPGlobalAnimation( this.stages[this.currentPage].timeline );

				this.timelineIsPlaying = true;

			} else if (this.stage && evt === false ) {

				//console.warn('Pause Banner Animation Event Received.', evt, this.animationTimelineComplete, this.loopTimeline);
				//this.stages[this.currentPage].timeline.setPaused(true);

				this.stages.forEach((stagedata: any) => {
					stagedata.timeline.pause(true);
				});

				this.timelineIsPlaying = false;

				//this.pauseAnimations(this.stage);
				//createjs.Ticker.paused = true;
				//createjs.Ticker.removeEventListener("tick", this.stages[this.currentPage].stage);
			}

		});

		// play animation request for active frame/container
		this.playAnimationStageReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			if (this.stage && evt === true ) {

				//this.playGSAPFrameAnimation(this.stages[this.currentPage].timeline);
				this.playGSAPFrameAnimation(this.containerTimeline);

				this.timelineIsPlaying = true;

			} else if (this.stage && evt === false ) {

				//this.stages[0].timeline.pause();
				this.containerTimeline.pause();
				//this.stages[this.currentPage].timeline.pause();

				this.timelineIsPlaying = false;
			}
		});

		/** /
		this.pauseAnimationStageReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			if (this.stage && evt === true ) {
				console.warn('Pause Banner Animation Event Received.', evt, this.animationTimelineComplete, this.loopTimeline);
				this.pauseAnimations(this.stage);

			}
		});
		/**/

		this.loopAnimationStageReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			if (this.stage) {

				//console.warn('Loop Banner Animation Event Received.', evt, this.animationTimelineComplete, this.loopTimeline, this.containerTimeline);
				this.loopTimeline = evt;

			}

		});

		// preview stage request (send blob back)
		this.previewCreativeReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			this.CreativeReadyEvent.emit(false);

			if( evt === true ) {
				//console.log('Preview Creative Event Received.');

				this.previewIsActive = true;

				this.generateAllFramePages()
				.then( (results: any) => {

					const allTweens:any = [];

					results.forEach( (result:any) => {

						this.stages.push({
							stage: result.stage,
							components: result.components,
							timeline: result.timeline,
							tweens: result.tweens
						});

						allTweens.push(this.buildGSAPAnimationTimeline( result.tweens.flat()));

					});

					Promise.all(allTweens)
					.then( (timelines: any) => {

						timelines.forEach( (timeline:any, index:number) => {
							this.stages[index+1].timeline = timeline;
						});

						this.stage = this.stages[0].stage;
						this.stage.update();
						this.intialisePagination();

						console.log('this.stages', this.stages);

						this.alertService.info( 'Preview active.', { keepAfterRouteChange: true });

						this.CreativeReadyEvent.emit(true);

					});

				});

			} else if( evt === false ) {

				this.previewIsActive = false;

				this.rebuildBanner(this.stages[0].stage)
					.then((stageComponentObj:any) => {

						this.stage = stageComponentObj.stage;
						createjs.Ticker.addEventListener("tick", this.stage);

						this.stage.update();

						this.stages.splice( 0, (this.stages.length) );

						this.stages.push({
							stage: stageComponentObj.stage,
							components: stageComponentObj.components,
							timeline: stageComponentObj.timeline,
							tweens: stageComponentObj.tweens
						});

						if( this.renderAnimationsActive === true ) {

							this.initialiseGSAPAnimations( this.stage, stageComponentObj.tweens.flat() );

						}

						this.resetPagination();
						this.intialisePagination();

						//console.log('this.stages', this.stages);
						//console.log('this.stage', this.stage);

						this.alertService.info( 'Preview Disabled.', { keepAfterRouteChange: true });

						this.CreativeReadyEvent.emit(true);
					});

			}
		});

		// generate export request
		// edit component controls
		this.generateExportReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			if (!evt) return;

			console.log('Export Creative Event Received.', evt);

			switch (this.dataBanner.bannertype.name) {

				case 'Static JPG':

					const anchor = document.createElement("a");
					anchor.setAttribute( "download", 'preview.jpg');
					anchor.setAttribute( "href", this.stage.toDataURL('#FFFFFF', 'image/jpeg'));

					anchor.click();

					break;

				case 'GIFs':

					//if ( this.stages.length <= 1 ) {
					//	this.generateAllFramePages();
					//}

					const ReceivedContainers = evt;

					this.CreativeReadyEvent.emit(false);

					//return;
					this.generateAllFramePages().then((results: any) => {

						//console.log('stage', results, this.stages);

						results.forEach( (result:any) => {

							this.stages.push({
								stage: result.stage,
								components: result.components,
							});

						});

						// https://stackoverflow.com/questions/21913673/execute-web-worker-from-different-origin
						this.urlContentToDataUri(`${environment.apiUrl}/gif.worker.js`)
						.then(
							(WorkerScriptResult) =>{
								//console.log('result', result);

								// loop through containers.
								const creativeFrames:any[] = [];

								for (let index = 0; index < this.stages.length; index++) {
									const stage = this.stages[index].stage;
									//console.log('stage', stage);
									creativeFrames.push(this.generateGIFFrame(stage));
									//this.sleep(5000);
								}

								Promise.all(creativeFrames).then((values) => {
									//console.log('generateGIFFrame results', values);

									// https://github.com/terikon/gif.js.optimized
									const gif = new GIF({
										workerScript: WorkerScriptResult,
										workers: 2,
										quality: 10
										//background: '#000'
									});

									// image element or a canvas element
									values.forEach((frame:any, index:number) => {
										gif.addFrame(
											frame,
											{
												delay: (ReceivedContainers[index].duration * 1000)
											}
										);
									});

									gif.on('finished', (blob: Blob)=> {

										//console.log('GIF Ready:');

										const UItimeout = setTimeout(() => {

											this.rebuildBanner(this.stage);

											this.alertService.success( 'GIF Generated Successfully.', { keepAfterRouteChange: true });

											window.open(URL.createObjectURL(blob));

											this.CreativeReadyEvent.emit(true);

											clearTimeout(UItimeout);

										}, 2000);
									});

									gif.render();

								});
							}
						);
					});

					break;

				case 'HTML5':

					this.CreativeReadyEvent.emit(false);

					this.stages.splice(1, this.stages.length);

					this.generateAllFramePages()
					.then( (results: any) => {

						const allTweens:any = [];

						results.forEach( (result:any) => {

							this.stages.push({
								stage: result.stage,
								components: result.components,
								timeline: result.timeline,
								tweens: result.tweens
							});

							allTweens.push(this.buildGSAPAnimationTimeline( result.tweens.flat()));

						});

						Promise.all(allTweens)
						.then( (timelines: any) => {

							timelines.forEach( (timeline:any, index:number) => {
								this.stages[index+1].timeline = timeline;
							});

							this.bannerCreatorService.buildHTML5ForExport(this.dataBanner, this.stages)
							.then((result:any) => {

								const UItimeout = setTimeout(() => {

									this.rebuildBanner(this.stage)
									.then(() => {

										//console.log('HTML5 Ready:', result);

										this.CreativeReadyEvent.emit(true);

										this.alertService.success( 'HTML5 Generated Successfully.', { keepAfterRouteChange: true });

										clearTimeout(UItimeout);

									});

								}, 2000);
							})
							.catch((err)=> {

								this.alertService.error( err, { keepAfterRouteChange: true });

								this.CreativeReadyEvent.emit(true);
							});

						});

					});

					break;

				default:
					break;
			}

		});

		//
		this.renderAnimationsActive = (['HTML5'].includes(this.dataBanner.bannertype.name) === true ? true : false);
		//this.renderAnimationsActive = false;

		// run default population functions
		this.initialiseCreative();
	}

	ngOnDestroy() {
		//console.info('Banner Creator Destroyed.');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	// scrubber variables
	private scrubberEl!:HTMLDivElement;
	private timelineContainer!:HTMLDivElement;
	private positionInfo:any;
	private containerWidth!: number;
	private scrubberPositionBuffer = 29;

	ngAfterViewInit() {

		//console.log('dataBanner', this.dataBanner);
		//this.initialiseBanner();

		if( ['HTML5'].includes(this.dataBanner.bannertype.name) === true ) {
			this.scrubberEl = this.document.querySelector(".scrubber") as HTMLDivElement;
			this.timelineContainer = this.document.querySelector(".timeline-scrubber") as HTMLDivElement;
			this.positionInfo = this.timelineContainer.getBoundingClientRect();
			this.containerWidth = this.positionInfo.width;
		}

		const rulerElem = this.elementRef.nativeElement.querySelector('#ruler');

		rulerElem.style.width = '100%';//this.dataBanner.bannersize.width + (this.rulerpadding + 5) + 'px';
		rulerElem.style.height = '100%';//this.dataBanner.bannersize.height + this.rulerpadding + 'px';
		rulerElem.style.pointerEvents = 'none';

		// https://github.com/MrFrankel/ruler alternative: https://github.com/mark-rolich/RulersGuides.js
		const myRuler = new ruler({
			// reference to DOM element to apply rulers on
			container: rulerElem,
			rulerHeight: this.rulerpadding, // thickness of ruler
			fontFamily: 'arial',// font for points
			fontSize: '12px',
			strokeStyle: '#CCCCCC',
			lineWidth: 1,
			enableMouseTracking: true,
			enableToolTip: true
		});

		myRuler.api.setPos({x:0, y:5});

		//myRuler.api.setScale(1.5);

		myRuler.api.toggleRulerVisibility(true);
		/*
		hide/show rulers
		*/
		myRuler.api.toggleGuideVisibility(true);

		// default guides
		myRuler.api.setGuides(
			[
				{
					dimension: 2, // HORIZONTAL
					posX: 0,
					posY: this.dataBanner.bannersize.height / 2
				},
				{
					dimension: 2, // HORIZONTAL
					posX: 0,
					posY: 15
				},
				{
					dimension: 2, // HORIZONTAL
					posX: 0,
					posY: this.dataBanner.bannersize.height - 5
				},
				{
					dimension: 1, // VERTICAL
					posX: this.dataBanner.bannersize.width / 2,
					posY: 0
				},
				{
					dimension: 1, // VERTICAL
					posX: 15,
					posY: 0
				},
				{
					dimension: 1, // VERTICAL
					posX: this.dataBanner.bannersize.width - 5,
					posY: 0
				}

			]
		);

		//console.log('myRuler', myRuler);
		//window.myRuler = myRuler;

		const bannerHolderDom = this.elementRef.nativeElement.querySelector('.banner-holder');

		const dimne = bannerHolderDom.getBoundingClientRect();

		//console.warn('bannerHolderDom:', bannerHolderDom.getBoundingClientRect());

		bannerHolderDom.style.height = (dimne.height + 100) + 'px';

    }

	private initialiseCreative():void {

		this.createCanvas()
			.then((newcanvas:HTMLCanvasElement) => {
				return this.setupStage(newcanvas);
			})
			.then((newStage:createjs.Stage) => {

				this.BannerComponents = this.dataContainer.components;

				return this.populate( newStage, this.dataContainer.components );
			})
			.then((stageComponentObj:any) => {

				//return this.generateAllFramePages();
				this.stage = stageComponentObj.stage;

				this.stages.push({
					stage: stageComponentObj.stage,
					components: stageComponentObj.components,
					timeline: stageComponentObj.timeline,
					tweens: stageComponentObj.tweens
				});

				if( this.renderAnimationsActive === true ) {
					//return this.generateAllFramePages();
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

				this.setupStageEventListeners( this.stage );

				if( this.renderAnimationsActive === true ) {

					this.initialiseGSAPAnimations( this.stage, stageComponentObj.tweens.flat() );

				} else {

					this.CreativeReadyEvent.emit(true);
				}
			});
	}

	private emptyActiveStage( stage:createjs.Stage ):void {
		stage.removeAllEventListeners();
		stage.removeAllChildren();
	}

	private generateAllFramePages(): Promise<any> {

		return new Promise<any>((resolve, reject) => {

			let counter = 0;
			const populationPromises:any[] = [];

			this.dataBanner.containers.forEach( (container:any) =>{

				if ( this.dataContainer.id === container.id ) { return; }

				counter++;

				const stage = new createjs.Stage(this.elementRef.nativeElement.querySelector('canvas#' + this.canvasName));

				stage.set({
					name: this.canvasName + '-' + counter
				});

				stage.enableDOMEvents(false);
				stage.enableMouseOver(0);

				populationPromises.push(
					this.populate( stage, container.components )
				);

			});

			Promise.all(populationPromises)
				.then((allStagesComponentsArray:any) => {

					resolve(allStagesComponentsArray);

				});

		});

	}

	private async generateGIFFrame( stage:createjs.Stage ): Promise<HTMLImageElement> {

		return new Promise(
			(resolve, reject) => {

				const img = new Image();

				img.addEventListener("load", async () => {
					console.log('Frame Image Loaded');

					resolve(img);

				});
				stage.update();
				img.src = stage.toDataURL('#FFFFFF', 'image/jpeg');

			}
		);

	}

	/**
	 * Initialise Banner
	 *
	 * @param banner (Object)
	 *
	 */
    private createCanvas(): Promise<HTMLCanvasElement> {

		console.log('createCanvas', this.dataBanner);

		return new Promise<HTMLCanvasElement>((resolve, reject) => {

			const canvas = document.createElement("canvas");
			this.canvasName = "bannerCanvas-" + this.dataBanner.bannersize.width + '-' + this.dataBanner.bannersize.height;

			canvas.setAttribute( "id", this.canvasName);
			canvas.setAttribute( "class", 'canvas-banner');
			canvas.setAttribute( "width", this.dataBanner.bannersize.width.toString() );
			canvas.setAttribute( "height", this.dataBanner.bannersize.height.toString() );

			//canvas.setAttribute( "style", 'box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);position:relative;top:15px;left:15px;' );
			canvas.setAttribute( "style", 'box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);position:relative;top:'+ (this.rulerpadding + 5) +'px;left:'+ (this.rulerpadding + 5) +'px;' );

			const bannerHolderDom = this.elementRef.nativeElement.querySelector('.banner-holder');
			bannerHolderDom.prepend(canvas);

			//console.log('bannerHolderDom:', bannerHolderDom.getBoundingClientRect());

			//this.addCanvasGuide();
			//@ViewChild('canvas') canvas!:ElementRef;

			//this.stage = new createjs.Stage(this.elementRef.nativeElement.querySelector('canvas#' + canvasName));

			//this.setupStage(this.canvasName);
			resolve(canvas);

		});

    }

	private setupStage( canvas: HTMLCanvasElement ): Promise<createjs.Stage> {

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
			stage.mouseMoveOutside = true;

			createjs.Ticker.framerate = 60;
			createjs.Ticker.paused = false;

			stage.snapToPixelEnabled = true;

			resolve(stage);

		});
	}

	private setupStageEventListeners( stage:createjs.Stage ):void {

		stage.addEventListener('component.update', (evt:any) => {

			//console.log('component.update', evt);

			this.componentPositionUpdateEvent.emit({
				component: evt.component,
				data: evt.eventData,
			});

		});

		//stage.addEventListener("added", (evt:any)=> {
		//	console.log('display object added:', evt);
		//});

	}

	//update canvas while listening to drag and drop
	private tick(event:any): void {
		//console.log('this.update:', this.update);
		// `update` boolean allows us to tick as needed.
		if (this.update) {
			this.update = false; // only update once
			this.stage.update(event);
		}
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

	/**
	 * Populate Banner Components
	 *
	 */
	private populate ( stage:createjs.Stage, components:any[] ): Promise<any> {

		return new Promise<any>((resolve, reject) => {

			//console.log('Populate Creative Based on Active Container:', this.dataContainer);

			//const components = this.dataContainer.components;

			const Componentpromises = [];

			components.forEach((component:any) => {

				//console.log('component', component);

				switch (component.componenttype.name) {

					case 'Shape':

						Componentpromises.push(this.populateShape(stage, component));

						//this.populateShape(stage, component);

						break;

					case 'Image':

						//this.populateImage(stage, component);

						Componentpromises.push(this.populateImage(stage, component));

						break;

					case 'Text':

						Componentpromises.push(this.populateText(stage, component));

						//this.populateText(stage, component);

						break;

					case 'Button':

						Componentpromises.push(this.populateButton(stage, component));

						break;

				}

				//this.BannerComponents.push(component);
			});

			Componentpromises.push(this.populateBannerBorder(stage));

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
							components: components
						});
					}
				});

		});

	}

	private rebuildBanner ( stage:createjs.Stage ): Promise<createjs.Stage> {

		//this.emptyActiveAnimations();
		this.emptyActiveStage(stage);

		this.BannerComponents = this.dataContainer.components;

		//this.populate(stage, this.BannerComponents);
		return this.populate(stage, this.dataContainer.components);

	}

	private populateShape( stage:createjs.Stage, component: any): Promise<any> {

		return new Promise<any>((resolve, reject) => {

			//console.warn('populateShape:', component);
			const componentMeta = component.componentmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {});
			//const componentShape = new this.BAPP_Shape( component );
			const componentShape = new this.bannerCreatorService.BAPP_Shape( component );

			stage.addChild(componentShape);
			stage.setChildIndex( componentShape, parseInt(componentMeta.zIndex) );

			stage.update();

			componentShape.interact(stage);

			resolve({
				'component': component,
				'displayobject': componentShape
			});

		});

	}

	private populateImage( stage:createjs.Stage, component: any): Promise<any> {

		//console.warn('populateImage:', component);

		return new Promise<any>((resolve, reject) => {

			const componentMeta = component.componentmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {});
			//const componentImage = new this.BAPP_Image( stage, component, componentMeta );
			const componentImage = new this.bannerCreatorService.BAPP_Image( stage, component, componentMeta );

			stage.addChild(componentImage);
			stage.setChildIndex( componentImage, parseInt(componentMeta.zIndex) );

			stage.update();

			componentImage.interact(stage);

			resolve({
				'component': component,
				'displayobject': componentImage
			});

		});
	}

	private populateText( stage:createjs.Stage, component: any): Promise<any> {

		//console.warn('populateText:', component);

		return new Promise<any>((resolve, reject) => {

			const componentMeta = component.componentmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {});
			//const canvasText = new this.BAPP_Text( component, componentMeta );
			const canvasText = new this.bannerCreatorService.BAPP_Text( component, componentMeta );

			stage.addChild(canvasText);
			stage.setChildIndex( canvasText, parseInt(componentMeta.zIndex) );

			stage.update();

			canvasText.interact(stage);

			resolve({
				'component': component,
				'displayobject': canvasText
			});

		});

		//this.addMenuButton(component);
	}

	private populateButton( stage:createjs.Stage, component: any): Promise<any> {

		//console.warn('populateButton:', component);

		return new Promise<any>((resolve, reject) => {

			const componentMeta = component.componentmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {});
			//const canvasButton = new this.BAPP_Button( component );
			const canvasButton = new this.bannerCreatorService.BAPP_Button( component );

			stage.addChild(canvasButton);
			stage.setChildIndex( canvasButton, parseInt(componentMeta.zIndex) );

			stage.update();

			canvasButton.interact(stage);

			resolve({
				'component': component,
				'displayobject': canvasButton
			});

		});

	}

	private populateBannerBorder( stage:createjs.Stage ): Promise<createjs.DisplayObject> {

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

	/*
	 * Stage GSAP Animations for HTML5
	 *
	 */
	private playGSAPFrameAnimation( activeTimeline:GSAPTimeline ) {

		if( this.stage.hasEventListener('tick') ) {} else {
			createjs.Ticker.addEventListener("tick", this.stage);
			this.stage.update();
		}

		const onCompletion = (evt:any) => {
			console.warn('Frame Complete:', evt);
			this.timelineIsPlaying = false;
			this.FrameAnimationPlayEventEnd.emit(true);
		}

		activeTimeline.eventCallback("onComplete", onCompletion, ["param1","param2"]);

		//activeTimeline.restart();
		//activeTimeline.play(0);

		if( activeTimeline['_time'] === activeTimeline.totalDuration() ) {
			activeTimeline.play(0);
			//activeTimeline.restart();
		} else {
			activeTimeline.play();
		}
		/** /
		this.stage.addEventListener("complete", (evt:any) => {
			console.warn('FRAME Animation Complete.', evt);

			if (this.loopTimeline === true ) {
				activeTimeline.play(0);
			} else {
				activeTimeline.pause();
				evt.target.removeEventListener('complete');
				evt.target.removeAllEventListeners();
				this.FrameAnimationPlayEventEnd.emit(true);
			}
		});
		/**/

	}

	private playGSAPGlobalAnimation( activeTimeline:GSAPTimeline ) {

		this.playCounter++;

		console.log('playFrameAnimation:', this.playCounter);

		if( this.stage.hasEventListener('tick') ) {} else {
			createjs.Ticker.addEventListener("tick", this.stage);
			this.stage = this.stages[0].stage;
			this.stage.update();
		}

		const onCompletion = (evt:any) => {

			activeTimeline.eventCallback("onComplete", null);

			if( this.stages[this.playCounter]?.timeline ) {

				this.stage.removeAllEventListeners();

				this.stage = this.stages[this.playCounter].stage;
				this.stage.update();

				this.playGSAPGlobalAnimation( this.stages[this.playCounter].timeline );

			} else {

				console.warn('All Frames Animated.');

				this.playCounter = 0;
				this.currentPage = 0;

				if (this.loopGlobalTimeline === true ) {

					/**/
					const repeatInterval = setTimeout(() => {

						console.warn('Repeating Creative Animation.');

						this.playCounter = 0;
						this.currentPage = 0;

						this.stage.removeAllEventListeners();
						this.stage = this.stages[this.playCounter].stage;
						this.stage.update();

						//this.stage = this.stages[this.playCounter].stage;
						//createjs.Ticker.addEventListener("tick", this.stage);
						//this.stage.update();
						this.playGSAPGlobalAnimation( this.stages[this.playCounter].timeline );

						clearTimeout(repeatInterval);

					}, 2500);
					/**/

				} else {

					this.playCounter = 0;
					this.currentPage = 0;
					this.stage.removeAllEventListeners();
					this.stage.update();

					this.GlobalAnimationPlayEventEnd.emit(true);

					this.timelineIsPlaying = false;
				}
			}
		}

		activeTimeline.eventCallback("onComplete", onCompletion, ["param1","param2"]);

		activeTimeline.play(0);

		/** /
		activeTimeline.play(0).call(() => {

			if( this.stages[this.playCounter]?.timeline ) {

				this.stage.removeAllEventListeners();

				this.stage = this.stages[this.playCounter].stage;
				this.stage.update();

				this.playGSAPGlobalAnimation( this.stages[this.playCounter].timeline );
			} else {

				console.warn('All Frames Animated.');

				this.playCounter = 0;
				this.currentPage = 0;

				if (this.loopGlobalTimeline === true ) {

					/** /
					const repeatInterval = setTimeout(() => {

						console.warn('Repeating Creative Animation.');

						this.playCounter = 0;
						this.currentPage = 0;

						this.stage.removeAllEventListeners();
						this.stage = this.stages[this.playCounter].stage;
						this.stage.update();

						//this.stage = this.stages[this.playCounter].stage;
						//createjs.Ticker.addEventListener("tick", this.stage);
						//this.stage.update();
						this.playGSAPGlobalAnimation( this.stages[this.playCounter].timeline );

						clearTimeout(repeatInterval);

					}, 2500);
					/** /

				} else {

					this.playCounter = 0;
					this.currentPage = 0;
					this.stage.removeAllEventListeners();
					this.stage.update();

					this.GlobalAnimationPlayEventEnd.emit(true);
				}
			}

		}, [], activeTimeline.totalDuration() );
		/**/

		//console.warn('Play Banner Animation Event Received.', evt, this.animationTimelineComplete, this.loopTimeline);
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

			//console.log('animateGSAPComponent:', instanceTimeline);
			//resolve(instanceTimeline);

			//console.log('animateGSAPComponent:', tweens);

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

			const time_input:HTMLInputElement = this.document.querySelector('#frame-animation-duration') as HTMLInputElement;
			const progress_input:HTMLInputElement = this.document.querySelector('#frame-animation-progress') as HTMLInputElement;
			const updateStats = () => {

				if( this.animationsRendered === false ) {
					return;
				}

				if( time_input ) {
					time_input.value = masterTimeline.time().toFixed(2);
				}

				//console.warn('FmasterTimeline:', masterTimeline);
				//if( progress_input ) {
				//	progress_input.value = masterTimeline.progress().toFixed(2);
				//}

				//this.animationProgressTicker = parseFloat(masterTimeline.progress().toFixed(2));
				this.animationProgressTicker = parseFloat(masterTimeline.progress().toFixed(2)) * 100;

				this.updateScrubber(this.animationProgressTicker/100);

				//totalTime.innerHTML = masterTimeline.totalTime().toFixed(2);
				//totalProgress.innerHTML = masterTimeline.totalProgress().toFixed(2);
			}

			//const onCompletion = (evt:any) => {
			//	console.warn('Frame Complete:', evt);
			//	this.FrameAnimationPlayEventEnd.emit(true);
			//}

			// onUpdate, onComplete, onReverseComplete, onInterrupt, onRepeat
			masterTimeline.eventCallback("onUpdate", updateStats, ["param1","param2"]);
			//masterTimeline.eventCallback("onComplete", onCompletion, ["param1","param2"]);

			//duration = document.getElementById("duration"),
			//totalDuration = document.getElementById("totalDuration"),
			//repeatCount = document.getElementById("repeatCount"),
			//totalRepeatCount = document.getElementById("totalRepeatCount"),
			//time = document.getElementById("time"),
			//totalTime = document.getElementById("totalTime"),
			//progress = document.getElementById("progress");
			//totalProgress = document.getElementById("totalProgress"),
			//restart = document.getElementById("restart"),
			//reps = 0;

			//progress_input:HTMLInputElement = this.document.querySelector('#frame-animation-progress') as HTMLInputElement;

			/** /
			function updateReps() {
				reps++;
				repeatCount.innerHTML = reps;
			}
			function reset() {
				reps = 0;
				duration.innerHTML = tl.duration().toFixed(2);
				totalDuration.innerHTML = tl.totalDuration().toFixed(2);
				repeatCount.innerHTML = reps;
				totalRepeatCount.innerHTML = tl.repeat();
			}
			/**/

			//console.log('buildGSAPAnimationTimeline:', masterTimeline);

			resolve(masterTimeline);

		});

	}

	private buildScrubber( stage:createjs.Stage, timeline:GSAPTimeline) {

		const milliseconds = timeline.duration() * 10;
		const roundedMilliseconds = Math.floor(milliseconds);

		const timeContainer = this.document.querySelector('.times') as HTMLDivElement;

		// empty the HTML container
		timeContainer.innerHTML = '';

		for ( let i = 0; i < roundedMilliseconds + 1; i++) {
			timeContainer.insertAdjacentHTML("beforeend", `<div title="${i / 10}"></div>`);
		}

		//const scrubber;
		const scrubberEl = this.document.querySelector(".scrubber") as HTMLDivElement;
		const timelineContainer = this.document.querySelector(".timeline-scrubber") as HTMLDivElement;
		const positionInfo = timelineContainer.getBoundingClientRect();
		const containerWidth = positionInfo.width;

		//const containerWdth = this.containerWidth;

		const dragLeftBoundary = this.positionInfo.left - this.scrubberPositionBuffer;
		const dragRightBoundary = (this.containerWidth - this.positionInfo.left + this.scrubberPositionBuffer);

		//console.log('positionInfo',this.positionInfo );

		dragElement(scrubberEl);

		scrubberEl.style.left = dragRightBoundary + "px";

		const scrubbuffer = this.scrubberPositionBuffer;

		function dragElement(elmnt: HTMLDivElement) {
			let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

			// otherwise, move the DIV from anywhere inside the DIV:
			elmnt.onmousedown = dragMouseDown;

			function dragMouseDown(e:MouseEvent) {
				e = e || window.event;
				e.preventDefault();
				// get the mouse cursor position at startup:
				pos3 = e.clientX;
				pos4 = e.clientY;
				document.onmouseup = closeDragElement;
				// call a function whenever the cursor moves:
				document.onmousemove = elementDrag;
			}

			function elementDrag(e:MouseEvent) {
				e = e || window.event;
				e.preventDefault();
				// calculate the new cursor position:
				pos1 = pos3 - e.clientX;
				pos2 = pos4 - e.clientY;
				pos3 = e.clientX;
				pos4 = e.clientY;
				// set the element's new position:
				//elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
				if( (elmnt.offsetLeft - pos1) > dragRightBoundary) {
					return;
				}

				//if( (elmnt.offsetLeft - pos1) < dragLeftBoundary) {
				//	return;
				//}

				elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

				//timeline.pause();
				//let positionX = this.x - 26;
				const positionX = (elmnt.offsetLeft - pos1) + scrubbuffer;
				timeline.progress(positionX / containerWidth);

				stage.update();
				timeline.pause();
			}

			function closeDragElement() {
				// stop moving when mouse button is released:
				document.onmouseup = null;
				document.onmousemove = null;

				//timeline.pause();
			}
		}
	}

	private updateScrubber( positionX:number ) {

		//const scrubberEl = this.document.querySelector(".scrubber") as HTMLDivElement;
		//const timelineContainer = this.document.querySelector(".timeline-scrubber") as HTMLDivElement;
		//const positionInfo = timelineContainer.getBoundingClientRect();
		//const containerWidth = positionInfo.width;
		if( this.timelineIsPlaying === true ) {
			this.scrubberEl.style.left = ((this.containerWidth * positionX) - this.scrubberPositionBuffer) + "px";
			//scrubberEl.style.left = positionX + "px";
		}
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

				this.buildScrubber(stage, timeline);

				this.animationProgressTicker = 100;

				stage.update();

				this.CreativeReadyEvent.emit(true);

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

		/** /
		console.log('Paginating:', e, {
			'previousStage': this.stages[e.previousPageIndex],
			'currentStage': this.stages[e.pageIndex]
		});
		/**/

		createjs.Ticker.addEventListener("tick", this.stages[e.pageIndex].stage);
		createjs.Ticker.removeEventListener("tick", this.stages[e.previousPageIndex].stage);

		this.currentPage = e.pageIndex;
		this.pageSize = e.pageSize;
		this.iterator();

		this.stage = this.stages[e.pageIndex].stage;
		this.stage.update();

	}

	private iterator() {
		const end = (this.currentPage + 1) * this.pageSize;
		const start = this.currentPage * this.pageSize;
		const part = this.stages.slice(start, end);
		this.sortedData = part;

		//console.log('iterator() this.sortedData', this.sortedData);
	}

	private intialisePagination() {
		this.sortedData = this.stages.slice();
		this.pageLength = this.sortedData.length;
		this.iterator();
	}

	private resetPagination() {
		this.pageLength = 0;
		this.pageSize = 1;
		this.currentPage = 0;
	}
	/**/

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

