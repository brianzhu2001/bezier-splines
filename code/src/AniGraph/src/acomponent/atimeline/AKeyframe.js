import AObject from "../../aobject/AObject";
import AKeyframeInterpolation from "./AKeyframeInterpolation";
// import ABezierInterpolator from "../../../../classes/interpolation/ABezierInterpolator";
import Vector from "../../amath/Vector";

export default class AKeyframe extends AObject{
    static TweenClass = AKeyframeInterpolation;
    /**
     * @param args
     */
    constructor(args){
        super(args);
        this.time = (args && args.time!==undefined)? args.time : 0;
        this.value = (args && args.value!==undefined)? args.value : undefined;
        this.tween = (args && args.tween!==undefined)? args.tween : undefined;
        this.color = (args && args.color!==undefined)? args.color : '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);;
    }

    afterLoadFromJSON(args){
        super.afterLoadFromJSON(args);
        if(this.tween){
            this.tween.startKey = this;
        }
    }
    
    /** Get set prevKey */
    set prevKey(value){this._tempState.prevKey = value;}
    get prevKey(){return this._tempState._prevKey;}
    /** Get set nextKey */
    set nextKey(value){this._tempState.nextKey = value;}
    get nextKey(){return this._tempState.nextKey;}

    /** Get set color */
    set color(value){this._color = value;}
    get color(){return this._color;}
    // uid: this.getUID()

    // static FromTimelinerJSON(args){
    //     this.keycolor = (args && args.keycolor!==undefined)? args._color : '#000000';
    // }

    updateWithTimelinerJSON(args){
        if(args && args.time!==undefined){this.time = args.time;}
        if(args && args.tween!==undefined){this.tween = args.tween;}
    }

    getValueForTime(t){
        if(!this.tween || (!this.nextKey)){
            return this.value;
        }
        return this.tween.getValueAtTime(t);
    }

    getValueCopy(){
        if(this.value instanceof Vector){
            return this.value.dup();
        }else{
            return this.value;
        }
    }

    getTimelinerJSON(){
        var j = {
            time: this.time,
            value: this.getUID(),
            uid:this.getUID(),
            _color: this.color
        }
        if(this.tween){
            j.tween = 'interpolate';
        }
        return j;
    }

    static FromTimelinerJSON(j){
        var newkey =  new AKeyframe({
            time: j.time,
            value: j.value,
            uid: j.uid,
            color: j._color
        });
        newkey.tween = new (AKeyframe.TweenClass)({startKey: newkey});
        return newkey;
        // return new AKeyframe({
        //     time: j.time,
        //     value: j.value,
        //     tween: j.tween,
        //     uid: j.uid,
        //     color: j._color
        // });
    }

    // toTimelinerJSON(){
    //     var j = {
    //         time: this.time,
    //         value: this.getUID(),
    //     }
    //     if(this.tween){
    //         j.tween = 'interpolate';
    //     }
    // }

    /** Get set time */
    set time(value){this._time = value;}
    get time(){return this._time;}

    /** Get set value */
    set value(value){this._value = value;}
    get value(){return this._value;}

    /** Get set keycolor */
    set keycolor(value){this._color = value;}
    get keycolor(){return this._color;}

    /** Get set tween */
    set tween(value){this._tween = value;}
    get tween(){return this._tween;}
}

// import ABezierInterpolator from "../../../../classes/interpolation/ABezierInterpolator";
// AKeyframe.TweenClass = ABezierInterpolator

AObject.RegisterClass(AKeyframe);