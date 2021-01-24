import {AGraphicsContext2D} from "../acontext";
import ATweenController from "./ATweenController";
import ASupplementalGraphicsComponent2D from "../acomponent/ASupplementalGraphicsComponent2D";
import APropertyCurve from "./APropertyCurve";


export default class ATweenComponent extends ASupplementalGraphicsComponent2D{
    static ComponentControllerClass = ATweenController;
    constructor(props) {
        super(props);
    }

    // set model(value){this._model = value;}
    // get model(){return this._model;}

    getSelectedModel(){
        return this.getAppStateObject().getSelectedModel();
    }

    onModelUpdate(args){
        this.getComponentController().onModelUpdate(args);

        // this._hardUpdate();
        const self = this;
        switch (args.type){
            case "moveKeyframe":
                self._hardUpdate();
                break;
            case 'animationDataChange':
                self._hardUpdate(args);
                break;
            case "release":
                return self.onModelRelease();
                break;
            default:
                return;
        }

    }

    onSelectedControllersChanged(selectedModelControllers) {
        const selectedModel = selectedModelControllers && selectedModelControllers.length ? selectedModelControllers[0].getModel() : undefined;
        this.onSelectedModelChanged(selectedModel);
    }

    onSelectedModelChanged(selectedModel){
        // this.stopListeningToSelection();
        // this.listenToSelection();

        // this.getComponentController().listenToSelectedModel(selectedModel);

        this.stopListening();
        this.setModelAndListen(selectedModel);
        this.getComponentController().createView();
        // this.setState({selectedModel: selectedModel});
        // this.setModel(selectedModel);
    }

    onSelectedKeyframeTrackChanged(selectedKeyframeTrackName){
        this.setState({selectedKeyframeTrackName: selectedKeyframeTrackName});
        this.getSelectedModel().notifyAnimationTrackChanged();
        this._hardUpdate();
    }

    _hardUpdate(){
        // this.getComponentController().onSelectedModelChange(this.getSelectedModel());
        this.onSelectedModelChanged(this.getSelectedModel());
    }

    onTweenZoomChange(sliderZoom){
        APropertyCurve.VALUE_RANGE_CANVAS_SCALE = sliderZoom;
        this._hardUpdate();
    }

    initAppState(){
        super.initAppState();
        const self = this;
        this.addAppStateListener('selectedKeyframeTrackName', function(selectedKeyframeTrackName){
            self.onSelectedKeyframeTrackChanged(selectedKeyframeTrackName);
        })
        this.addAppStateListener('selectedModelControllers', this.onSelectedControllersChanged);
        this.addAppStateListener('timelineVisibleRange', this._hardUpdate);
        this.addAppStateListener('TweenZoom', this.onTweenZoomChange);
    }

    // setViewMode(viewMode){
    //     this.componentController.replaceViewClass(this.viewClassesDict[viewMode]);
    // }
    bindMethods() {
        super.bindMethods();
        this.onSelectedControllersChanged = this.onSelectedControllersChanged.bind(this);
        this.onSelectedModelChanged = this.onSelectedModelChanged.bind(this);
        this._hardUpdate = this._hardUpdate.bind(this);
        this.onTweenZoomChange = this.onTweenZoomChange.bind(this);
        // this.startTimer = this.startTimer.bind(this);
        // this.tick = this.tick.bind(this);
        // this.stopTimer = this.stopTimer.bind(this);
    }
}







