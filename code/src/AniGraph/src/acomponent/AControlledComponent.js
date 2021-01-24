import AComponent from "./AComponent";
import AController from "../amvc/controllers/AController";
import AView from "../amvc/views/AView";
import AModel from "../amvc/models/AModel";

export default class AControlledComponent extends AComponent{
    static ComponentControllerClass = AController;
    static SupplementalControllerClasses = {};


    constructor(props){
        super(props);
        this._setModelFromProps(props);
    }

    _setModelFromProps(props){
        var model = undefined;
        if(props!==undefined && props.model!==undefined){
            model = props.model;
        }
        if(model) {
            this.setModelAndListen(model);
        }
    }


    initComponent(props){
        super.initComponent(props);
        // //<editor-fold desc="newModelClass">
        // if(props && props.newModelClass){
        //     this.setNewModelClass(props.newModelClass);
        // }else{
        //     var newModelClass = this.getNewModelClass();
        //     if(!newModelClass){
        //         this.setNewModelClass(this.getDefaultModelClass());
        //     }
        // }
        // //</editor-fold>
        this._initDefaultControllers(props);
        this.startControllers();
    }

    initAppState(){
        super.initAppState();
    }

    /**
     * Set the data model. This will be the root model for the application.
     * If the data model is hierarchical, then it may have children.
     * @param model
     */
    setModelAndListen(model, listen=true){
        this.model = model;
        if(model && listen) {
            this.listen();
        }
    }


    //##################//--Controllers--\\##################
    //<editor-fold desc="Controllers">

    /**
     * Creates controllers
     * @param props
     */
    _initDefaultControllers(props){
        if(this.controllers && this.controllers!=={}){
            return;
        }
        this.controllers = {};
        this._componentControllerClass = (props && props.ComponentControllerClass)? props.ComponentControllerClass : this.constructor.ComponentControllerClass;
        this.setComponentController(this._createNewComponentController());
        this._defaultSupplementalControllerClasses=(props && props.SupplementalControllerClasses)? props.SupplementalControllerClasses : this.constructor.SupplementalControllerClasses;
        for (let supCName in this.defaultSupplementalControllerClasses) {
            var newC = new this.defaultSupplementalControllerClasses[supCName]({component: this});
            this.setController(supCName, newC);
        }
    };

    _createNewComponentController(){
        const componentController =  new this.componentControllerClass({
            model: this.getModel(),
            component: this
        });
        // componentController.activate();
        return componentController;

        // modelClassMap: this.modelClassMap

    }

    /**
     * [root controller class] setter
     * @param componentControllerClass Value to set root controller class
     * @param update Whether or not to update listeners
     */
    get componentControllerClass(){
        if(this.getComponentController()){
            return this.getComponentController().constructor;
        }else {
            return this._componentControllerClass;
        }
    }

    /** Get set defaultSupplementalControllerClasses */
    get defaultSupplementalControllerClasses(){return this._defaultSupplementalControllerClasses;}

    getControllersList(){
        const self = this;
        return Object.keys(this._controllers).map(function(k){return self._controllers[k]});
    }

    getSupplementalComponentControllers(){
        const self = this;
        return Object.keys(this._controllers).map(function(k){
            if(self.controllers[k].isSupplementalComponentController){
                return self._controllers[k]
            }
        });
    }

    getSupplementalModelControllers(){
        const self = this;
        return Object.keys(this._controllers).map(function(k){
            let controller = self.controllers[k];
            if(controller.isSupplementalController && !controller.isSupplementalComponentController){
                return self._controllers[k]
            }
        }).filter(c=>{return c;});
    }


    /** Get set controllers */
    set controllers(value){this._controllers = value;}
    get controllers(){return this._controllers;}

    getController(name){return this._controllers[name];}
    setController(name, controller){
        this._controllers[name]=controller;
        controller.component = this;
        controller.keyInComponent = name;
    }
    removeController(c){
        if(c){
            var key = c.keyInComponent ? c.keyInComponent : c;
            var controller= this.controllers[key];
            controller.deactivate();
            if(controller.isSupplementalController){
                controller.detach();
            }
            delete this.controllers[key];
        }
    }
    setComponentController(controller){this.setController('component', controller);}
    getComponentController(){return this.componentController;}
    get componentController(){return this.getController('component');}

    // addController(name, controller){this.getControllers().push(controller);}
    getControllers(){return this._controllers;}
    setControllers(controllers){
        for(let name of controllers){
            this.setController(name, controllers[name]);
        }
    }

    /**
     * Where initial set of controllers should be activated. Will be called once component mounts and context is created.
     * Any controllers based on the classes in  this.constructor.SupplementalControllerClasses will be initialized here.
     * @param args
     */
    startControllers(args){
        for(let newC of this.getControllersList()) {
            if (newC.isSupplementalComponentController) {
                newC.attachToController(this.componentController);
            }
        }
        this.componentController.activate();
    }

    //</editor-fold>
    //##################\\--Controllers--//##################

}