(function (lib, components, img, cjs, ss) {

	var p; // shortcut to reference prototypes

	// library properties:
	//lib = {};
	lib.properties = {
		width: {{width}},
		height: {{height}},
		fps: 60,
		color: "#FFFFFF",
		manifest: {{manifest}}
	};

	//lib.components = {};

	{{ComponentsScripts}}

	// ***************************/
	// GENERATOR CLASSES
	// ***************************/

	(lib.BAPP_Frame = function(name, components, mode, startPosition, loop  ) {

		this.Container_constructor();

		this.name = name.toLowerCase();

		this.x = 0;
		this.y = 0;
		this.setBounds(0,0,{{width}},{{height}});

		/**/
		var sortFunction = function(obj1, obj2, options) {
			//console.log('sortFunction', obj1.name, obj1.sortid);
			//console.log('sortFunction', obj2.name, obj2.sortid);

			if (obj1.sortid < obj2.sortid) { return -1; }
			if (obj1.sortid > obj2.sortid) { return 1; }
			if (obj1.sortid === obj2.sortid) { return 0; }

			//console.log('sorted', obj1.name, obj2.name, obj1.sortid > obj2.sortid);
			//return 0;
			//return obj1.sortid - obj2.sortid;
		}

		// Optimized implementation of bubble sort Algorithm

		function bubbleSort(a, par)
		{
			var swapped;
			do {
				swapped = false;
				for (var i = 0; i < a.length - 1; i++) {
					if (a[i][par] > a[i + 1][par]) {
						var temp = a[i];
						a[i] = a[i + 1];
						a[i + 1] = temp;
						swapped = true;
					}
				}
			} while (swapped);

			return a;
		}

		var newchildren = [];

		for (var index = 0; index < components.length; index++) {
			var frameComponent = components[index];

			if( frameComponent.componenttype.name == 'Text' ) {

				var new1 = new lib.BAPP_Text(frameComponent);
				newchildren.push(new1);

			} else if( frameComponent.componenttype.name == 'Image' ) {

				var new1 = new lib.BAPP_Image(frameComponent);
				newchildren.push(new1);

			} else if( frameComponent.componenttype.name == 'Shape' ) {

				var new1 = new lib.BAPP_Shape(frameComponent);
				newchildren.push(new1);

			} else if( frameComponent.componenttype.name == 'Button' ) {

				var new1 = new lib.BAPP_Button(frameComponent);
				newchildren.push(new1);

			}
		}

		newchildren = bubbleSort(newchildren, 'sortid');

		this.GSAPTimeline = gsap.timeline({repeat: 0, repeatDelay: 0});

		//console.warn('newchildren-bubble', newchildren);

		for( var i = 0; i < newchildren.length; i++ ) {
			var elem = newchildren[i];
			if( elem.anim8Tween ) {
				for( var j = 0; j < elem.anim8Tween.length; j++ ) {
					var anim8 = elem.anim8Tween[j];

					this.GSAPTimeline.add(anim8.tween, anim8.position);
				}
			}
			this.addChild(elem);
		}


	}).prototype = p = cjs.extend(lib.BAPP_Frame, cjs.Container);
	lib.BAPP_Frame = cjs.promote(lib.BAPP_Frame, "Container");

	// GEN.CLASS INSTANCES: SHAPE + TEXT <Container>
	(lib.BAPP_Button = function(component) {
		this.Container_constructor();

		this.name = component.name.toLowerCase();
		this.meta = component.componentmeta.reduce((r,{name,value}) => (r[name]=value,r), {});
		this.sortid = parseInt(this.meta.zIndex);
		this.setupButton();

		if( component.animations.length > 0 ) {
			this.setupAnimations( component.animations );
		}

	}).prototype = p = cjs.extend(lib.BAPP_Button, cjs.Container);
	lib.BAPP_Button = cjs.promote(lib.BAPP_Button, "Container");

	// GEN.CLASS INSTANCES: SHAPE<Shape>
	(lib.BAPP_Shape = function(component) {

		this.Shape_constructor();

		this.name = component.name.toLowerCase();
		this.meta = component.componentmeta.reduce((r,{name,value}) => (r[name]=value,r), {});
		this.sortid = parseInt(this.meta.zIndex);
		this.setupShape();

		if( component.animations.length > 0 ) {
			this.setupAnimations( component.animations );
		}

	}).prototype = p = cjs.extend(lib.BAPP_Shape, cjs.Shape);
	lib.BAPP_Shape = cjs.promote(lib.BAPP_Shape, "Shape");

	// GEN.CLASS INSTANCES: SHAPE<Shape>
	(lib.BAPP_Border = function(component) {

		this.Shape_constructor();

		this.name = component.name.toLowerCase();
		this.meta = component.componentmeta.reduce((r,{name,value}) => (r[name]=value,r), {});
		this.sortid = parseInt(this.meta.zIndex);
		this.setupBorder();

		if( component.animations.length > 0 ) {
			this.setupAnimations( component.animations );
		}

	}).prototype = p = cjs.extend(lib.BAPP_Border, cjs.Shape);
	lib.BAPP_Border = cjs.promote(lib.BAPP_Border, "Shape");

	// GEN.CLASS INSTANCES: BITMAP<Bitmap>
	(lib.BAPP_Image = function(component) {

		this. Bitmap_constructor();

		this.name = component.name.toLowerCase();
		this.meta = component.componentmeta.reduce((r,{name,value}) => (r[name]=value,r), {});
		this.sortid = parseInt(this.meta.zIndex);

		this.setupImage();

		if( component.animations.length > 0 ) {
			this.setupAnimations( component.animations );
		}

	}).prototype = p = cjs.extend(lib.BAPP_Image, cjs.Bitmap);
	lib.BAPP_Image = cjs.promote(lib.BAPP_Image, "Bitmap");

	// GEN.CLASS INSTANCES: TEXT<Text>
	(lib.BAPP_Text = function(component) {

		this.Text_constructor();

		this.name = component.name.toLowerCase();
		this.meta = component.componentmeta.reduce((r,{name,value}) => (r[name]=value,r), {});
		this.sortid = parseInt(this.meta.zIndex);

		this.setupText();

		if( component.animations.length > 0 ) {
			this.setupAnimations( component.animations );
		}

	}).prototype = p = cjs.extend(lib.BAPP_Text, cjs.Text);
	lib.BAPP_Text = cjs.promote(lib.BAPP_Text, "Text");

	// ***************************/
	// MAIN TIMELINE
	// ***************************/

	(lib.cmdCreativeAD = function( components ) {
		this.Container_constructor();
		this.x = 0;
		this.y = 0;
		this.setBounds(0,0,{{width}},{{height}});

		var frameCounter = 0;
		var timeCounter = 0;
		var repeating = false;
		var NoofFrames = Object.keys(components);

		var mainMC = this;

		function playFrame() {

			if ( NoofFrames[frameCounter] ) {

				if( repeating === false ) {

					var element = components[NoofFrames[frameCounter]];

					var frame = new lib.BAPP_Frame('Frame_' + frameCounter, element);

					mainMC.addChild(frame);

					frame.GSAPTimeline.eventCallback("onComplete", onCompletion, [frameCounter, frame]);
					frame.GSAPTimeline.play();

				} else {

					var frame = mainMC.getChildByName('frame_' + frameCounter);

					if( frameCounter === 0 ) {
						gsap.to(frame, {alpha: 1, duration: 0.25, ease: "power3.out" });
					} else {
						gsap.set(frame, {alpha: 1 });
					}

					frame.GSAPTimeline.eventCallback("onComplete", onCompletion, [frameCounter, frame]);
					frame.GSAPTimeline.restart();

				}

				function onCompletion(frameCounterEvt, frameEvt) {

					frame.GSAPTimeline.eventCallback("onComplete", null);

					var creativeTimer = setTimeout(function(){

						if ( NoofFrames[(frameCounter +1)] ) {

							console.warn('Frame Timeline complete', frameCounterEvt);
							//frame.visible = false;

							frameCounter++;

							playFrame();

							gsap.to(frameEvt, {alpha: 0, duration: 0.5, ease: "power2.inOut" });

						} else {

							if ( timeCounter >= 1 ) {

								console.warn('Creative DONE DONE!');

								clearTimeout(creativeTimer);

							} else {

								timeCounter++;
								frameCounter = 0;

								console.warn('Creative 1st Round');

								var creativeRepeat = setTimeout(function(evt){

									repeating = true;

									playFrame();

									gsap.to(frameEvt, {alpha: 0, duration: 0.5, ease: "power2.inOut" });

									clearTimeout(creativeRepeat);

								}, 2500 );
							}

						}

					}, 0 );

				}
			}
		}

		playFrame();

	}).prototype = p = cjs.extend(lib.cmdCreativeAD, cjs.Container);
	lib.cmdCreativeAD = cjs.promote(lib.cmdCreativeAD, "Container");


	// ***************************/
	// PROTOTYPE FUNCTIONS
	// ***************************/

	lib.BAPP_Text.prototype.setupText = function() {

		var width 		= this.meta.width,
			height 		= this.meta.height,
			positionX 	= this.meta.positionX,
			positionY 	= this.meta.positionY,
			zIndex 		= this.meta.zIndex,
			id			= this.meta.zIndex;

		var fontValue 	= this.meta.fontValue,
			fontSize 	= this.meta.fontSize,
			fontLineHeight 	= this.meta.fontLineHeight,
			fontColour 		= this.meta.fontColour,
			fontFamily 		= this.meta.fontFamily,
			fontWeight 		= this.meta.fontWeight,
			fontStyle 		= this.meta.fontStyle,
			textAlign 		= this.meta.textAlign;

		this.color = fontColour;
		//this.color = '#000000';
		this.maxWidth = width;
		this.lineWidth = width;
		this.lineHeight = fontLineHeight;
		this.textAlign = textAlign;
		this.textBaseline = "alphabetic";

		this.x = positionX;
		this.y = positionY;

		this.font = fontStyle + " " + fontWeight + " " + fontSize +"px " + fontFamily + "";
		this.text = fontValue;

		this.sortid = parseInt(id);

		this.mouseChildren = false;

		//this.addChild(canvasText);
		//this.setChildIndex( canvasText, zIndex );

	}

	lib.BAPP_Button.prototype.setupButton = function() {

		var width 		= this.meta.width,
			height 		= this.meta.height,
			positionX 	= this.meta.positionX,
			positionY 	= this.meta.positionY,
			zIndex 		= this.meta.zIndex,
			id			= this.meta.zIndex;

		var buttonColour = this.meta.shapeColour,
			shapeRadiusTL = parseInt(this.meta.shapeRadiusTL),
			shapeRadiusTR = parseInt(this.meta.shapeRadiusTR),
			shapeRadiusBR = parseInt(this.meta.shapeRadiusBR),
			shapeRadiusBL = parseInt(this.meta.shapeRadiusBL),
			shapePaddingTop = parseInt(this.meta.shapePaddingTop),
			shapePaddingRight = parseInt(this.meta.shapePaddingRight),
			shapePaddingBottom = parseInt(this.meta.shapePaddingBottom),
			shapePaddingLeft = parseInt(this.meta.shapePaddingLeft);

		var fontValue 	= this.meta.fontValue,
			fontSize 	= this.meta.fontSize,
			fontLineHeight 	= this.meta.fontLineHeight,
			fontColour 		= this.meta.fontColour,
			fontFamily 		= this.meta.fontFamily,
			fontWeight 		= this.meta.fontWeight,
			fontStyle 		= this.meta.fontStyle,
			textAlign 		= this.meta.textAlign;

		var canvasText = new createjs.Text( fontValue, fontStyle + " " + fontWeight + " " + fontSize +"px " + fontFamily + "", fontColour );

		canvasText.maxWidth = width;
		canvasText.lineWidth = width;
		canvasText.lineHeight = fontLineHeight;
		canvasText.textAlign = textAlign;
		canvasText.textBaseline = "alphabetic";

		this.x = positionX;
		this.y = positionY;

		var bounds = canvasText.getBounds();

		//BUTTON SHAPE
		var BtnWidth = bounds.width + shapePaddingRight + shapePaddingLeft;
		var TextHeight = bounds.height + shapePaddingTop + shapePaddingBottom;

		var cx = BtnWidth - bounds.width >> 1;
		var cy = TextHeight - bounds.height >> 1;

		var shape = new createjs.Shape();
		shape.graphics
				.beginFill(buttonColour)
				.drawRoundRectComplex (bounds.x - cx, bounds.y - cy, BtnWidth, TextHeight, shapeRadiusTL, shapeRadiusTR, shapeRadiusBR, shapeRadiusBL);

		// ADD TO CONTAINER
		this.addChild(shape);
		this.setChildIndex( shape, 1 );

		this.addChild(canvasText);
		this.setChildIndex( canvasText, 2 );

		this.sortid = parseInt(id);

	}

	lib.BAPP_Border.prototype.setupBorder = function() {

		var width 		= this.meta.width,
			height 		= this.meta.height,
			positionX 	= this.meta.positionX,
			positionY 	= this.meta.positionY,
			zIndex 		= this.meta.zIndex,
			id			= this.meta.zIndex;

		var shapeColour = this.meta.shapeColour;

		var border_obj = new createjs.Graphics()
				.setStrokeStyle(1)
				.beginStroke(shapeColour)
				.drawRect(0, 0, width, height);

		var component_border = new createjs.Shape(border_obj);

		component_border.x = positionX;
		component_border.y = positionY;
		this.sortid = parseInt(id);

		this.addChild(component_border);
		this.setChildIndex( component_border, zIndex );

	}

	lib.BAPP_Shape.prototype.setupShape = function() {

		var width 		= this.meta.width,
			height 		= this.meta.height,
			positionX 	= this.meta.positionX,
			positionY 	= this.meta.positionY,
			zIndex 		= this.meta.zIndex,
			id			= this.meta.zIndex,
			shapeColour = this.meta.shapeColour;

		var shape_obj = new createjs.Graphics().beginFill(shapeColour).drawRect(0, 0, width, height);
		//var component_shape = new createjs.Shape(shape_obj);

		this.graphics = shape_obj;
		this.x = positionX;
		this.y = positionY;
		this.sortid = parseInt(id);

		//this.mouseChildren = false;
		//this.addChild(component_shape);
		//this.setChildIndex( component_shape, zIndex );
	}

	lib.BAPP_Image.prototype.setupImage = function() {

		var that = this;

		var width 		= this.meta.width,
			height 		= this.meta.height,
			positionX 	= this.meta.positionX,
			positionY 	= this.meta.positionY,
			zIndex 		= this.meta.zIndex,
			id			= this.meta.zIndex,
			path		= this.meta.path;

		var dataURIRegex = /data:([-\w]+\/[-+\w.]+)?(;?\w+=[-\w]+)*(;base64)?,.*/gu;
		/**/
		var dataURIPath = dataURIRegex.exec(path);
		if( dataURIPath !== null ) {
			//console.log('dataURIPath', dataURIPath[0]);
			path = dataURIPath[0];
		} else {

			// rewrite image paths and to reference local directory
			var fileNameRegex = /(?:.+\/)(.+)/g;
			var na = fileNameRegex.exec(path);
			if( na !== null ) {
				path = na[1];
			}
		}

		var img = new Image();
		img.onload = function () {

			//var component_image = new cjs.Bitmap(img);

			that.image = img;

			that.scaleX = width/img.width;
			that.scaleY = height/img.height;

			that.x = positionX;
			that.y = positionY;
			that.sortid = parseInt(id);

			//that.addChild(component_image);
			//that.setChildIndex( component_image, zIndex );

		};
		img.src = path;

	}

	var handleClick = function (event) {
		console.log('clicked', this.name);
		alert("You clicked on a button: "+this.name);
	}

	var handleRollOver = function(event) {
		this.alpha = event.type == "rollover" ? 0.4 : 1;
	}

	var center = function() {
		var bounds = this.getBounds();

		this.x = {{width}} - bounds.width >> 1;
		this.y = {{height}} - bounds.height >> 1;

		this.stage.update();
	}

	// only for MovieClip Instances
	var setupAnimations = function( animations ) {

		//return;

		var timelineInstance = gsap.timeline();
		var tweens = [];

		var initialStartTime = 0;

		for (var index = 0; index < animations.length; index++) {
			var animation = animations[index];
			var animationmeta = animation.animationmeta.reduce((r,{name,value}) => (r[name]=value,r), {});

			if( animationmeta.duration === 0 || animation.animationtype.name === 'Start' ) {

				var setValues = gsap.set(
					this,
					{
						x: parseInt(animationmeta.positionX),
						y: parseInt(animationmeta.positionY),
						alpha: parseInt(animationmeta.opacity)
					},
				);

				tweens.push({
					position: animationmeta.startTime,
					tween: setValues
				});

				//instanceTimeline.add(setValues, animationmeta.startTime);

			} else {

				var tween = gsap.to(
					this,
					{
						duration: animationmeta.duration,
						x: parseInt(animationmeta.positionX),
						y: parseInt(animationmeta.positionY),
						alpha: parseInt(animationmeta.opacity),
						ease: "power3.out"
					}
				);

				//tween.pause();

				tweens.push({
					position: animationmeta.startTime,
					tween: tween
				});

				//instanceTimeline.add(tween, animationmeta.startTime);

			}

		}

		this.anim8Tween = tweens;
	}

	lib.BAPP_Image.prototype.setupAnimations = setupAnimations;
	lib.BAPP_Shape.prototype.setupAnimations = setupAnimations;
	lib.BAPP_Text.prototype.setupAnimations = setupAnimations;
	lib.BAPP_Border.prototype.setupAnimations = setupAnimations;
	lib.BAPP_Button.prototype.setupAnimations = setupAnimations;

	lib.BAPP_Image.prototype.centerOnCanvas = center;
	lib.BAPP_Shape.prototype.centerOnCanvas = center;
	lib.BAPP_Text.prototype.centerOnCanvas = center;
	lib.BAPP_Border.prototype.centerOnCanvas = center;
	lib.BAPP_Button.prototype.centerOnCanvas = center;


})(lib = lib||{}, components = components||{}, images = images||{}, createjs = createjs||{}, ss = ss||{});
var lib, images, components, createjs, ss;
