import AObject from "../aobject/AObject";
import ASVGParticle from "../aweb/svg/ASVGParticle";
import {P2D, PointList2D, Vec2} from "../amath";
import Matrix3x3 from "../amath/Matrix3x3";
import ASVGElement from "../aweb/svg/ASVGElement";
import Vector from "../amath/Vector";

const DEFAULT_TWEEN_EDITOR_MARGIN = 0.3;

export class AHandleElement extends ASVGElement{
    static HandleVerts(args){
        var position = (args && args.position!==undefined)? args.position : undefined;
        var radius = (args && args.radius!==undefined)? args.radius : 100;
        const h = 0.86602540378*radius;
        const offset = position? position : P2D(0,0);
        var verts = [
            P2D(-radius*0.5,-h/3),
            P2D(radius*0.5,-h/3),
            P2D(0,h*2/3)
        ];
        return Matrix3x3.Translation(offset).applyToPoints(verts);
    }
    constructor(args){
        super(args);
        this._position = (args && args.position)? args.position : new Vec2(0,0);
        this._radius = (args && args.radius)? args.radius : 10;
        this.updateVertices();
    }
    /** Get set position */
    get position(){return this._position;}

    setPosition(position){
        this._position = position;
        this.updateVertices();
    }
    /** Get set radius */
    get radius(){return this._radius;}

    setPositionAndRadius(position, radius){
        this._position = position;
        this._radius = radius;
        this.updateVertices();
    }
    setRadius(radius){
        this._radius = radius;
        this.updateVertices();
    }
    updateVertices(){
        //radius*sqrt(2) gives the sidelength
        this.setVertices(this.constructor.HandleVerts({
            position: this.position,
            radius: this.radius*1.41421356237
        }));
        if(this.stem){
            this.stem.getTwoJSObject().vertices[1].copy(new Two.Anchor(this.position.x, this.position.y));
        }

    }
}


export class AKeyframeViewElement extends AObject{
    static DEFAULT_KEYFRAME_HANDLE_RADIUS = 8;
    static DEFAULT_KEYFRAME_CONTROL_HANDLE_RADIUS = 7;
    /** Get set view */
    get view(){return this.propCurve.view;}

    constructor(args) {
        super(args);
        this.keyframe = (args && args.keyframe!==undefined)? args.keyframe : undefined;
        // this.view = (args && args.view!==undefined)? args.view : undefined;
        this.propCurve = (args && args.propCurve!==undefined)? args.propCurve : undefined;
        // this.interpolation = (args && args.interpolation!==undefined)? args.interpolation : undefined;
        // var positionInContext = (args && args.positionInContext!==undefined)? args.positionInContext : undefined;
        var positionInContext = this.timeValueToCanvasPosition(this.keyframe.time, this.keyframe.value);
            // P2D(this.propCurve.timeToCanvasX(this.keyframe.time), this.propCurve.valueToCanvasY(this.keyframe.value));
        this.keyframeHandle = this.createHandleElement({
            radius: this.constructor.DEFAULT_KEYFRAME_HANDLE_RADIUS,
            position: positionInContext
        });
        var posL, posR;
        posL = positionInContext.plus(P2D(0, 0))
        posR = positionInContext.plus(P2D(0, 0))

        if(this.keyframe.tween) {
            this.startHandle = this.createHandleElement({
                radius: this.constructor.DEFAULT_KEYFRAME_CONTROL_HANDLE_RADIUS,
                position: posL
            });
            this.endHandle = this.createHandleElement({
                radius: this.constructor.DEFAULT_KEYFRAME_CONTROL_HANDLE_RADIUS,
                position: posR
            });
            this.startHandle.stem = this.createLineElement({
                start: positionInContext,
                end: posL
            });
            this.endHandle.stem = this.createLineElement({
                start: positionInContext,
                end: posR
            });

        }

        this.keyframeHandle.setAttributes({
            fill: '#000000',
            linewidth: 2,
            stroke: '#000000'
        });

        var handleAttribs = {
            fill: '#bbbbbb',
            lineWidth: 1.5,
        }
        if(this.keyframe.tween){
            this.startHandle.setAttributes(handleAttribs);
            this.endHandle.setAttributes(handleAttribs);
        }
        this.update();
        // this.hide();

        this.onStartHandleSetPosition = this.onStartHandleSetPosition.bind(this);
        this.onEndHandleSetPosition = this.onEndHandleSetPosition.bind(this);
    }

