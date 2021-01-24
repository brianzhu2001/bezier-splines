import AObject from "../../../aobject/AObject";

// "layer" in timeliner
export default class ATimelinerProp extends AObject {
    constructor(args) {
        super(args);
        this.name = args.name;
        this.values = [];
        this._value = 0;
        this._color = (args && args.color!==undefined)? args.color : '#' + (Math.random() * 0xffffff | 0).toString(16);;
        // this._color = '#' + (Math.random() * 0xffffff | 0).toString(16);
    }

    /** Get set value */
    set value(value){this._value = value;}
    get value(){return this._value;}
    /** Get set values */
    // set values(value){
    // 	this._values = value;
    // }
    // get values(){
    // 	return this._values;
    // }

    sortKeyframes(){
        this.values.sort(function(a,b){
            return a.time-b.time;
        })
    }

}


AObject.RegisterClass(ATimelinerProp);