import AObject from "../../aobject/AObject";
import Vector from "../../amath/Vector";


function _repeatarray(value, len){
    var r = [];
    for(var i=0;i<len;i++){
        r.push(value);
    }
    return r;
}

export default class AKeyframeInterpolation extends AObject{
    constructor(args) {
        super(args);
        this.startKey = (args && args.startKey!==undefined)? args.startKey : undefined;
    }

    /** Get set startKey */
    set startKey(value){this._tempState.startKey = value;}
    get startKey(){return this._tempState.startKey;}
    get endKey(){return this.startKey? this.startKey.nextKey: undefined;}

    get ValueClass(){
        return this.startKey.value.constructor;
    }

    getEndKeyValue(){
        return this.endKey? this.endKey.value : this.startKey.value;
    }
    getEndKeyTime(){
        return this.endKey? this.endKey.time : this.startKey.time;
    }
    get nValueDimensions(){
        if(this.startKey.value instanceof Vector){
            return this.startKey.value.elements.length;
        }else{
            return undefined;
        }
    }

    getTimeRange(){
        return [this.startKey.time, this.getEndKeyTime()];
    }

    _getEndKeyTimeVec(){
        var endkeytime = this.getEndKeyTime();
        var nkeydims = this.nValueDimensions;
        if(nkeydims<2){
            return endkeytime;
        }
        return new this.startKey.value.constructor(_repeatarray(endkeytime, nkeydims));
    }
    _getStartKeyTimeVec(){
        var nkeydims = this.nValueDimensions;
        if(nkeydims<2){
            return this.startKey.time;
        }
        return new this.startKey.value.constructor(_repeatarray(this.startKey.time, nkeydims));
    }

    /** Get set startHandle */
    set startHandle(value){this._startHandle = value;}
    get startHandle(){return this._startHandle;}

    getStartHandle(){
        return this._startHandle;
    }
    getEndHandle(){
        return this._endHandle;
    }

    /** Get set endHandle */
    set endHandle(value){this._endHandle = value;}
    get endHandle(){return this._endHandle;}


    //##################//--set relative--\\##################
    //<editor-fold desc="set relative">

    createStartHandle(args){
        this._initTimeProgressForStartHandle(args);
        return args;
    }

    createEndHandle(args){
        this._initTimeProgressForEndHandle(args);
        return args;
    }

    _setStartHandleTime(time, dimension){
        if(dimension!==undefined){
            this.startHandle.time.elements[dimension] = time-this.startKey.time;
            this.startHandle._timeProgress.elements[dimension]=this._timeToProgress(time);
        }else{
            this.startHandle.time = time-this.startKey.time;
            this.startHandle._timeProgress=this._timeToProgress(time);
        }
    }

    _setEndHandleTime(time, dimension){
        if(dimension!==undefined){
            this.endHandle.time.elements[dimension] = time-this.endKey.time;
            this.endHandle._timeProgress.elements[dimension]=this._timeToProgress(time);
        }else{
            this.endHandle.time = time-this.endKey.time;
            this.endHandle._timeProgress=this._timeToProgress(time);
        }
    }

    getStartHandleTime(){
        if(this.startHandle && this.startHandle._timeProgress){
            if(this.startHandle._timeProgress.elements!==undefined) {
                var rvals = [];
                for (let d = 0; d < this.startHandle._timeProgress.elements.length; d++) {
                    rvals.push(this._progressToTime(this.startHandle._timeProgress.elements[d])-this.startKey.time);
                }
                return new this.ValueClass(rvals);
            }else{
                return this._progressToTime(this.startHandle._timeProgress)-this.startKey.time;
            }
        }
    }

    getEndHandleTime(){
        if(this.endHandle && this.endHandle._timeProgress){
            if(this.endHandle._timeProgress.elements!==undefined) {
                var rvals = [];
                for (let d = 0; d < this.endHandle._timeProgress.elements.length; d++) {
                    rvals.push(this._progressToTime(this.endHandle._timeProgress.elements[d])-this.endKey.time);
                }
                return new this.ValueClass(rvals);
            }else{
                return this._progressToTime(this.endHandle._timeProgress)-this.endKey.time;
            }
        }
    }

