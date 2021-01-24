import AObject from "../../aobject/AObject";
import ATimelinerProp from "./timeliner/ATimelinerProp";
import AKeyframeInterpolation from "./AKeyframeInterpolation";
import Vector from "../../amath/Vector";
import AKeyframe from "./AKeyframe";
export default class AKeyframeTrack extends AObject{
    constructor(args) {
        super(args);
        this.keyframes=[];
        this.keyframeDict = {};
        // console.log(this.getJSONString());
        // this.saveJSON();
    }

    afterLoadFromJSON(args){
        super.afterLoadFromJSON(args);
        this.keyframeDict={};
        this.sortKeyframes();
        for(let k of this.keyframes){
            this.keyframeDict[k.getUID()]=k;
            k.tween.initHandleProgress();
        }
    }
    
    getTimelinerJSON(){
        // const rval = {
        //     _name: this.name,
        //     values: []
        // };
        const rval = new ATimelinerProp({
            name: this.name,
            uid: this.getUID(),
            values: []
        });
        for(let k of this.keyframes){
            rval.values.push(k.getTimelinerJSON());
        }
        return rval;
    }

    calcHandleProgress(){
        for(let k of this.keyframes){
            if(k.tween){
                k.tween.initHandleProgress();
            }
        }
    }

    getKeyframeByUID(uid){
        return this.keyframeDict[uid];
    }

    /** Get set keyframeDict */
    set keyframeDict(value){this._tempState.keyframeDict = value;}
    get keyframeDict(){return this._tempState.keyframeDict;}

    sortKeyframes(){
        if(this.keyframes.length<1){
            return;
        }
        this.keyframes.sort(function(a,b){
            return a.time-b.time;
        })
        this.dimensionRanges = [];
        if(this.keyframes[0].value instanceof Vector){
            for(let d=0;d<this.keyframes[0].value.elements.length;d++){
                this.dimensionRanges.push([this.keyframes[0].value.elements[d], this.keyframes[0].value.elements[d]]);
            }
        }else{
            this.dimensionRanges.push([this.keyframes[0].value, this.keyframes[0].value]);
        }

        for(let k=0;k<this.keyframes.length;k++){
            if(k<(this.keyframes.length-1)){
                this.keyframes[k].nextKey = this.keyframes[k+1];
                this.keyframes[k+1].prevKey = this.keyframes[k];
            }else{
                this.keyframes[k].nextKey = undefined;// TODO is this right? Should we double up on the last keyframe instead?
            }
            if(this.dimensionRanges.length>1){
                for(let d=0;d<this.dimensionRanges.length;d++){
                    var newvals= [];
                    newvals.push(this.keyframes[k].value.elements[d]);
                    // if(this.keyframes[k].tween){
                    //     newvals.push(this.keyframes[k].tween.getStartHandleValueAbsolute().elements[d]);
                    //     newvals.push(this.keyframes[k].tween.getEndHandleValueAbsolute().elements[d]);
                    // }
                    for(let newval of newvals) {
                        if (newval < this.dimensionRanges[d][0]) {
                            this.dimensionRanges[d][0] = newval;
                        }
                        if (newval > this.dimensionRanges[d][1]) {
                            this.dimensionRanges[d][1] = newval;
                        }
                    }
                }
            }else{
                var newvals= [];
                newvals.push(this.keyframes[k].value);
                // if(this.keyframes[k].tween){
                //     newvals.push(this.keyframes[k].tween.getStartHandleValueAbsolute());
                //     newvals.push(this.keyframes[k].tween.getEndHandleValueAbsolute());
                // }
                for(let newval of newvals) {
                    if (newval < this.dimensionRanges[0][0]) {
                        this.dimensionRanges[0][0] = newval;
                    }
                    if (newval > this.dimensionRanges[0][1]) {
                        this.dimensionRanges[0][1] = newval;
                    }
                }
                // if(this.keyframes[k].value<this.dimensionRanges[0][0]){
                //     this.dimensionRanges[0][0]=this.keyframes[k].value;
                // }
                // if(this.keyframes[k].value>this.dimensionRanges[0][1]){
                //     this.dimensionRanges[0][1]=this.keyframes[k].value;
                // }
            }
        }
        this.allDimensionsRange =[this.dimensionRanges[0][0], this.dimensionRanges[0][1]];
        if(this.dimensionRanges.length>1){
            for(let d=1;d<this.dimensionRanges.length;d++){
                if(this.dimensionRanges[d][0]<this.allDimensionsRange[0]){
                    this.allDimensionsRange[0]=this.dimensionRanges[d][0];
                }
                if(this.dimensionRanges[d][1]>this.allDimensionsRange[1]){
                    this.allDimensionsRange[1]=this.dimensionRanges[d][1];
                }
            }
        }



    }

