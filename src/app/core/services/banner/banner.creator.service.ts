import { Injectable, OnDestroy } from '@angular/core';
import { FontType } from '@app/core/models';
import { environment } from '@env/environment';
import * as createjs from 'createjs-module';
import * as saveAs from 'file-saver';
import { gsap } from "gsap";
import * as JSZip from 'jszip';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { FontTypeService } from '../fonttype/font.type.service';

@Injectable({ providedIn: 'root' })
export class BannerCreatorService implements OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	private dataSubject: BehaviorSubject<string>;
	public data: Observable<string>;

	public serviceData$!: Observable<any>;
	public serviceDataFonts!: FontType[];

	private lib: any = {};
	private manifest: any[] = [];

	private assets_css: any[] = [];
	private assets_images: any[] = [];
	private assets_scripts: any[] = [];

	private _index: any;
	private _script: any;

	constructor(
		private fontTypeService: FontTypeService,
	) {
		this.dataSubject = new BehaviorSubject<string>('');
		this.data = this.dataSubject.asObservable();

		this.getData();
	}

	ngOnDestroy() {
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	public get dataValue(): string {
		return this.dataSubject.value;
	}

	private getData(): void {

		this.serviceData$ = combineLatest(
			[
				this.fontTypeService.getAll()
			]
		)
			.pipe(
				map(([fonttypes]): any => {
					// combineLatest returns an array of values, here we map those values to an object
					return { fonttypes };
				})
			);

		this.serviceData$.pipe(takeUntil(this._destroy$)).subscribe((data: any) => {
			//console.info('Page Data initialise', data);

			this.prepPageData(data);
		});
	}

	private prepPageData(data: any): void {
		this.serviceDataFonts = data.fonttypes;
	}

	private resetData(): void {
		this.lib = {};
		this.manifest.splice(0, this.manifest.length);
		this.assets_css.splice(0, this.assets_css.length);
		this.assets_scripts.splice(0, this.assets_scripts.length);
		this.assets_scripts.splice(0, this.assets_scripts.length);

		this._index = null;
		this._script = null;
	}

	public buildHTML5ForExport(dataBanner: any, stages: any[]): Promise<any> {

		/** /
		stages.forEach((stage:any) => {
			stage.components.forEach((component:any) => {
				//const meta = component?.componentmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {});
				if( component.componenttype.name === 'Image') {
					component?.componentmeta.forEach((meta:any) => {
						if( meta.name === 'path' ) {
							const fileNameRegex = /(?:.+\/)(.+)/g;
							//const fileNameRegex = new RegExp(/(?:.+\/)(.+)/g);
							const na = fileNameRegex.exec(meta.value);
							////console.log('path:', na?.[1], meta.value);
							if( na !== null ) {
								////console.log('path:', na?[1]);
								meta.value = na?.[1];
							}
						}
					});
				}
			});
		});
		/**/

		console.warn('BannerCreatorService:', dataBanner, stages);

		return new Promise<any>((resolve, reject) => {

			Promise.all([
				this.getHTML5Fonts(stages),
				this.getHTML5ImageAssets(stages),
				this.prepLibraryProperties(dataBanner)
			])
				.then((results) => {

					////console.log('buildHTML5ForExport:', results);

					results[0].forEach((font: any) => {
						this.manifest.push({
							'id': this.generateUUID(),
							'src': font
						})
					});

					results[1].forEach((assetPath: any) => {

						/**/
						// rewrite image paths and to reference local directory

						const fileNameRegex = /(?:.+\/)(.+)/g;
						const na = fileNameRegex.exec(assetPath);

						let localPath: string;

						if (na !== null) {
							////console.log('path:', na?[1]);
							localPath = na?.[1];
						} else {
							localPath = assetPath;
						}
						/**/

						this.manifest.push({
							'id': this.generateUUID(),
							'src': localPath
						});
					});

					this.lib.properties = results[2];
					this.lib.properties.manifest = this.manifest;

					return this.generateHTML5script(dataBanner, stages);

				})
				.then((scriptsFile) => {

					this._script = scriptsFile;
					//this._script = stages;

					return this.generateHTML5Index(dataBanner);
				})
				.then((htmlIndex: any) => {

					this._index = htmlIndex;

					this.generateZIPpackage(dataBanner)
						.then((zip: any) => {

							////console.log('ZIP PACKAGE:', zip);

							resolve({
								'lib': this.lib,
								'html': this._index,
								'script': this._script
							});

							this.resetData();
						})
						.catch((err) => {

							console.error('generateZIPpackage Error:', err);

							reject('An error occured preparing the HTML5 Package. Please try again.');

						});
				})
				.catch((err: any) => {
					console.error('buildHTML5ForExport:', err);

					reject('An error occured preparing the HTML5 Package. Please try again.');
				});

			// write script first and then write HTML
		});

	}

	public batchHTML5ForExportGetPrepData(dataBanner: any, stages: any[]): Promise<any> {

		//console.warn('batchHTML5ForExportGetPrepData:', dataBanner, stages);

		const newcomponents: any[] = [];

		// Get Difference between two Arrays of Objects
		function getDifference(array1: any, array2: any) {
			return array1.filter((object1: any) => {
				return !array2.some((object2: any) => {
					return object1.name === object2.name;
				});
			});
		}

		stages.forEach((stage: any) => {

			stage.variationComponents = [];

			if (stage.componentsUpdate !== undefined) {
				stage.componentsUpdate.forEach((componentUpdate: any) => {

					//https://stackoverflow.com/questions/46329213/angular4-copy-object-without-reference

					const newComponent = JSON.parse(JSON.stringify(stage.components[componentUpdate.componentIndex]));
					newComponent.componentmeta[componentUpdate.componentMetaIndex].value = componentUpdate.value;
					stage.components[componentUpdate.componentIndex] = newComponent;

					newcomponents.push(newComponent);

					stage.variationComponents.push(newComponent);

					/** /
					console.warn(
						'newComponent:',
						stage.counter,
						componentUpdate.value,
						newComponent.componentmeta[componentUpdate.componentMetaIndex].value,
						stage.components[componentUpdate.componentIndex]['componentmeta'][componentUpdate.componentMetaIndex]['value'],
						newComponent
					);
					/**/
				});
			} else {
				stage.variationComponents = JSON.parse(JSON.stringify(stage.components));
			}

			const missingcomponents = getDifference(stage.components, stage.variationComponents);

			//console.warn('missingcomponents:', missingcomponents);

			missingcomponents.forEach((missingcomponent: any) => {
				stage.variationComponents.push(missingcomponent);
			});

		});

		//const missingcomponents = getDifference(this.stage.children, stage.children);

		//console.warn('newcomponents:', newcomponents);

		return new Promise<any>((resolve, reject) => {

			this.resetData();

			let _script = '';
			//let _index = '';
			let localCSSImages: any[] = [];
			let localAssetImages: any[] = [];
			const localManifest: any[] = [];
			const localLib: any = {};

			Promise.all([
				this.getHTML5Fonts(stages),
				this.getHTML5ImageAssets(stages),
				this.prepLibraryProperties(dataBanner)
			])
				.then((results) => {

					//const localManifest:any[] = [];
					//const localLib:any = {};
					////console.log('buildHTML5ForExport:', results);

					localCSSImages = results[0];
					localAssetImages = results[1];

					results[0].forEach((font: any) => {
						localManifest.push({
							'id': this.generateUUID(),
							'src': font
						})
					});

					results[1].forEach((assetPath: any) => {

						/**/
						// rewrite image paths and to reference local directory

						const fileNameRegex = /(?:.+\/)(.+)/g;
						const na = fileNameRegex.exec(assetPath);

						let localPath: string;

						if (na !== null) {
							////console.log('path:', na?[1]);
							localPath = na?.[1];
						} else {
							localPath = assetPath;
						}
						/**/

						localManifest.push({
							'id': this.generateUUID(),
							'src': localPath
						});
					});

					localLib.properties = results[2];
					localLib.properties.manifest = localManifest;

					return this.generateHTML5scriptForBatch(dataBanner, stages, localManifest);

				})
				.then((scriptsFile) => {

					_script = scriptsFile;

					return this.generateHTML5Index(dataBanner);
				})
				.then((htmlIndex: any) => {

					//_index = htmlIndex;

					resolve({
						index: htmlIndex,
						script: _script,
						localLib: localLib,
						css: localCSSImages,
						images: localAssetImages,
						banner: dataBanner
					});

				})
				.catch((err: any) => {
					console.error('batchHTML5ForExport1:', err);

					reject('An error occurred preparing the HTML5 Package. Please try again.');
				});

		});

	}

	private prepLibraryProperties(dataBanner: any): Promise<any> {

		return new Promise<any>((resolve, reject) => {

			resolve({
				width: dataBanner.bannersize.width,
				height: dataBanner.bannersize.height,
				fps: 60,
				color: "#FFFFFF"
			});

		});
	}

	private getHTML5Fonts(stages: any[]): Promise<any> {

		return new Promise<any>((resolve, reject) => {

			const components = stages.map((stage: any) => { return (stage.components.filter((component: any) => { return component.componenttype.name === 'Text' })); })

			const fontIds: any[] = [];
			components.flat().forEach((component: any) => {
				const meta = component?.componentmeta.reduce((r: any, { name, value }: any) => (r[name] = value, r), {});
				const fontFamily = this.serviceDataFonts.find((font: FontType) => { return parseInt(font.id) === parseInt(meta.fontFamilyId); })?.styleSheet;

				////console.log('getHTML5Fonts component meta:', meta);

				if (fontFamily !== undefined && !fontIds.includes(fontFamily)) {
					fontIds.push(fontFamily);
					this.assets_css.push(fontFamily);
				}
			});

			if (fontIds.length > 0) {
				resolve(fontIds);
			} else {
				////console.log('No fonts found', fontIds);
				reject('Fonts Not Found');
			}

		});
	}

	private getHTML5ImageAssets(stages: any[]): Promise<any> {

		return new Promise<any>((resolve, reject) => {

			const components = stages.map((stage: any) => { return (stage.components.filter((component: any) => { return component.componenttype.name === 'Image' })); })

			const assets: any[] = [];
			components.flat().forEach((component: any) => {
				const meta = component?.componentmeta.reduce((r: any, { name, value }: any) => (r[name] = value, r), {});

				if (!assets.includes(meta.path)) {

					const fileNameRegex = /data:([-\w]+\/[-+\w.]+)?(;?\w+=[-\w]+)*(;base64)?,.*/gu;
					/**/
					const dataURIPath = fileNameRegex.exec(meta.path);
					if (dataURIPath !== null) {
						////console.log('dont add dataURIPath');
					} else {
						assets.push(meta.path);
						this.assets_images.push(meta.path);
					}
					/**/
					//assets.push(meta.path);
					//this.assets_images.push(meta.path);
				}
			});

			if (assets.length > 0) {
				resolve(assets);
			} else {
				////console.log('No fonts found', assets);
				reject('Image assets Not Found');
			}

		});
	}

	// HTTP Request to Gulp function
	private generateHTML5Index(dataBanner: any): Promise<any> {

		return new Promise<any>(async (resolve, reject) => {

			const response = await fetch(`${environment.apiUrl}/html5-canvas/index.html`);
			const data = await response.blob();
			const metadata = {
				//type: 'text/html',
				type: 'text/html; charset=utf-8'
			};
			const file = new File([data], "index.html", metadata);
			const FR2 = new FileReader();
			FR2.addEventListener("load", (fileLoadEvt: any) => {

				const widthReplace = new RegExp('{{width}}', 'g');
				const heightReplace = new RegExp('{{height}}', 'g');
				const creativeNameReplace = new RegExp('{{CreativeName}}', 'g');
				const creativeLinkReplace = new RegExp('{{CreativeLinkTag}}', 'g');
				const creativeExitName = new RegExp('{{ExitName}}', 'g');
				const creativeFallbackImageReplace = new RegExp('{{CreativeFallBackImage}}', 'g');
				const creativeAdPlatformReplace = new RegExp('{{creativeAdPlatform}}', 'g');

				let result = fileLoadEvt.target.result;

				result = result
					.replaceAll(widthReplace, dataBanner.bannersize.width)
					.replaceAll(heightReplace, dataBanner.bannersize.height)
					.replaceAll(creativeNameReplace, dataBanner.name)
					.replaceAll(creativeLinkReplace, (dataBanner.containers[(dataBanner.containers.length - 1)]?.clickThroughURL === null ? 'https://google.com' : dataBanner.containers[(dataBanner.containers.length - 1)]?.clickThroughURL))
					.replaceAll(creativeExitName, (dataBanner.containers[(dataBanner.containers.length - 1)]?.clickThroughName === null ? 'EXIT' : dataBanner.containers[(dataBanner.containers.length - 1)]?.clickThroughName))
					.replaceAll(creativeFallbackImageReplace, '')
					.replaceAll(creativeAdPlatformReplace, 'https://s0.2mdn.net/ads/studio/Enabler.js');
				//.replaceAll(creativeAdPlatformReplace, '//secure-ds.serving-sys.com/BurstingScript/EBLoader.js');

				//fileLoadEvt.target.result = fileLoadEvt.target.result.replaceAll(heightReplace, dataBanner.bannersize.height)

				////console.log('generateHTML5Index: ', result);

				resolve(result);

			});
			FR2.readAsText(file);

		});

	}

	private generateHTML5script(dataBanner: any, stages: any): Promise<any> {

		return new Promise<any>(async (resolve, reject) => {

			const response = await fetch(`${environment.apiUrl}/html5-canvas/cmdcreative.template.js`);
			const data = await response.blob();
			const metadata = {
				//type: 'text/html',
				type: 'application/javascript; charset=utf-8'
			};
			const file = new File([data], "cmdcreative.js", metadata);
			const FR2 = new FileReader();
			FR2.addEventListener("load", (fileLoadEvt: any) => {

				const widthReplace = new RegExp('{{width}}', 'g');
				const heightReplace = new RegExp('{{height}}', 'g');
				const libReplace = new RegExp('{{manifest}}', 'g');
				const stageReplace = new RegExp('{{ComponentsScripts}}', 'g');

				let result = fileLoadEvt.target.result;
				let componentStr = '';

				stages.forEach((stage: any, index: number) => {

					componentStr += `components.components_${index} = ${JSON.stringify(stage.components)};`;
					//componentStr += `\n\t${JSON.stringify(stage.components)}`;
				});

				result = result
					.replaceAll(widthReplace, dataBanner.bannersize.width)
					.replaceAll(heightReplace, dataBanner.bannersize.height)
					.replaceAll(libReplace, JSON.stringify(this.manifest))
					.replaceAll(stageReplace, componentStr);
				//.replaceAll(creativeAdPlatformReplace, '//secure-ds.serving-sys.com/BurstingScript/EBLoader.js');
				/**/
				resolve(result);

			});
			FR2.readAsText(file);

		});

	}

	private generateHTML5scriptForBatch(dataBanner: any, stages: any, manifest: any): Promise<any> {

		return new Promise<any>(async (resolve, reject) => {

			const response = await fetch(`${environment.apiUrl}/html5-canvas/cmdcreative.template.js`);
			const data = await response.blob();
			const metadata = {
				//type: 'text/html',
				type: 'application/javascript; charset=utf-8'
			};
			const file = new File([data], "cmdcreative.js", metadata);
			const FR2 = new FileReader();
			FR2.addEventListener("load", (fileLoadEvt: any) => {

				const widthReplace = new RegExp('{{width}}', 'g');
				const heightReplace = new RegExp('{{height}}', 'g');
				const libReplace = new RegExp('{{manifest}}', 'g');
				const stageReplace = new RegExp('{{ComponentsScripts}}', 'g');

				let result = fileLoadEvt.target.result;
				let componentStr = '';

				stages.forEach((stage: any, index: number) => {

					//console.warn('component string for stage: ', stage);

					componentStr += `components.components_${index} = ${JSON.stringify(stage.variationComponents)};`;
					//componentStr += `\n\t${JSON.stringify(stage.components)}`;
				});

				result = result
					.replaceAll(widthReplace, dataBanner.bannersize.width)
					.replaceAll(heightReplace, dataBanner.bannersize.height)
					.replaceAll(libReplace, JSON.stringify(manifest))
					.replaceAll(stageReplace, componentStr);
				//.replaceAll(creativeAdPlatformReplace, '//secure-ds.serving-sys.com/BurstingScript/EBLoader.js');
				/**/
				resolve(result);

			});
			FR2.readAsText(file);

		});

	}

	private generateZIPpackage(dataBanner: any): Promise<any> {

		const zip = new JSZip();

		return new Promise<any>((resolve, reject) => {

			//const zip_html = zip.folder('assets');
			//const zip_assets = zip.folder('assets');
			//const css_assets = zip.folder('assets/css');

			const blobs_css: any[] = [];
			const blobs_images: any[] = [];

			//console.warn('this_assets_images: ', this.assets_images);

			this.assets_images.forEach((path_image: string) => {

				blobs_images.push(
					this.readImageFilePath(path_image)
				);
			});
			/** /
			this.assets_css.forEach((path_css:string) => {

				blobs_css.push(
					this.readStylesheetFilePath(path_css)
				);
			});
			/**/

			Promise.all(blobs_images)
				.then((blobs_images: any[]) => {
					blobs_images.forEach((blob: any, index: number) => {
						zip.file(blob.name, blob.blob);
						//zip_assets?.file( blob.name, blob.blob);
					});

					////console.log('this._script', JSON.stringify(this._script[0].components));
					zip.file("index.html", this._index);
					zip.file("cmdcreative.js", this._script);
					//zip.file("cmdcreative.js", objToString(this._script, 5));
					//zip.file("cmdcreative.js", btoa(JSON.stringify(this._script[0])));

					zip.generateAsync({ type: "blob" })
						.then((blobs: any) => {
							resolve(blobs)
							saveAs(blobs, `HTML_Preview_${dataBanner.name}.zip`)
						});

				});

		});

	}

	public generateBatchZIPpackage(batchFileContents: any): Promise<any> {

		return new Promise<any>((resolve, reject) => {

			const zip = new JSZip();

			const blobs_css: any[] = [];
			const blobs_images: any[] = [];

			//console.warn('this_assets_images: ', this.assets_images);

			batchFileContents.images.forEach((path_image: string) => {

				blobs_images.push(
					this.readImageFilePath(path_image)
				);
			});

			Promise.all(blobs_images)
				.then((blobs_images: any[]) => {
					blobs_images.forEach((blob: any, index: number) => {
						zip.file(blob.name, blob.blob);
					});

					zip.file("index.html", batchFileContents.index);
					zip.file("cmdcreative.js", batchFileContents.script);

					zip.generateAsync({ type: "blob" })
						.then((blobs: any) => {
							////console.log('generateBatchZIPpackage complete:', blobs);
							resolve({
								name: batchFileContents.banner.bannersize.name,
								blob: blobs
							});
							//saveAs(blobs, `HTML_Preview_${dataBanner.name}.zip`)
						});

				});

		});

	}

	private readImageFilePath(path: string): Promise<Blob> {

		return new Promise<any>(async (resolve, reject) => {

			const response = await fetch(path);
			const data = await response.blob();
			const metadata = {
				type: data.type
			};

			const fileNameRegex = new RegExp(/(?:.+\/)(.+)/g);
			const fileName = fileNameRegex.exec(path)?.[1];

			resolve({
				name: fileName,
				blob: data
			});

		});

	}

	private readStylesheetFilePath(path: string): Promise<Blob> {

		return new Promise<any>(async (resolve, reject) => {

			const response = await fetch(path);
			const data = await response.blob();
			const metadata = {
				type: 'text/css'
			};

			//console.log('readStylesheetFilePath: ', data);

			const file = new File([data], "test.css", metadata);

			const FR2 = new FileReader();
			FR2.addEventListener("load", (cssLoadEvt: any) => {

				resolve(URL.createObjectURL(cssLoadEvt.target.result))

			});

			FR2.readAsDataURL(file);

		});

	}

	// CLASSES FOR CREATIVE COMPONENTS
	public animateGSAPComponent(stage: createjs.Stage, component: any): Promise<any[]> {

		return new Promise<any[]>((resolve, reject) => {

			const displayObj = stage.getChildByName(component.name.toLowerCase());

			//const instanceTimeline = gsap.timeline();
			const tweens: any[] = [];

			component.animations.forEach((animation: any, index: number) => {

				const animationmeta = animation.animationmeta.reduce((r: any, { name, value }: any) => (r[name] = value, r), {});

				if (animationmeta.duration === 0) {

					const setValues = gsap.set(
						displayObj,
						{
							x: parseInt(animationmeta.positionX),
							y: parseInt(animationmeta.positionY),
							alpha: parseInt(animationmeta.opacity),
							ease: "power3.out",
							paused: false
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
							paused: false
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

			////console.log('animateGSAPComponent:', instanceTimeline);
			//resolve(instanceTimeline);

			////console.log('animateGSAPComponent:', tweens);

			resolve(tweens);

		});
	}

	public BAPP_Image = class BAPP_Image extends createjs.Bitmap {

		override name: string;
		public meta: any;
		public sortid: any;
		public positionLock = true;
		override cursor: string;
		private bounds: any;

		//private img: HTMLImageElement = new Image();

		constructor(stage: createjs.Stage, component: any, componentMeta: any) {
			super(
				new Image()
				//componentMeta.path
			);
			this.cursor = 'pointer';
			this.name = component.name.toLowerCase();
			this.meta = componentMeta;

			this.setup(stage, component);
			this.configIDData(component);
		}

		private setup = (stage: createjs.Stage, component: any) => {

			const width = this.meta.width,
				height = this.meta.height,
				positionX = this.meta.positionX,
				positionY = this.meta.positionY,
				zIndex = this.meta.zIndex,
				id = this.meta.zIndex;

			const path_image = this.meta.path;

			//const loadedImage = this.readImageFilePath( path_image );
			//this.image = loadedImage;

			this.readImageFilePath(path_image)
				.then((imgLoaded: HTMLImageElement) => {

					this.image = imgLoaded;
					this.scaleX = width / this.image.width;
					this.scaleY = height / this.image.height;

					this.x = positionX;
					this.y = positionY;

					if (this.getBounds() !== null) {
						this.bounds = this.getBounds();
					}

					const bounds = this.bounds;

					const hit = new createjs.Shape();
					hit.graphics.beginFill("#000")
						.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
					this.hitArea = hit;

					stage.update();

				});

			this.id = parseInt(zIndex);
			this.sortid = parseInt(id);

		}

		private configIDData = (component: any): void => {

			this.set({ componentId: parseInt(component.id) });
			this.set({ smart: component.smart });
			this.set({ componentMetaId: parseInt(component.componentmeta.find((x: any) => x.name === 'path').id) });

		}

		private readImageFilePath = async (path_image: string) => <HTMLImageElement>await new Promise(async (resolve, reject) => {
			//private readImageFilePath = async (path_image:string) =>  {

			const response = await fetch(path_image);
			const data = await response.blob();
			const metadata = {
				type: 'image/jpeg'
			};
			const file = new File([data], "test.jpg", metadata);

			const FR2 = new FileReader();

			FR2.addEventListener("load", (imageLoadEvt: any) => {
				const img = new Image();
				img.addEventListener("load", () => {

					//return img;
					resolve(img);

				});
				img.src = imageLoadEvt.target.result;
			});

			FR2.readAsDataURL(file);

		});

		public updatePositioning = (component: any) => {

			this.meta = component.componentmeta;

			const width = this.meta.width,
				height = this.meta.height,
				positionX = this.meta.positionX,
				positionY = this.meta.positionY,
				zIndex = this.meta.zIndex,
				id = this.meta.zIndex;

			this.scaleX = width / this.image.width;
			this.scaleY = height / this.image.height;

			this.x = positionX;
			this.y = positionY;

			this.id = parseInt(zIndex);
			this.sortid = parseInt(id);

		}

		public updateImage = (component: any): Promise<any> => {

			return new Promise<any>((resolve, reject) => {

				this.meta = component.componentmeta;

				const path_image = this.meta.dataFile;
				const FR2 = new FileReader();

				FR2.addEventListener("load", (imageLoadEvt: any) => {
					const img = new Image();
					img.addEventListener("load", () => {

						this.image = img;

						this.scaleX = this.meta.width / this.image.width;
						this.scaleY = this.meta.height / this.image.height;

						this.x = this.meta.positionX;
						this.y = this.meta.positionY;

						this.id = parseInt(this.meta.zIndex);
						this.sortid = parseInt(this.meta.zIndex);

						//stage.update();
						//stage.setChildIndex( this, this.id );

						resolve(true);

					});
					img.src = imageLoadEvt.target.result;
				});

				FR2.readAsDataURL(path_image);

			});

		}

		public center = (stage: createjs.Stage) => {
			const bounds = this.getBounds();
			const currCanvas = stage.canvas as any;

			this.x = currCanvas.width - bounds.width >> 1;
			this.y = currCanvas.height - bounds.height >> 1;

			stage.update();
		}

		public interact = (stage: createjs.Stage) => {

			this.on("mouseover", (evt: any) => {

				this.mousePointerInteraction();

				this.alpha = 0.5;
				/** /
				gsap.to(
					evt.target,
					{
						duration: 0.25,
						alpha: 0.5
					}
				);
				/**/

				stage.update();
			});

			this.on("mouseout", (evt: any) => {
				this.alpha = 1;
				stage.update();
			});

			this.on("mousedown", (evt: any) => {

				// keep a record on the offset between the mouse position and the container
				// position. currentTarget will be the container that the event listener was added to:
				evt.currentTarget.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
			});

			this.on("pressmove", (evt: any) => {

				if (this.positionLock === false) {

					this.cursor = 'grabbing';

					/** /
					evt.target.x = evt.stageX - (parseInt(this.meta.width)/2);
					evt.target.y = evt.stageY - (parseInt(this.meta.height)/2);

					stage.update();
					/**/
					evt.target.x = evt.stageX + evt.currentTarget.offset.x;
					evt.target.y = evt.stageY + evt.currentTarget.offset.y;

					this.meta.positionX = evt.target.x.toFixed(0);
					this.meta.positionY = evt.target.y.toFixed(0);

					stage.update();

					stage.dispatchEvent({
						'type': 'component.update',
						'eventData': evt,
						'component': this
					});

				} else {

					//console.log('Image is locked');
				}

			});


		}

		private mousePointerInteraction = (): void => {
			if (this.positionLock === false) {
				this.cursor = 'grab';
			} else {
				this.cursor = 'pointer';
			}
		}
	}

	public BAPP_Text = class BAPP_Text extends createjs.Text {

		override name: string;
		override cursor: string;
		public meta: any;
		public sortid: any;
		public positionLock = true;

		private bounds: any;

		constructor(component: any, componentMeta: any) {
			super(
				componentMeta.fontValue,
				componentMeta.fontStyle + " " + componentMeta.fontWeight + " " + componentMeta.fontSize + "px " + componentMeta.fontFamily + "",
				componentMeta.fontColour
			);
			this.name = component.name.toLowerCase();
			this.meta = componentMeta;
			this.cursor = 'pointer';

			this.setup(component);
			this.configIDData(component);
		}

		override getMeasuredHeight(): number {
			const bounds = this.getBounds();
			return bounds.height;
		}

		override getMeasuredWidth(): number {
			const bounds = this.getBounds();
			////console.log('getMeasuredWidth['+this.name+']:', bounds);
			return bounds.width;
		}

		private setup = (component: any) => {

			const width = this.meta.width,
				height = this.meta.height,
				positionX = this.meta.positionX,
				positionY = this.meta.positionY,
				zIndex = this.meta.zIndex,
				id = this.meta.zIndex;

			const
				//text_size 			= this.meta.fontSize,
				text_LineHeight = this.meta.fontLineHeight,
				//text_colour 		= this.meta.fontColour,
				//text_family 		= this.meta.fontFamily,
				//text_weight 		= this.meta.fontWeight,
				//text_style			= this.meta.fontStyle,
				text_align = this.meta.textAlign,
				text_value = this.meta.fontValue;

			this.maxWidth = parseInt(width);
			this.lineWidth = parseInt(width);
			this.lineHeight = text_LineHeight;
			this.textAlign = text_align;
			this.textBaseline = "alphabetic";

			this.x = positionX;
			this.y = positionY;

			this.text = text_value;

			this.id = parseInt(zIndex);
			this.sortid = parseInt(id);

			if (this.getBounds() !== null) {
				this.bounds = this.getBounds();
			}

			const bounds = this.bounds;

			////console.log('setting up text:', component, bounds, this);

			// create a rectangle shape the same size as the text, and assign it as the hitArea
			// note that it is never added to the display list.
			const hit = new createjs.Shape();
			hit.graphics.beginFill("#000")
				//.setStrokeStyle(1)
				//.beginStroke("#FFF")
				.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
			//hit.x = this.x;
			//hit.y = this.y;
			this.hitArea = hit;
		}

		private configIDData = (component: any): void => {

			this.set({ componentId: parseInt(component.id) });
			this.set({ smart: component.smart });
			this.set({ componentMetaId: parseInt(component.componentmeta.find((x: any) => x.name === 'fontValue').id) });

		}

		public update = (component: any) => {

			this.meta = component.componentmeta;
			this.font = this.meta.fontStyle + " " + this.meta.fontWeight + " " + this.meta.fontSize + "px " + this.meta.fontFamily + "";
			this.color = this.meta.fontColour;
			this.setup(component);
		}

		public center = (stage: createjs.Stage) => {
			const bounds = this.getBounds();
			const currCanvas = stage.canvas as any;

			this.x = currCanvas.width - bounds.width >> 1;
			this.y = currCanvas.height - bounds.height >> 1;

			stage.update();
		}

		public interact = (stage: createjs.Stage) => {

			this.on("mouseover", (evt: any) => {
				this.mousePointerInteraction();
				this.alpha = 0.5;
				stage.update();
			});

			this.on("mouseout", (evt: any) => {
				this.alpha = 1;
				stage.update();
			});

			this.on("mousedown", (evt: any) => {

				// keep a record on the offset between the mouse position and the container
				// position. currentTarget will be the container that the event listener was added to:
				evt.currentTarget.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
			});

			this.on("pressmove", (evt: any) => {

				if (this.positionLock === false) {

					this.cursor = 'grabbing';

					/*
					evt.target.x = evt.stageX;
					evt.target.y = evt.stageY;
					/**/
					// Calculate the new X and Y based on the mouse new position plus the offset.
					evt.target.x = evt.stageX + evt.currentTarget.offset.x;
					evt.target.y = evt.stageY + evt.currentTarget.offset.y;

					this.meta.positionX = evt.target.x.toFixed(0);
					this.meta.positionY = evt.target.y.toFixed(0);

					stage.update();

					stage.dispatchEvent({
						'type': 'component.update',
						'eventData': evt,
						'component': this
					});

				} else {

					//console.log('Text is locked');
				}

			});


		}

		private mousePointerInteraction = (): void => {
			if (this.positionLock === false) {
				this.cursor = 'grab';
			} else {
				this.cursor = 'pointer';
			}
		}

	}

	public BAPP_Shape = class BAPP_Shape extends createjs.Shape {

		override name: string;
		override cursor: string;
		public meta: any;
		public sortid: any;
		public positionLock = true;

		constructor(component: any) {
			super();

			//this.meta = component.componentmeta;
			this.cursor = 'pointer';
			this.name = component.name.toLowerCase();
			this.meta = component.componentmeta.reduce((r: any, { name, value }: any) => (r[name] = value, r), {});
			this.sortid = parseInt(this.meta.zIndex);
			this.setup(component);
			this.configIDData(component);
		}

		private setup = (component: any) => {
			const
				width = this.meta.width,
				height = this.meta.height,
				positionX = this.meta.positionX,
				positionY = this.meta.positionY,
				zIndex = this.meta.zIndex,
				id = this.meta.zIndex,
				shapeColour = this.meta.shapeColour;


			const shape_obj = new createjs.Graphics().beginFill(shapeColour).drawRect(0, 0, width, height);
			//var component_shape = new createjs.Shape(shape_obj);

			this.graphics = shape_obj;
			this.x = positionX;
			this.y = positionY;

			this.id = parseInt(zIndex);
			this.sortid = parseInt(id);
		}

		private configIDData = (component: any): void => {

			this.set({ componentId: parseInt(component.id) });
			this.set({ smart: component.smart });
			this.set({ componentMetaId: parseInt(component.componentmeta.find((x: any) => x.name === 'shapeColour').id) });

		}

		public update = (component: any) => {

			this.meta = component.componentmeta;
			this.setup(component);
		}

		public center = (stage: createjs.Stage) => {
			const bounds = this.getBounds();
			const currCanvas = stage.canvas as any;

			this.x = currCanvas.width - bounds.width >> 1;
			this.y = currCanvas.height - bounds.height >> 1;

			stage.update();
		}

		public interact = (stage: createjs.Stage) => {

			this.on("mouseover", (evt: any) => {
				this.mousePointerInteraction();
				this.alpha = 0.5;
				stage.update();
			});

			this.on("mouseout", (evt: any) => {
				this.alpha = 1;
				stage.update();
			});

			this.on("mousedown", (evt: any) => {

				// keep a record on the offset between the mouse position and the container
				// position. currentTarget will be the container that the event listener was added to:
				evt.currentTarget.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
			});

			this.on("pressmove", (evt: any) => {

				if (this.positionLock === false) {

					this.cursor = 'grabbing';

					// Calculate the new X and Y based on the mouse new position plus the offset.
					evt.target.x = evt.stageX + evt.currentTarget.offset.x;
					evt.target.y = evt.stageY + evt.currentTarget.offset.y;

					this.meta.positionX = evt.target.x.toFixed(0);
					this.meta.positionY = evt.target.y.toFixed(0);

					stage.update();

					stage.dispatchEvent({
						'type': 'component.update',
						'eventData': evt,
						'component': this
					});


				} else {

					//console.log('Shape is locked');
				}

			});


		}

		private mousePointerInteraction = (): void => {
			if (this.positionLock === false) {
				this.cursor = 'grab';
			} else {
				this.cursor = 'pointer';
			}
		}

	}

	public BAPP_Button = class BAPP_Button extends createjs.Container {

		override name: string;
		public meta: any;
		public sortid: any;
		public positionLock = true;

		private bounds: any;

		shape!: createjs.Shape;
		text!: createjs.Text;
		graphic!: createjs.Graphics;

		constructor(component: any) {
			super();

			this.cursor = 'pointer';
			this.name = component.name.toLowerCase();
			this.meta = component.componentmeta.reduce((r: any, { name, value }: any) => (r[name] = value, r), {});
			this.sortid = parseInt(this.meta.zIndex);
			this.setup(component);
			this.configIDData(component);

			this.mouseChildren = false;
		}

		private setup = (component: any) => {

			this.x = this.meta.positionX;
			this.y = this.meta.positionY;

			this.setupText();

			this.addChild(this.shape);
			this.setChildIndex(this.shape, 1);

			this.addChild(this.text);
			this.setChildIndex(this.text, 2);

			this.id = parseInt(this.meta.zIndex);
			this.sortid = parseInt(this.meta.zIndex);
		}

		private setupText = () => {

			const
				width = this.meta.width,
				height = this.meta.height,
				text_size = this.meta.fontSize,
				text_LineHeight = this.meta.fontLineHeight,
				text_colour = this.meta.fontColour,
				text_family = this.meta.fontFamily,
				text_weight = this.meta.fontWeight,
				text_style = this.meta.fontStyle,
				text_align = this.meta.textAlign,
				text_value = this.meta.fontValue;

			this.text = new createjs.Text(
				text_value,
				text_style + " " + text_weight + " " + text_size + "px " + text_family + "",
				text_colour
			);

			this.text.maxWidth = parseInt(width);
			this.text.lineWidth = parseInt(width);
			this.text.lineHeight = text_LineHeight;
			this.text.textAlign = text_align;
			//this.text.textBaseline = "top";
			this.text.textBaseline = "alphabetic";

			//const bounds = this.text.getBounds();

			if (this.text.getBounds() !== null) {
				this.bounds = this.text.getBounds();
			}

			const bounds = this.bounds;

			// create a rectangle shape the same size as the text, and assign it as the hitArea
			// note that it is never added to the display list.
			const hit = new createjs.Shape();
			hit.graphics.beginFill("#000")
				.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
			this.text.hitArea = hit;
			this.hitArea = hit;

			this.setupShape(bounds);

		}

		private setupShape = (bounds: any) => {

			const buttonColour = this.meta.shapeColour,
				shapeRadiusTL = this.meta.shapeRadiusTL,
				shapeRadiusTR = this.meta.shapeRadiusTR,
				shapeRadiusBR = this.meta.shapeRadiusBR,
				shapeRadiusBL = this.meta.shapeRadiusBL,
				shapePaddingTop = parseInt(this.meta.shapePaddingTop),
				shapePaddingRight = parseInt(this.meta.shapePaddingRight),
				shapePaddingBottom = parseInt(this.meta.shapePaddingBottom),
				shapePaddingLeft = parseInt(this.meta.shapePaddingLeft);

			const BtnWidth = bounds.width + shapePaddingRight + shapePaddingLeft;
			const TextHeight = bounds.height + shapePaddingTop + shapePaddingBottom;

			const cx = BtnWidth - bounds.width >> 1;
			const cy = TextHeight - bounds.height >> 1;

			this.shape = new createjs.Shape();
			this.shape.graphics
				.beginFill(buttonColour)
				.drawRoundRectComplex(bounds.x - cx, bounds.y - cy, BtnWidth, TextHeight, shapeRadiusTL, shapeRadiusTR, shapeRadiusBR, shapeRadiusBL);

		}

		private configIDData = (component: any): void => {

			this.set({ componentId: parseInt(component.id) });
			this.set({ smart: component.smart });
			this.set({ componentMetaId: parseInt(component.componentmeta.find((x: any) => x.name === 'fontValue').id) });

		}

		public update = (component: any) => {

			this.meta = component.componentmeta;

			this.x = this.meta.positionX;
			this.y = this.meta.positionY;

			this.removeAllChildren()

			this.setupText();

			this.addChild(this.shape);
			this.setChildIndex(this.shape, 1);

			this.addChild(this.text);
			this.setChildIndex(this.text, 2);

			this.id = parseInt(this.meta.zIndex);
			this.sortid = parseInt(this.meta.zIndex);

			////console.log('Updating Button:', this);
		}

		public center = (stage: createjs.Stage) => {
			const bounds = this.getBounds();
			const currCanvas = stage.canvas as any;

			this.x = currCanvas.width - bounds.width >> 1;
			this.y = currCanvas.height - bounds.height >> 1;

			stage.update();
		}

		public interact = (stage: createjs.Stage) => {

			this.on("mouseover", (evt: any) => {
				this.mousePointerInteraction();
				this.alpha = 0.5;
				stage.update();
			});

			this.on("mouseout", (evt: any) => {
				this.alpha = 1;
				stage.update();
			});

			this.on("mousedown", (evt: any) => {

				// keep a record on the offset between the mouse position and the container
				// position. currentTarget will be the container that the event listener was added to:
				evt.currentTarget.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
			});

			this.on("pressmove", (evt: any) => {

				if (this.positionLock === false) {

					this.cursor = 'grabbing';

					evt.target.x = evt.stageX + evt.currentTarget.offset.x;
					evt.target.y = evt.stageY + evt.currentTarget.offset.y;

					this.meta.positionX = evt.target.x.toFixed(0);
					this.meta.positionY = evt.target.y.toFixed(0);

					stage.update();

					stage.dispatchEvent({
						'type': 'component.update',
						'eventData': evt,
						'component': this
					});

				} else {

					//console.log('Button is locked');
				}

			});
		}

		private mousePointerInteraction = (): void => {
			if (this.positionLock === false) {
				this.cursor = 'grab';
			} else {
				this.cursor = 'pointer';
			}
		}

	}

	private generateUUID() { // Public Domain/MIT
		let d = new Date().getTime();//Timestamp
		let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			let r = Math.random() * 16;//random number between 0 and 16
			if (d > 0) {//Use timestamp until depleted
				r = (d + r) % 16 | 0;
				d = Math.floor(d / 16);
			} else {//Use microseconds since page-load if supported
				r = (d2 + r) % 16 | 0;
				d2 = Math.floor(d2 / 16);
			}
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	}

}
