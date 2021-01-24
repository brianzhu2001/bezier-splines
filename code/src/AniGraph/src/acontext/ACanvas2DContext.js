import ASVGGroup from "../aweb/svg/ASVGGroup";
import AGraphicsContext2D from "./AGraphicsContext2D";

export default class ACanvas2DContext extends AGraphicsContext2D{
    static GetDefaultTwoJSType(){
        return Two.Types['canvas'];
    }
    constructor(args){
        super(args);
    }
}