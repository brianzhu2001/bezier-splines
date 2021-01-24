import AObject from "../../../aobject/AObject";


export default class AGUIElementSpec extends AObject{
    constructor(args) {
        super(args);
        this.label = args && args.label? args.label : this.name;
        this.key = args && args.key? args.key : this.name;
        this.type=args && args.type? args.type : undefined;
        this.defaultValue = args && args.defaultValue? args.defaultValue : undefined;
        this.canAnimate = args && args.canAnimate? args.canAnimate: undefined;
    }
}