    onStartHandleSetPosition(position){
        var time = this.propCurve.canvasXToTime(position.x);
        var value = this.propCurve.canvasYToValue(position.y);
        this.keyframe.tween.setStartHandleAbsoluteTimeAndValueDimension(time, value, this.propCurve.propDimension);
        // this.propCurve.updateCurve();
        this.view.updateViewElements();
    }
    onEndHandleSetPosition(position){
        var time = this.propCurve.canvasXToTime(position.x);
        var value = this.propCurve.canvasYToValue(position.y);
        this.keyframe.tween.setEndHandleAbsoluteTimeAndValueDimension(time, value, this.propCurve.propDimension);
        // this.propCurve.updateCurve();
        this.view.updateViewElements();
    }

    getHandleCanvasXBounds(){
        var timerange = this.keyframe.tween.getTimeRange();
        return [this.propCurve.timeToCanvasX(timerange[0]), this.propCurve.timeToCanvasX(timerange[1])];
    }

    hide(){
        this.keyframeHandle.hide();
        this.startHandle.hide();
        this.endHandle.hide();
        this.startHandle.stem.hide();
        this.endHandle.stem.hide();
    }
    show(){
        this.startHandle.stem.show();
        this.endHandle.stem.show();
        this.keyframeHandle.show();
        this.startHandle.show();
        this.endHandle.show();
    }
    update(){
        var handlePosX = this.propCurve.timeToCanvasX(this.keyframe.time);
        // var handlePosY = this.propCurve.valueToCanvasY(this.keyframe.value, this.propCurve.propDimension);
        var handlePosY = this.propCurve.valueToCanvasY(this.keyframe.value);
        var handlePos = P2D(handlePosX, handlePosY);
        this.keyframeHandle.setPositionAndRadius(handlePos, this.constructor.DEFAULT_KEYFRAME_HANDLE_RADIUS);
        // if(this.keyframe.tween) {
        if(!this.keyframe.tween) {
            throw new Error("there should always be a tween now.");
        }
        this.startHandle.setPositionAndRadius(
            this.timeValueToCanvasPosition(
                this.keyframe.tween.getStartHandleTimeAbsolute(),
                this.keyframe.tween.getStartHandleValueAbsolute()
            ),
            this.constructor.DEFAULT_KEYFRAME_CONTROL_HANDLE_RADIUS
        )
        this.endHandle.setPositionAndRadius(
            this.timeValueToCanvasPosition(
                this.keyframe.tween.getEndHandleTimeAbsolute(),
                this.keyframe.tween.getEndHandleValueAbsolute()
            ),
            this.constructor.DEFAULT_KEYFRAME_CONTROL_HANDLE_RADIUS
        );

        this.startHandle.stem.getTwoJSObject().vertices[0].copy(new Two.Anchor(handlePos.x, handlePos.y));
        var endkeypoint =this.timeValueToCanvasPosition(
            this.keyframe.tween.getEndKeyTime(),
            this.keyframe.tween.getEndKeyValue()
        )
        this.endHandle.stem.getTwoJSObject().vertices[0].copy(new Two.Anchor(endkeypoint.x, endkeypoint.y));


        // }else{
        // else{
        //     this.startHandle.setPositionAndRadius(handlePos.plus(P2D(-20, 0)), this.constructor.DEFAULT_KEYFRAME_CONTROL_HANDLE_RADIUS);
        //     this.endHandle.setPositionAndRadius(handlePos.plus(P2D(20, 0)), this.constructor.DEFAULT_KEYFRAME_CONTROL_HANDLE_RADIUS);
        // }
    }

    timeValueToCanvasPosition(time, value){
        return P2D(this.propCurve.timeToCanvasX(time), this.propCurve.valueToCanvasY(value));
    }

    createLineElement(args){
        var start = (args && args.start!==undefined)? args.start : P2D(0,0);
        var end = (args && args.end!==undefined)? args.end : P2D(0,0);
        var verts = [
            start,
            end,
        ];
        var element =this.view.getGraphicsContext().makePath(verts);
        element.setAttributes({
            'stroke': "rgba(100,100,100,0.5)",
            linewidth: 1,
            dashes: [2,2],
        });
        this.view.addGraphic(element);
        return element;
    }