    setStartHandleValueRelative(value, dimension){
        if(dimension!==undefined){
            this.startHandle.value.elements[dimension] = value;
        }else{
            this.startHandle.value = value;
        }
    }


    setEndHandleValueRelative(value, dimension){
        if(dimension!==undefined){
            this.endHandle.value.elements[dimension] = value;
        }else{
            this.endHandle.value = value;
        }
    }

    _progressToTime(progress){
        return (1.0-progress)*this.startKey.time + progress*this.getEndKeyTime();
    }
    _timeToProgress(time){
        if(this.endKey === undefined){
            return 0;
        }
        return (time-this.startKey.time)/(this.getEndKeyTime()-this.startKey.time);
    }

    initHandleProgress(){
        if(this.getStartHandle()!==undefined) {
            this._initTimeProgressForStartHandle(this.startHandle);
        }
        if(this.getEndHandle()!==undefined) {
            this._initTimeProgressForEndHandle(this.endHandle);
        }
    }

    _initTimeProgressForStartHandle(handle) {
        if(handle.time instanceof Vector){
            if(handle._timeProgress === undefined){
                handle._timeProgress = this.startKey.value.dup();
            }
            for(let d=0;d<handle.time.elements.length;d++){
                handle._timeProgress.elements[d]=this._timeToProgress(handle.time.elements[d]+this.startKey.time);
            }
        }else {
            handle._timeProgress = this._timeToProgress(handle.time+this.startKey.time);
        }
    }

    _initTimeProgressForEndHandle(handle){
        if(handle.time instanceof Vector){
            if(handle._timeProgress === undefined){
                handle._timeProgress = this.startKey.value.dup();
            }
            for(let d=0;d<handle.time.elements.length;d++){
                handle._timeProgress.elements[d]=this._timeToProgress(handle.time.elements[d]+this.endKey.time);
            }
        }else {
            handle._timeProgress = this._timeToProgress(handle.time+this.endKey.time);
        }
    }

    //</editor-fold>
    //##################\\--set relative--//##################


    setStartHandleAbsoluteTimeAndValueDimension(time, value, dimension){
        if(dimension!==undefined){
            if(!this.startHandle){
                var starthandletimeabs = this.getStartHandleTimeAbsolute();
                var startHandleInitTime = starthandletimeabs.minus(new this.startKey.value.constructor(_repeatarray(this.startKey.time, this.nValueDimensions)));
                this.startHandle = this.createStartHandle({
                    time:startHandleInitTime,
                    value: this.getStartHandleValueAbsolute().minus(this.startKey.value)
                });
            }
            // this._setStartHandleTime(time-this.startKey.time, dimension);
            this._setStartHandleTime(time, dimension);
            this.setStartHandleValueRelative(value-this.startKey.value.elements[dimension], dimension);
            // this.getStartHandle().time.elements[dimension]=time-this.startKey.time;
            // this.getStartHandle().value.elements[dimension]=value-this.startKey.value.elements[dimension];
        }else{
            if(!this.startHandle){
                this.startHandle = this.createStartHandle({
                    time:this.getStartHandleTimeAbsolute()-this.startKey.time,
                    value:this.getStartHandleValueAbsolute()-this.startKey.value
                });
                // this._initTimeProgressForHandle(this.startHandle);
            }
            this._setStartHandleTime(time);
            this.setStartHandleValueRelative(value-this.startKey.value);
            // this.getStartHandle().time = time-this.startKey.time;
            // this.getStartHandle().value = value-this.startKey.value;
        }
    }
    setEndHandleAbsoluteTimeAndValueDimension(time, value, dimension){
        if(dimension!==undefined){
            if(!this.endHandle){
                var endhandletimeabs = this.getEndHandleTimeAbsolute();
                var endHandleInitTime = endhandletimeabs.minus(new this.startKey.value.constructor(_repeatarray(this.endKey.time, this.nValueDimensions)));
                // new this.startKey.value.constructor(_repeatarray(this.getEndHandleTimeAbsolute()-time, this.nValueDimensions)),
                this.endHandle = this.createEndHandle({
                    time:endHandleInitTime,
                    value: this.getEndHandleValueAbsolute().minus(this.getEndKeyValue())
                });
                // this._initTimeProgressForHandle(this.endHandle);
            }
            this._setEndHandleTime(time, dimension);
            this.setEndHandleValueRelative(value-this.getEndKeyValue().elements[dimension], dimension);
            // this.getEndHandle().value.elements[dimension]=value-this.getEndKeyValue().elements[dimension];
        }else{
            if(!this.endHandle){
                this.endHandle = this.createEndHandle({
                    time:this.getEndHandleTimeAbsolute()-this.getEndKeyTime(),
                    value:this.getEndHandleValueAbsolute()-this.getEndKeyValue()
                });
                // this._initTimeProgressForHandle(this.endHandle);
            }
            // this._setEndHandleTime(time-this.getEndKeyTime())
            this._setEndHandleTime(time);
            this.setEndHandleValueRelative(value-this.getEndKeyValue());
            // this.getEndHandle().time = time-this.getEndKeyTime();
            // this.getEndHandle().value = value-this.getEndKeyValue();
        }
    }


