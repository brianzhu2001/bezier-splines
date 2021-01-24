import React from "react";
import AController from "../amvc/controllers/AController";
import AView from "../amvc/views/AView";
import AModel from "../amvc/models/AModel";
import AComponent from "./AComponent";
import AControlledComponent from "./AControlledComponent";
import AObject from "../aobject/AObject";

export default class AMVCComponent extends AControlledComponent{
    static ModelClassMap = {
        default: {
            controllerClass: AController,
            viewClass: AView,
            modelClass: AModel
        }
    };

    constructor(props) {
        super(props);

    }

    _setModelFromProps(props) {
        super._setModelFromProps(props);
        if(!this.model && this.getAppStateObject()){
            this.setModelAndListen(this.getAppState('model'));
        }
    }

    get modelClassMap(){return this.constructor.ModelClassMap;}

    getViewClassForModel(model){
        var modelclassmap = this.modelClassMap;
        var modelmap = modelclassmap[model.constructor.name];
        if(modelmap!==undefined){
            return modelmap.viewClass
        }else{
            return modelclassmap['default'].viewClass;
        }
    }

    getDefaultModelClass(){
        return this.constructor.ModelClassMap.default.modelClass;
    }

    getNewModelClass(){
        return this.getAppState('newModelClass');
    }
    setNewModelClass(newModelClass){
        this.setAppState('newModelClass', newModelClass);
    }

    initComponent(props){
        super.initComponent(props);
        // var model = undefined;

        //<editor-fold desc="newModelClass">
        if(props && props.newModelClass){
            this.setNewModelClass(props.newModelClass);
        }else{
            var newModelClass = this.getNewModelClass();
            if(!newModelClass){
                this.setNewModelClass(this.getDefaultModelClass());
            }
        }
        //</editor-fold>
        //
        // if(props!==undefined && props.model!==undefined){
        //     model = props.model;
        // }
        // model = model? model: (this.getAppStateObject()? this.getAppState('model') : undefined);
        // this.setModelAndListen(model);
        //
        // this._initDefaultControllers(props);
        // this.startControllers();
    }

    initAppState(){
        super.initAppState();
        const self = this;
        this.setAppState('loadNewModel', function(model){
            self.loadNewModel(model);
        });
    }

    _getMainControllerForModel(model){
        if(!model){return;}
        if(model===this.model){
            return this.componentController;
        }
        const matches = this.componentController.findDescendants((c)=>{
            if(c && c.getModel() && c.getModel().getUID()===model.getUID()){
                return c;
            }
        });
        console.assert(matches.length<2, {msg: `Found ${matches.length} controllers for model`, model: model, matches: matches});
        if(matches.length){
            return matches[0];
        }
    }

    loadNewModel(model){
        this.reset();
        this.componentController.getModel().addChild(model);
        this.model.notifyPropertySet({name:'model', value: model, update:true});
    }

    // _createNewComponentController(){
    //     const componentController =  new this.componentControllerClass({
    //         model: this.getModel(),
    //         component: this
    //     });
    //     // componentController.activate();
    //     return componentController;
    //
    //         // modelClassMap: this.modelClassMap
    //
    // }


    //##################//--Model--\\##################
    //<editor-fold desc="Model">
    // /** Get set model */
    // set model(value){this.state.model = value;}
    // get model(){return this.state.model;}
    set model(value){this.setAppState('model', value);}
    get model(){return this.getAppState('model');}


    getModel(){
        return this.model;
    }

    getModelSummary(){
        return this.getModel().getSummary();
    }

    onModelUpdate(args){
        if(args && args.type && args.type=='call'){
            if(this[args.method]){
                this[args.method](args.args);
            }
        }
    }

    //</editor-fold>
    //##################\\--Model--//##################

    //##################//--saving/loading--\\##################
    //<editor-fold desc="saving/loading">
    saveJSON(){
        this.model.saveJSON();
    }

    saveModelToJSON(){
        this.model.saveJSON();
    }
    //</editor-fold>
    //##################\\--saving/loading--//##################


    // /**
    //  * Creates controllers
    //  * @param props
    //  */
    // _initDefaultControllers(props){
    //     if(this.controllers && this.controllers!=={}){
    //         return;
    //     }
    //     this.controllers = {};
    //     this._componentControllerClass = (props && props.ComponentControllerClass)? props.ComponentControllerClass : this.constructor.ComponentControllerClass;
    //     this.setComponentController(this._createNewComponentController());
    //     this._defaultSupplementalControllerClasses=(props && props.SupplementalControllerClasses)? props.SupplementalControllerClasses : this.constructor.SupplementalControllerClasses;
    //     for (let supCName in this.defaultSupplementalControllerClasses) {
    //         var newC = new this.defaultSupplementalControllerClasses[supCName]({component: this});
    //         this.setController(supCName, newC);
    //     }
    // };




    release(args){
        super.release(args);
        // TODO: release controllers and possibly model...
    }

    reset(){
        const supc = this.getSupplementalModelControllers();
        for(let c of supc){
            c.detach();
        }
    }



    //##################//--Update functions--\\##################
    //<editor-fold desc="Update functions">
    // update(){
    //     var d = Date.now();
    //     this.setState(() => ({
    //         time: d,
    //         // modelSummary: this.getModelSummary()
    //     }));
    // }
    // startTimer(){
    //     if(this.timerID === null) {
    //         this.timerID = setInterval(
    //             () => this.tick(),
    //             1000
    //         );
    //     }
    // }
    // stopTimer(){
    //     if(this.timerID !== null) {
    //         clearInterval(this.timerID);
    //         this.timerID = null;
    //     }
    // }
    // tick(){
    //     this.update();
    // }

    onGraphChange(args){
        this.updateGraph(args);
    }
    updateGraph(args){
        this.signalAppEvent("graphChanged", args);
    }

    //</editor-fold>
    //##################\\--Update functions--//##################

    bindMethods(){
        super.bindMethods();
        this.saveJSON = this.saveJSON.bind(this);
        this.saveModelToJSON = this.saveModelToJSON.bind(this);
    }

}