    createHandleElement(args){
        const curved = (args && args.curved!==undefined)? args.curved : true;
        const context = this.view.getGraphicsContext();
        const verts = (args && args.verts)? args.verts : AHandleElement.HandleVerts(args);

        var handle;
        if(curved) {
            handle= context.makeCurve(verts, {ElementClass: AHandleElement});
        }else{
            handle= context.makePath(verts, {ElementClass: AHandleElement});
        }
        this.view.addGraphic(handle);
        return handle;
    }
}



export default class APropertyCurve extends AObject{
    static CURRENT_VALUE_RADIUS=25;
    static VALUE_RANGE_CANVAS_SCALE=DEFAULT_TWEEN_EDITOR_MARGIN;
    constructor(args){
        super(args);
        this.track = (args && args.track!==undefined)? args.track : undefined;
        this.view = (args && args.view!==undefined)? args.view : undefined;
        this.propDimension = (args && args.propDimension!==undefined)? args.propDimension : undefined;
        this.keyframeElements = [];
        this.initViewElements();
    }
    initViewElements(){
        var context = this.view.getGraphicsContext();
        if(this.track.keyframes.length<1){
            return;
        }
        var currentValuePosition = P2D(this.timeToCanvasX(this.view.currentTime), this.valueToCanvasY(this.getCurrentPropertyValue()));
        this.currentValueMarker = this.createCircleElement(currentValuePosition, this.constructor.CURRENT_VALUE_RADIUS);
        var lineverts = [];
        if(this.track) {
            for (let ki=0;ki<this.track.keyframes.length;ki++) {
                var k = this.track.keyframes[ki];
                var keyframeElement = new AKeyframeViewElement({
                    keyframe: k,
                    view: this.view,
                    propCurve: this
                });
                this.keyframeElements.push(keyframeElement);
                // this.view.addGraphic(keyframeElement);
            }

            var ke = this.keyframeElements[0];
            var kep;
            var p = ke.keyframeHandle.position;
            p.leftHandle = p;
            p.rightHandle = ke.startHandle.position;
            lineverts.push(p);
            for(let ki=1;ki<this.track.keyframes.length;ki++){
                ke = this.keyframeElements[ki];
                kep = this.keyframeElements[ki-1];
                p = ke.keyframeHandle.position;
                p.leftHandle = kep.endHandle.position;
                p.rightHandle = ke.startHandle.position;
                lineverts.push(p);
            }
        }


        this.shape = context.makeSpline(lineverts);
        this.shape.noFill();

        if(this.propDimension!==undefined){
            this.currentValueMarker.setAttribute('fill', this.getCurveColor());
            this.shape.setAttributes({
                'stroke':this.getCurveColor(),
                linewidth: 2
            });
        }


        this.view.addGraphic(this.shape);
        this.update();
        // this.bringKeyframeElementsToFront();
    }

    getCurveColor(args){
        var brightness = (args && args.brightness!==undefined)? args.brightness : 0.85;
        var alpha = (args && args.alpha!==undefined)? args.alpha : 1.0;
        var b = parseInt(brightness*255);
        switch(this.propDimension){
            case 0:
                return `rgba(${b},0,0,${alpha})`;
                break;
            case 1:
                return `rgba(0,${b},0,${alpha})`;
                break;
            case 2:
                return `rgba(0,0,${b},${alpha})`;
                break;
            case 3:
                return `rgba(0,${b},${b},${alpha})`;
                break;
            case 4:
                return `rgba(${b},0,${b},${alpha})`;
                break;
            case 5:
                return `rgba(${b},${b},0,${alpha})`;
                break;
        }
    }

    bringKeyframeElementsToFront(){
        for(let k of this.keyframeElements){
            k.hide();
            k.show();
        }
        // this.keyframeElements[0].startHandle.hide();
        if(this.keyframeElements.length) {
            this.keyframeElements[this.keyframeElements.length - 1].startHandle.hide();
            this.keyframeElements[this.keyframeElements.length - 1].endHandle.hide();
        }
    }

    getCurrentPropertyValue(){
        var selectedModel = this.view.getModel();
        if(!selectedModel){
            return;
        }
        return selectedModel.getProperty(this.track.name);
        // if(this.propDimension!==undefined){
        //     return selectedModel.getProperty(this.track.name).elements[this.propDimension];
        // }else{
        //     return selectedModel.getProperty(this.track.name);
        // }
    }

