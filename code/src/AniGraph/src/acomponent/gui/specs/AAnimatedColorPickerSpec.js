import AGUIElementSpec from "./AGUIElementSpec";
import Vector from "../../../amath/Vector";


export default class AAnimatedColorPickerSpec extends AGUIElementSpec{
    static VecToColorString(v){
        return `rgba(${ parseInt(v.elements[0]*255) }, ${ parseInt(v.elements[1]*255) }, ${ parseInt(v.elements[2]*255) }, ${ v.elements[3]})`;
    }
    static ColorToVec(value){
        return new Vector([value.rgb.r/255, value.rgb.g/255, value.rgb.b/255, value.rgb.a]);
    }
    constructor(args) {
        super(args);
        this.canAnimate = (args && args.canAnimate!==undefined)? args.canAnimate : true;
    }
}