import {ASVGLabRenderGraphicsComponent} from "../../AniGraph/src/acomponent/apps/svglab"
import PathView from "../../AniGraph/src/acomponent/apps/svglab/exampleviews/PathView";
import AView2D from "../../AniGraph/src/amvc/views/AView2D";
import AExampleAnimatedView from "../views/AExampleAnimatedView";

export default class CustomViewsComponent extends ASVGLabRenderGraphicsComponent{
    initViewClasses(){
        super.initViewClasses();
        this.addViewClass(PathView);
        this.addViewClass(AView2D);
        this.addViewClass(AExampleAnimatedView);
    }
}







