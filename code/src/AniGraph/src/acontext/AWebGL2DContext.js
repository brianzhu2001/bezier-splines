import ASVGGroup from "../aweb/svg/ASVGGroup";
import AGraphicsContext2D from "./AGraphicsContext2D";

// Yes, this is slow. It's a Two.js thing:
// https://two.js.org/examples/particle-sandbox.html?type=svg&shapes=circle,triangle&operations=translation&count=717
export default class AWebGL2DContext extends AGraphicsContext2D{
    static GetDefaultTwoJSType(){
        return Two.Types['webgl'];
    }
    constructor(args){
        super(args);
    }
}