    createCircleElement(position, radius, args){
        const context = this.view.getGraphicsContext();
        var r = (radius!==undefined)? radius : this.constructor.CURRENT_VALUE_RADIUS;
        const h = 0.86602540378*r;
        const offset = position? position : P2D(0,0);
        var verts = [
            P2D(-radius*0.5,-h/3),
            P2D(radius*0.5,-h/3),
            P2D(0,h*2/3)
        ];
        verts = Matrix3x3.Translation(offset).applyToPoints(verts);

        var circle= context.makeCurve(verts, {ElementClass: AHandleElement});

        //
        // var circle= context.makeCircle({
        //     x: p.x,
        //     y: p.y,
        //     radius: r,
        //     args: args
        // });
        this.view.addGraphic(circle)
        return circle;
    }

    updateCurve(){
        var lineverts = [];
        var ke = this.keyframeElements[0];
        var kep;
        var p = ke.keyframeHandle.position;
        p.leftHandle = p;
        p.rightHandle = ke.startHandle.position;
        lineverts.push(p);
        for(let ki=1;ki<this.track.keyframes.length;ki++){
            ke = this.keyframeElements[ki];
            kep = this.keyframeElements[ki-1];
            p = ke.keyframeHandle.position;
            p.leftHandle = kep.endHandle.position;
            p.rightHandle = ke.startHandle.position;
            lineverts.push(p);
        }
        this.shape.setAnchors(lineverts);
        this.shape._automatic = false;
        this.shape.noFill();
        this.shape.closed=false;
    }

    update(){
        this.track.sortKeyframes();
        this.updateCurve();
        // var lineverts = [];
        // for(let k of this.keyframeElements) {
        //     k.update();
        //     var p = k.keyframeHandle.position;
        //     p.startHandle = k.startHandle.position;
        //     p.endHandle = k.endHandle.position;
        //     lineverts.push(p);
        // }
        var currentValuePosition = P2D(this.timeToCanvasX(this.view.currentTime), this.valueToCanvasY(this.getCurrentPropertyValue()));
        this.currentValueMarker.setPosition(currentValuePosition);
    }

    canvasXToTime(x){
        return this.view.canvasXToTime(x);
    }
    canvasYToValue(y){
        var propDimension = this.propDimension;
        // return this.contextDimensions[1]*0.5;
        var canvasDims = this.view.contextDimensions;
        var canvasMid = canvasDims[1]*0.5;
        var canvasRange = canvasDims[1]*this.constructor.VALUE_RANGE_CANVAS_SCALE;
        var dimid;
        var dimrange;
        dimid = (this.allDimensionsRange[1]+this.allDimensionsRange[0])*0.5;
        // dimrange = (this.allDimensionsRange[1]-this.allDimensionsRange[0]);
        dimrange = Math.max(this.allDimensionsRange[1]-this.allDimensionsRange[0],1);
        return ((y-canvasMid)*(dimrange/canvasRange))+dimid;
    }


    timeToCanvasX(time){
        var t = (time instanceof Vector)? time.elements[this.propDimension] : time;
        return this.view.timeToCanvasX(t);
    }
    // valueToCanvasY(value, propDimensions){
    //     return this.track.valueToCanvasY(value, propDimensions);
    // }

    /** Get set dimensionRanges */
    get dimensionRanges(){return this.track.dimensionRanges;}
    get allDimensionsRange(){return this.track.allDimensionsRange;}

    valueToCanvasY(value){
        var propDimension = this.propDimension;
        // return this.contextDimensions[1]*0.5;
        var canvasDims = this.view.contextDimensions;
        var canvasMid = canvasDims[1]*0.5;
        var canvasRange = canvasDims[1]*this.constructor.VALUE_RANGE_CANVAS_SCALE;
        var dimid;
        var dimrange;
        dimid = (this.allDimensionsRange[1]+this.allDimensionsRange[0])*0.5;
        dimrange = Math.max(this.allDimensionsRange[1]-this.allDimensionsRange[0],1);
        if(propDimension!==undefined){
            return ((value.elements[propDimension]-dimid)*(canvasRange/dimrange))+canvasMid;
        }else{
            return ((value-dimid)*(canvasRange/dimrange))+canvasMid;
        }
    }

}