    getValueAtTime(t){
        return this.getValueAtTimeLinear(t);
    }

    getValueAtTimeLinear(t){
        var duration = this.endKey.time-this.startKey.time;
        var offset = t-this.startKey.time;
        var alpha = offset/duration;
        var beta = 1.0-alpha;
        const self = this;
        if(typeof this.startKey.value==="number") {
            return alpha * this.getEndKeyValue() + beta * self.startKey.value;
        }
        if(this.startKey.value instanceof Vector){
            return this.endKey.value.times(alpha).plus(this.startKey.value.times(beta));
        }
    }

    getStartHandleValueAbsolute(){
        if(this.startKey.value instanceof Vector){
            if(!this.startHandle){
                var endkeyval = this.getEndKeyValue();
                return endkeyval.times(0.333333333).plus(this.startKey.value.times(0.666666666));
            }else{
                return this.startKey.value.plus(this.getStartHandle().value);
            }
        }else{
            if(!this.startHandle){
                var endkeyval = this.getEndKeyValue();
                return (endkeyval*0.333333333)+(this.startKey.value*0.666666666);
            }else{
                return this.startKey.value+this.getStartHandle().value;
            }
        }
    }

    getEndHandleValueAbsolute(){
        if(this.startKey.value instanceof Vector){
            if(!this.endHandle){
                var endkeyval = this.getEndKeyValue();
                return this.startKey.value.times(0.333333333).plus(endkeyval.times(0.666666666));
            }else{
                return this.getEndHandle().value.plus(this.getEndKeyValue());
            }
        }else{
            if(!this.endHandle){
                var endkeyval = this.getEndKeyValue();
                return (this.startKey.value*0.333333333)+(endkeyval*0.666666666);
            }else{
                return this.getEndHandle().value+this.getEndKeyValue();
            }
        }
    }
    getStartHandleTimeAbsolute(){
        if(this.startKey.value instanceof Vector){
            if(!this.startHandle){
                var endkeycontrib = this._getEndKeyTimeVec().times(0.333333333);
                var startkeycontrib =this._getStartKeyTimeVec().times(0.666666666);
                return endkeycontrib.plus(startkeycontrib);
            }else{
                return this._getStartKeyTimeVec().plus(this.getStartHandleTime());
            }
        }else{
            if(!this.startHandle){
                var endkeytime = this.getEndKeyTime();
                return (endkeytime*0.333333333)+(this.startKey.time*0.666666666);
            }else{
                return this.startKey.time+this.getStartHandleTime();
            }
        }
    }

    getEndHandleTimeAbsolute(){
        if(this.startKey.value instanceof Vector){
            if(!this.endHandle){
                return this._getStartKeyTimeVec().times(0.333333333).plus(this._getEndKeyTimeVec().times(0.666666666));
            }else{
                return this.getEndHandleTime().plus(this._getEndKeyTimeVec());
            }
        }else{
            if(!this.endHandle){
                var endkeytime = this.getEndKeyTime();
                return (this.startKey.time*0.333333333)+(endkeytime*0.666666666);
            }else{
                return this.getEndHandleTime()+this.getEndKeyTime();
            }
        }
    }
}

AObject.RegisterClass(AKeyframeInterpolation);