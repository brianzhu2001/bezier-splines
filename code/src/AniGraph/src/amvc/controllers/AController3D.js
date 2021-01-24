import AController from "./AController";
import AController2D from "./AController2D";

export default class AController3D extends AController2D{



    onModelUpdate(args) {
        const self = this;
        switch (args.type) {
            case 'setViewClass':
                self.replaceViewClass(args.viewClass);
                break;
            default:
                return super.onModelUpdate(args);
        }
    }
}