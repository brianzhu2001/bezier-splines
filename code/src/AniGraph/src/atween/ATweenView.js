import PathView from "../acomponent/apps/svglab/exampleviews/PathView";
import {Matrix3x3, P2D} from "../amath";
import AView2D from "../amvc/views/AView2D";
import APropertyCurve from "./APropertyCurve";
import Vector from "../amath/Vector";

export default class ATweenView extends AView2D{
    get currentTime(){return this.getComponentAppState('currentTime');}
    release(){
        super.release();
    }

    initGeometry() {
        const context = this.getGraphicsContext();
        this.currentTimeIndicator = context.makeOpenPath([
            P2D(0,0),
            P2D(1,1)
        ]);
        this.currentTimeIndicator.setAttributes({
            stroke: 'rgba(250,0,0,0.25)',
            linewidth: 2
        });
        this.updateCurrentTimeIndicator();

        this.propCurves = [];
        if(this.getSelectedTrack()) {
            if (this.getSelectedTrack().keyframes && this.getSelectedTrack().keyframes.length && (this.getSelectedTrack().keyframes[0].value instanceof Vector)) {
                for (let d = 0; d < this.getSelectedTrack().keyframes[0].value.elements.length; d++) {
                    this.propCurves.push(this.createPropCurve({propDimension: d}));
                }
            } else {
                this.propCurves.push(this.createPropCurve({}));
            }
        }
        for(let p of this.propCurves){
            p.bringKeyframeElementsToFront();
        }
    }

    updateCurrentTimeIndicator(){
        var currentTimeX = this.timeToCanvasX(this.currentTime);
        var currentTimeVerts =[
            P2D(currentTimeX, 0),
            P2D(currentTimeX, this.contextDimensions[1])
        ];
        this.currentTimeIndicator.setVertices(currentTimeVerts);
    }
    createShapeElement(model){
        return;
    }
    createShapeWithVertices(verts){
        const context = this.getGraphicsContext();
        const shape = context.makePath(verts);;
        return shape;
    }



    createPropCurve(args){
        var selectedTrack = this.getSelectedTrack();
        var propargs = Object.assign({
            track:selectedTrack,
            view: this
        }, args); 
        var propCurve = new APropertyCurve(propargs);
        return propCurve;

    }

    getSelectedTrack(){
        var selectedTrackName = this.getComponentAppState('selectedKeyframeTrackName');
        return this.getModel().getKeyframeTrack(selectedTrackName);
    }

    _getTimeToCanvasXFunc(){
        var timelineVisibleRange = this.getComponentAppState('timelineVisibleRange');
        var contextDims = this.contextDimensions;
        return function(t){
            return contextDims[0]*(t-timelineVisibleRange[0])/timelineVisibleDuration;
        }
    }

    _getValueToCanvasYFunc(args){
        var contextDims = this.contextDimensions;
        return function(v){
            return contextDims[1]*0.5;
        }
    }

    timeToCanvasX(t){
        var timelineVisibleRange = this.getComponentAppState('timelineVisibleRange');
        var timelineVisibleDuration=timelineVisibleRange[1]-timelineVisibleRange[0];
        var scaleFactor = this.contextDimensions[0]/timelineVisibleDuration;
        return scaleFactor*(t-timelineVisibleRange[0]);
    }
    canvasXToTime(x){
        var timelineVisibleRange = this.getComponentAppState('timelineVisibleRange');
        var timelineVisibleDuration=timelineVisibleRange[1]-timelineVisibleRange[0];
        var scaleFactor = this.contextDimensions[0]/timelineVisibleDuration;
        return (x/scaleFactor)+timelineVisibleRange[0];
    }

    getAllKeyframeElements(){
        var keyframeElements = [];
        for(let c of this.propCurves){
            for(let k of c.keyframeElements){
                keyframeElements.push(k);
            }
        }
        return keyframeElements;
    }

    updateViewElements(){
        for(let curve of this.propCurves){
            curve.update();
        }
        this.updateCurrentTimeIndicator();
    }

    onModelUpdate() {
        return super.onModelUpdate();
    }

    // initGeometry(){
    //     this.shape = this.createShapeElement(this.getModel());
    //     this.addGraphic(this.shape);
    // }
}