import AComponentController2D from "./AComponentController2D";
import ATweenView from "../../atween/ATweenView";
import AView2D from "../views/AView2D";

export default class ANonGraphComponentController2D extends AComponentController2D{
    static ViewClass = AView2D;
    /**
     * createChildWithArgs does nothing, because we don't want to create controllers for models other than the base model
     * @param args
     */
    createChildWithArgs(args){
        return;
    }

    // createView(){
    //     const newView = new this.constructor.ViewClass({controller: this});
    //     this.setView(newView);
    //     this.getView().initGraphics();
    //     this.onViewUpdate();
    //     if(this.getView()) {
    //         this.addInteractionsToView(this.getView());
    //     }
    // }


}