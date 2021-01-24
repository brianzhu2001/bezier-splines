/*
 * Copyright (c) 2020. Abe Davis
 */
import React from "react"
import {Checkbox, SelectPicker, Toggle} from "rsuite";
import {Slider} from "rsuite";
import AObject from "../../../aobject/AObject";
import AControlSpecToolPanel from "../../gui/AControlSpecToolPanel";


export default class ASVGLabToolPanel extends AControlSpecToolPanel{
    constructor(props){
        super(props);
    }

    /**
     * See how this is set in A1CreativeComponent
     */
    saveSVG(){
        this.getAppState('saveCreativeSVG')();
    }


    //##################//--App State--\\##################
    //<editor-fold desc="App State">
    onRunScriptButtonClick(){
        this.getAppState('onRunCreativeScriptButtonClick')();
    }

    /**
     *
     * @param className
     */
    setSelectedViewClass(name){
        const selectedModel = this.getSelectedModel();
        const viewClass = this.getViewClassForName(name);
        if(selectedModel && viewClass) {
            if(selectedModel.getProperty("viewClass")!==viewClass.name) {
                selectedModel.setViewClass(viewClass);
                for (let acontrol of viewClass.GUISpecs) {
                    // var statename = acontrol.key;
                    this.setAppState(acontrol.key, selectedModel.getProperty(acontrol.key));
                }
            }
        }
        this.getGUISpec().viewGUISpecs = (viewClass && viewClass.GUISpecs)? viewClass.GUISpecs : [];
        this.setAppState("selectedViewClass", name);
        this.signalAppEvent('update');
    }

    getViewClassForName(name){
        return this.state.availableViewClasses[name];
    }

    getNameForViewClass(viewClass){
        return viewClass? viewClass.name : undefined;
        // function getKeyByValue(object, value) {
        //     return Object.keys(object).find(key => object[key] === value);
        // }
        // var rval = getKeyByValue(this.state.availableViewClasses, viewClass);
        // return rval;
    }

    initAppState(){
        super.initAppState();
        const self = this;
        this.addAppStateListener('availableViewClasses', function(availableViewClasses){
            self.setState({availableViewClassesDataItems: self._getDropdownDataItems(availableViewClasses)});
            self.setState({availableViewClasses: availableViewClasses});
        });

        // this.addAppStateListener('selectedViewClass', function(selectedViewClass){
        //     this.
        // });

        this.addAppStateListener('selectedModelControllers', function(selectedModelControllers){
            self.onControllerSelectionChange(selectedModelControllers);
        }, 'selectedViewClassListener');
    }

    onControllerSelectionChange(selectedModelControllers){
        const selectedModel = (selectedModelControllers && selectedModelControllers.length>0)? selectedModelControllers[0].getModel() : undefined;
        if(selectedModel) {
            var vcname = selectedModel.getProperty('viewClass');
            if(!vcname){
                vcname = 'AView2D';
            }
            var viewClass = AObject.GetClassNamed(vcname);//? vcname : "Default");
            this.getGUISpec().modelGUISpecs=selectedModel.constructor.GUISpecs;
            const viewclassName = this.getNameForViewClass(viewClass);
            // self.setAppState('selectedViewClass', viewclassName);
            this.setSelectedViewClass(viewclassName);
        }else{
            this.setAppState('selectedViewClass', undefined);
        }
    }


    //</editor-fold>
    //##################\\--App State--//##################

    bindMethods() {
        super.bindMethods();
        this.setSelectedViewClass = this.setSelectedViewClass.bind(this);
        this.onRunScriptButtonClick = this.onRunScriptButtonClick.bind(this);
        this.saveSVG = this.saveSVG.bind(this);
    }

    render(){

        const renderGUISpec = super.renderGUISpec();
        return (
            <div className={"row shape-tools-stage"} key={"row" +this.constructor.name}>
                <br></br>
                <div className={"container atoolpanel"}>
                    <div className={"d-flex justify-content-start atoolpanel-row"}>
                        <div className={"d-inline-flex p-3 align-items-center align-self-center"}>
                            <SelectPicker
                                placeholder={"ViewClass"}
                                value={this.state.selectedViewClass}
                                onChange={this.setSelectedViewClass}
                                data={this.state.availableViewClassesDataItems}
                            />
                        </div>
                        <div className={"p-2 align-items-center align-self-center"}>
                            <button onClick = {this.onRunScriptButtonClick}>
                                RunScript
                            </button>
                        </div>
                        <div className={"d-inline-flex p-2 align-items-center align-self-center"}>
                            <button onClick={this.saveSVG}>SaveSVG</button>
                        </div>
                    </div>
                    {renderGUISpec}
                </div>
            </div>
        )
    }
}
