import A2DShapeController from "./A2DShapeController";

export default class A2DRenderShapeController extends A2DShapeController {

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