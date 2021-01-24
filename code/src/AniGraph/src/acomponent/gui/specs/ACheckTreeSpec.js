import AGUIElementSpec from "./AGUIElementSpec";


export default class ACheckboxSpec extends AGUIElementSpec{
    constructor(args) {
        super(args);
        this.cascade = (args&&args.cascade)? args.cascade : false;
    }
}