    updateKeyframe(keyframe){
        console.log(keyframe);
    }

    addKeyframe(keyframe, interpolateFromPrevious=true){
        console.assert(!(keyframe.getUID() in this.keyframeDict), {msg: 'Tried to add keyframe already on track', keyframe})
        this.keyframes.push(keyframe);
        this.keyframeDict[keyframe.getUID()]=keyframe;
        this.sortKeyframes();
        var prevKey = this.getPreviousKeyframeForTime(keyframe.time);
        if(!prevKey){
            return;
        }
        console.assert(!(prevKey.time!==keyframe.time), {msg: 'added keyframe at time of previous keyframe', keyframe})
        if(!prevKey.tween){
            prevKey.tween = new (AKeyframe.TweenClass)({startKey: prevKey});
        }
    }

    removeKeyframeWithUID(uid){
        var keyToRemove = this.getKeyframeByUID(uid);
        var kid = this.keyframes.indexOf(keyToRemove);
        if(kid>-1){
            this.keyframes.splice(kid, 1);
        }
        delete this.keyframeDict[uid];
        this.sortKeyframes();
    }

    duplicateKeyframeWithUIDAtTime(uid, time, color){
        var keyToDuplicate = this.getKeyframeByUID(uid);
        var newKeyframe = new AKeyframe({
            time: time,
            value:keyToDuplicate.getValueCopy(),
            tween: keyToDuplicate.tween,
            color: color
        });

        this.keyframes.push(newKeyframe);
        this.keyframeDict[newKeyframe.getUID()]=newKeyframe;
        this.sortKeyframes();
        newKeyframe.tween.startKey = newKeyframe;
        keyToDuplicate.tween = new (AKeyframe.TweenClass)({startKey: keyToDuplicate});
    }

    moveKeyframeWithUID(uid, time){
        var keyToMove = this.getKeyframeByUID(uid);
        var kid = this.keyframes.indexOf(keyToMove);
        if(kid>-1){
            this.keyframes[kid].time = time;
        }
        this.sortKeyframes();
    }

    toggleTweenForKeyframeWithID(uid, value){
        var keyToMove = this.getKeyframeByUID(uid);
        var kid = this.keyframes.indexOf(keyToMove);
        if(kid>-1) {
            if(!(!!this.keyframes[kid].tween===value)){
                if(value){
                    this.keyframes[kid].tween = new (AKeyframe.TweenClass)({startKey: this.keyframes[kid]});
                }else{
                    this.keyframes[kid].tween=undefined;
                }

            }
        }
    }

    getPreviousKeyframeForTime(time){
        var rval = undefined;
        for(let k of this.keyframes){
            if(k.time<=time){
                rval = k;
            }else{
                return rval;
            }
        }
        return rval;
    }



    /** Get set keyframes */
    set keyframes(value){this._keyframes = value;}
    get keyframes(){return this._keyframes;}

    get nKeyframes(){return this.keyframes?this.keyframes.length: 0;}
}


AObject.RegisterClass(AKeyframeTrack);