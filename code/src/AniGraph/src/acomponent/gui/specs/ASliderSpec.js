import AGUIElementSpec from "./AGUIElementSpec";


export default class ASliderSpec extends AGUIElementSpec{
    constructor(args) {
        super(args);
        this.minVal = args && args.minVal? args.minVal : 0;
        this.maxVal = args && args.maxVal? args.maxVal : 1;
        this.step = args && args.step? args.step : 0.01;
    }
}