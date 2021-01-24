import {
    AObject,
    AView2D,
    AModel2D,
    AController2D,
    AComponentController2D, ABoundingBox2DController, ACanvas2DContext, AGraphicsContext2D
} from "../../../index"

import AGraphicsComponent2D from "../../AGraphicsComponent2D";
import AExampleParticleViewClass from "./AExampleParticleViewClass";
import A2DRenderShapeController from "../../../amvc/controllers/A2DRenderShapeController";

export default class ASVGLabRenderGraphicsComponent extends AGraphicsComponent2D {
    static ComponentControllerClass = AComponentController2D;
    static GraphicsContextClass = AGraphicsContext2D;
    static ModelClassMap = {
        'default': {
            controllerClass: A2DRenderShapeController,
            viewClass: AView2D,
            modelClass: AModel2D
        }
    }
    constructor(props) {
        super(props);
    }

    addViewClass(vclass){
        console.log(vclass.name);
        this.viewClassesDict[vclass.name]=vclass;
        AObject.RegisterClass(vclass);
    }

    initViewClasses(){
        this.viewClassesDict = {
        };
    }

    release(){
        this.stopTimer();
        super.release();
    }

    startTimer(period){
        if(this.timerID!==null){
            this.stopTimer();
        }
        if(this.timerID === null) {
            this.timerID = setInterval(
                () => this.tick(),
                period
            );
        }
    }
    stopTimer(){
        if(this.timerID !== null) {
            clearInterval(this.timerID);
            this.timerID = null;
        }
    }

    tick(){
        var t = Date.now();
        this.setAppState('appTime', t);
        this.getGraphicsContext().suspendUpdates();
        this.signalAppEvent('update');
        this.getGraphicsContext().resumeUpdates();
        this.getGraphicsContext().update();
    }

    initAppState(){
        super.initAppState();
        const self = this;
        this.initViewClasses();
        this.setAppState('availableViewClasses',
            this.viewClassesDict
        );
        for(let vc in this.viewClassesDict){
            AObject.RegisterClass(this.viewClassesDict[vc]);
        }
        this.addAppStateListener('selectedModelControllers', function(selectedModelControllers){
            const selectedModel = selectedModelControllers && selectedModelControllers.length? selectedModelControllers[0].getModel() : undefined;
            self.setState({selectedModel: selectedModel});
        });
        this.setAppState('saveCreativeSVG', this.saveSVG);
        this.addAppEventListener('update', this.onAppUpdate);


        this.setAppState('timerPeriod', 1000/60);
        this.addAppStateListener('timerPeriod', (period)=>{
            self.stopTimer();
            self.startTimer(period);
        });
        this.addAppStateListener('AutoPlay', (autoplay)=>{
            if(autoplay){
                this.startTimer(this.getAppState('timerPeriod'));
            }else{
                this.stopTimer();
            }
        });
    }

    // setViewMode(viewMode){
    //     this.componentController.replaceViewClass(this.viewClassesDict[viewMode]);
    // }
    bindMethods() {
        super.bindMethods();
        this.saveSVG = this.saveSVG.bind(this);
        this.onAppUpdate = this.onAppUpdate.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.tick = this.tick.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
    }

    onAppUpdate(){
        this.getModel().notifyDescendants();
    }

    saveSVG(){this.getGraphicsContext().saveSVG();}

    getViewClassForModel(model) {
        if(model.getProperty('viewClass')){
            return AObject.GetClassNamed(model.getProperty('viewClass'))
        }
        return super.getViewClassForModel(model);
    }

}