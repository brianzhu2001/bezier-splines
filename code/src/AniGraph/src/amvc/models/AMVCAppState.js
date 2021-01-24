import AppState from "./AppState";
export default class AMVCAppState extends AppState{
    setSelectedModelControllers(value, update=true){
        this.setState('selectedModelControllers', value, update);
    }
    getSelectedModelControllers(){
        return this.getState('selectedModelControllers');
    }

    setSelectedModelController(value){
        this.setSelectedModelControllers(value? [value] : []);
    }
    getSelectedModelController(){
        const selection = this.getSelectedModelControllers();
        return (selection && selection.length>0)? selection[0] : undefined;
    }

    getSelectedModel(){
        const controller = this.getSelectedModelController();
        return controller? controller.getModel() : undefined;
    }
}




