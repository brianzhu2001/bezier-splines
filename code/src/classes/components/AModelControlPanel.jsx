/*
 * Copyright (c) 2020. Abe Davis
 */
import React from "react"
import {Checkbox, SelectPicker, Toggle} from "rsuite";
import {Slider} from "rsuite";
import AObject from "../../AniGraph/src/aobject/AObject";
import {CheckTreePicker} from "rsuite";
// import AControlSpecToolPanel from "../AniGraph/src/acomponent/gui/AControlSpecToolPanel";
import ASVGLabToolPanel from "../../AniGraph/src/acomponent/apps/svglab/ASVGLabToolPanel";
import Vector from "../../AniGraph/src/amath/Vector";

export default class AModelControlPanel extends ASVGLabToolPanel{
    constructor(props){
        super(props);
    }



    initAppState(){
        super.initAppState();
        const self = this;
        this.state.animateProps = [];
    }

    onControllerSelectionChange(selectedModelControllers) {
        super.onControllerSelectionChange(selectedModelControllers);
        var selectedModel = (selectedModelControllers && selectedModelControllers.length>0)? selectedModelControllers[0].getModel() : undefined;
        var selectedModel = this.getSelectedModel();
        if(selectedModel){
            // this.setState({animationTogglePlaceholder: selectedModel.name, animationToggleData: [], animationToggleUncheckableKeys:[], animationToggleCheckedValues:[]});
            this.updateAnimationToggleData();
            this.forceUpdate();
        }
        this.updateAnimationToggleData(selectedModel);
    }

    updateAnimationToggleData(selectedModel){
        // var selectedModel = this.getSelectedModel();
        if(!selectedModel){
            this.setState({animationToggleData: [], animationToggleUncheckableKeys:[], animationToggleCheckedValues:[]});
            return;
        }

        var transformLabel = 'Transform';
        var attributeLabel = 'Attributes';

        var transformkeys = ['position', 'anchorshift', 'scale', 'rotation'];

        var transformData = {
            value: transformLabel,
            label: transformLabel
        };
        transformData.children = [];
        for(let tkey of transformkeys){
            transformData.children.push({
                value: tkey,
                label: tkey
            })
        }
        var attributeData = {
            value: attributeLabel,
            label: attributeLabel
        };
        var animationToggleUncheckableKeys = [transformLabel, attributeLabel];
        // var animationToggleData = [transformData, attributeData];
        var animationToggleData = [transformData];
        // var animationToggle=

        var animationToggleCheckedValues= new Map();

        function getPropEntry(propKey){
            for(let tkey of transformkeys){
                if(propKey===tkey){
                    return;
                }
            }
            // if(propKey in transformkeys){
            //     return;
            // }
            var propval = selectedModel.getProperty(propKey);
            switch(typeof(propval)) {
                case 'number':
                    return {
                        value: propKey,
                        label: propKey
                    };
                    break;
                case 'object':
                    if (propval.constructor && (propval instanceof Vector)) {
                        return {
                            value: propKey,
                            label: propKey,
                        }
                    }
                    break;
                default:
                    break;
            }
        }


        var props = selectedModel.getModelProperties();
        for (let propKey in props) {
            var propentry = getPropEntry(propKey);
            if(propentry){
                animationToggleData.push(propentry);
                if(selectedModel.getKeyframeTrack(propKey)){
                    animationToggleCheckedValues.set(propKey, propKey);
                }else{
                    animationToggleCheckedValues.delete(propKey);
                }
            }
        }
        // }else{
        //     animationToggleUncheckableKeys.push(...transformkeys);
        // }

        for(let t of transformkeys){
            if(selectedModel.getKeyframeTrack(t)){
                animationToggleCheckedValues.set(t, t);
            }else{
                animationToggleCheckedValues.delete(t);
            }
        }
        var checkvals = Array.from(animationToggleCheckedValues.values());
        if(!checkvals){
            checkvals = [];
        }
        this.setState({
            animationToggleData: animationToggleData,
            animationToggleUncheckableKeys:animationToggleUncheckableKeys,
            animationToggleCheckedValues:checkvals
        });
    }


    //</editor-fold>
    //##################\\--App State--//##################

    bindMethods() {
        super.bindMethods();
        this.onAnimationToggleChange = this.onAnimationToggleChange.bind(this);
        this.onControllerSelectionChange = this.onControllerSelectionChange.bind(this);
    }

    onAnimationToggleChange(checkedKeys){
        var selectedModel = this.getSelectedModel();
    //    in a and not b
        let a = new Set(selectedModel.getKeyframeTrackNames());
        let b = new Set(checkedKeys);
        let unchecked = new Set([...a].filter(x => !b.has(x)));
        for(let animated of checkedKeys){
            if(!selectedModel.getKeyframeTrack(animated)){
                selectedModel.addKeyframeTrack(animated);
            }
        }
        for (let toRemove of unchecked.values()){
            selectedModel.removeKeyframeTrack(toRemove);
        }
        this.setState({animationToggleCheckedValues:checkedKeys});
        // this.updateAnimationToggleData();
        // {1}
    }

    render(){
        const renderedGUISpec = this.renderGUISpec();
        const rendervalues = (
            <React.Fragment>
                animate
            </React.Fragment>
        );
        return (
            <div className={"row shape-tools-stage"} key={"row" +this.constructor.name}>
                <br></br>
                <div className={"container atoolpanel"}>
                    <div className={"d-flex justify-content-start atoolpanel-row"}>
                        <div className={"d-inline-flex p-3 align-items-center align-self-center"}>
                            View:
                            <SelectPicker
                                placeholder={"ViewClass"}
                                value={this.state.selectedViewClass}
                                onChange={this.setSelectedViewClass}
                                data={this.state.availableViewClassesDataItems}
                            />
                        </div>
                        {/*<div className={"d-inline-flex p-3 align-items-center align-self-center"}>*/}
                        {/*    <p>Animate:</p>*/}
                        {/*    <CheckTreePicker*/}
                        {/*        defaultExpandAll*/}
                        {/*        countable={false}*/}
                        {/*        // style={{ width: 150 }}*/}
                        {/*        data={this.state.animationToggleData}*/}
                        {/*        uncheckableItemValues={this.state.animationToggleUncheckableKeys}*/}
                        {/*        onChange={this.onAnimationToggleChange}*/}
                        {/*        preventOverflow={true}*/}
                        {/*        value={this.state.animationToggleCheckedValues}*/}
                        {/*        cleanable={false}*/}
                        {/*        style={{ width: 150 }}*/}
                        {/*        searchable={false}*/}
                        {/*        placeholder={this.state.animationTogglePlaceholder}*/}
                        {/*        key={this.state.animationTogglePlaceholder}*/}
                        {/*    />*/}
                        {/*</div>*/}
                    </div>
                    {renderedGUISpec}
                </div>
            </div>
        )
    }
}
