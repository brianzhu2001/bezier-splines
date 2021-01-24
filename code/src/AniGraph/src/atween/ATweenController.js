import ANonGraphComponentController2D from "../amvc/controllers/ANonGraphComponentController2D";
import ATweenView from "./ATweenView";
import ADragTimelineSplineHandleInteraction
    from "../acomponent/atimeline/interactions/ADragTimelineSplineHandleInteraction";

export default class ATweenController extends ANonGraphComponentController2D{
    static DefaultViewElementInteractionClasses = [];
    static ViewClass = ATweenView;
    constructor(args) {
        super(args);
    }

    getModel() {return this.getComponent().getModel();}

    createView(){
        this.deleteView();
        if(!this.getModel()){
            return;
        }
        const newView = new ATweenView({controller: this});
        this.setView(newView);
        this.getView().initGraphics();
        if(this.getView()) {
            this.addInteractionsToView(this.getView());
        }
        this.activateInteractions();
    }

    deleteView(){
        if(this.getView()){
            this.getView().release();
            this.getComponent().getGraphicsContext().two.clear();
            this.setView();
        }
    }


    // listenToSelectedModel(selected){
    //     if(selected){
    //         this.stopListeningToSelectedModels();
    //         selected.setListener(this);
    //         this._tempState.selectedModelsListeningTo.push(selected);
    //     }
    //
    // }
    // stopListeningToSelectedModels(){
    //     if(!this._tempState.selectedModelsListeningTo){
    //         this._tempState.selectedModelsListeningTo=[];
    //         return;
    //     }else{
    //         for(let m of this._tempState.selectedModelsListeningTo){
    //             m.removeListener(this);
    //         }
    //     }
    // }
    _getCurrentSelectionListeningTo(){
        return (this._tempState.selectedModelsListeningTo && this._tempState.selectedModelsListeningTo.length)? this._tempState.selectedModelsListeningTo[0]: undefined;
    }

    // onSelectedModelChange(selectedModel){
        // if(this._getCurrentSelectionListeningTo() && selectedModel!==this._getCurrentSelectionListeningTo()) {
        //     this.getView().release();
        // }
        // if(!selectedModel){
        //     this.stopListeningToSelectedModels();
        // }else{
        //     this.listenToSelectedModel(selectedModel);
        //     this.createView();
        // }
    // }

    // onModelUpdate(args){
    //     const self = this;
    //     switch (args.type){
    //         case "_attachToNewParent":
    //             return;
    //             break;
    //         case "_removeFromParent":
    //             return;
    //             break;
    //         case "release":
    //             return self.onModelRelease();
    //             break;
    //         default:
    //             return this._defaultModelUpdateResponse(args);
    //     }
    // }

    addInteractionsToView() {
        super.addInteractionsToView();
        var keyframeElements = this.getView().getAllKeyframeElements();
        for(let k of keyframeElements){
            ADragTimelineSplineHandleInteraction.Create({
                element: k.startHandle,
                controller: this,
                keyframeElement: k,
                onSetPosition: k.onStartHandleSetPosition
            });
            ADragTimelineSplineHandleInteraction.Create({
                element: k.endHandle,
                keyframeElement: k,
                controller: this,
                onSetPosition: k.onEndHandleSetPosition
            });
        }
    }

    _defaultModelUpdateResponse(args){
        if(this.getView()) {
            this.getView().onModelUpdate(args);
            this.onViewUpdate();
        }
        return true;
    }

    onModelUpdate(args) {
        // return;
        const self = this;
        switch(args.type){
            case 'animationDataChange':
                self.createView();
                return;
                break;
            default:
                break;
        }
        return super.onModelUpdate(args);
    }

}