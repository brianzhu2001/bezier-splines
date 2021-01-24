import React from "react"
import {Checkbox, Toggle} from "rsuite";
import {Uploader} from "rsuite";
import AModelColorPicker from "../../AniGraph/src/acomponent/gui/AModelColorPicker";
import AModelSlider from "../../AniGraph/src/acomponent/gui/AModelSlider";
import ASelectPicker from "../../AniGraph/src/acomponent/gui/ASelectPicker";
import ASVGLabMainToolPanel from "../../AniGraph/src/acomponent/apps/svglab/ASVGLabMainToolPanel";

export default class AAnimateMainToolPanel extends ASVGLabMainToolPanel{
    //##################//--new app state--\\##################
    //<editor-fold desc="new app state">

    bindMethods() {
        super.bindMethods();
        this.setSelectedKeyframeTrackName = this.setSelectedKeyframeTrackName.bind(this);
        this.getSelectedKeyframeTrackName = this.getSelectedKeyframeTrackName.bind(this);
        this.onSelectedKeyframeTrackChanged = this.onSelectedKeyframeTrackChanged.bind(this);
        this.onSelectedModelChanged = this.onSelectedModelChanged.bind(this);
    }

    onSelectedKeyframeTrackChanged(selectedKeyframeTrackName){
        this.setState({selectedKeyframeTrackName: selectedKeyframeTrackName});
    }

    initAppState() {
        super.initAppState();
        const self=this;
        this.addAppStateListener('selectedKeyframeTrackName', function(selectedKeyframeTrackName){
            self.onSelectedKeyframeTrackChanged(selectedKeyframeTrackName);
        })
        this.addAppEventListener('keyframeTrackAdded', function(){
            self.onSelectedModelChanged(self.getSelectedModel());
        })
    }


    onSelectedControllersChanged(selectedModelControllers) {
        super.onSelectedControllersChanged(selectedModelControllers);
        const selectedModel = selectedModelControllers && selectedModelControllers.length ? selectedModelControllers[0].getModel() : undefined;
        this.onSelectedModelChanged(selectedModel);
    }
    onSelectedModelChanged(selectedModel){
        if(selectedModel) {
            this.setState({
                availableKeyframeTracks: this._getModeDataItems(selectedModel.getKeyframeTrackNames())
            });
            if (selectedModel.getKeyframeTrack(this.state.selectedKeyframeTrackName)) {
                this.onSelectedKeyframeTrackChanged(this.state.selectedKeyframeTrackName);
            }else{
                this.setSelectedKeyframeTrackName();
            }
        }
    }

    //##################//--selectedKeyframeTrackName--\\##################
    //<editor-fold desc="selectedKeyframeTrackName">
    setSelectedKeyframeTrackName(value){
        this.setAppState('selectedKeyframeTrackName', value);
    }
    getSelectedKeyframeTrackName(){
        return this.getAppState('selectedKeyframeTrackName');
    }
    //</editor-fold>
    //##################\\--selectedKeyframeTrackName--//##################


    render(){
        const uploaderStyles = {
            lineHeight: '15px'
        }
        return (
            <div className={"row shape-tools-stage"} key={"row" +this.constructor.name}>
                {/*<div className={""} key={"col" + this.constructor.name}>*/}
                <div className={"container atoolpanel"}>
                    <div className={"d-flex justify-content-end atoolpanel-row"}>
                        <div className={"d-inline-flex p-2 align-items-center align-self-center"}>
                            <button onClick = {this.saveJSON}>
                                SaveJSON
                            </button>
                        </div>
                        <div className={"d-inline-flex p-2 align-items-center align-self-center"}>
                            <button onClick={this.saveSVG}>SaveSVG</button>
                        </div>
                        <div className={"d-inline-flex p-2 align-items-right align-self-center"}>
                            <Uploader action="//jsonplaceholder.typicode.com/posts/" draggable onUpload={this.onUpload}>
                                <div style={uploaderStyles}>Open [Risky]</div>
                            </Uploader>
                        </div>
                        <div className={"d-inline-flex p-2 align-items-right align-self-center"}>
                            Fill: <AModelColorPicker model={this.state.selectedModel} attribute={'fill'}/>
                        </div>
                        <div className={"p-2 align-items-right align-self-center"}>
                            <button onClick = {this.onRunScriptButtonClick}>
                                Script
                            </button>
                        </div>
                        <div className={"p-2 align-items-right align-self-center"}>
                            <button onClick = {this.onRandomShapeButtonClick}>
                                Random
                            </button>
                        </div>
                        <div className={"d-inline-flex p-2 align-items-right align-self-center"}>
                            Stroke: <AModelColorPicker model={this.state.selectedModel} attribute={'stroke'}/>
                        </div>
                        <div className={"d-inline-flex p-3 align-items-right align-self-center"}>
                            Stroke <AModelSlider model={this.state.selectedModel} min={0} max={20} getValueFromModel={this.getModelStrokeWidth} setModelValue={this.setModelStrokeWidth} step={0.1}/>
                        </div>


                    </div>
                    <div className={"d-flex justify-content-end atoolpanel-row"} style={{height: '50px'}}>
                        <div className={"d-inline-flex p-2 mr-auto"}>
                            <div className={"p-2 align-self-center"}>
                                <ASelectPicker
                                    placeholder={"SelectionMode"}
                                    onChange={this.setCurrentSelectionMode}
                                    data={this.state.selectionModeDataItems}
                                    value={this.getCurrentSelectionMode}
                                    defaultValue={this.getCurrentSelectionMode()}
                                />
                            </div>
                            <div className={"p-2 align-self-center"}>
                                <Checkbox
                                    checked={this.state.autoGroupIsOn}
                                    onChange={(args)=>{
                                        this.onAutoGroupToggle(args);
                                    }}
                                    style={{border: '2px solid #dddddd', borderRadius: '10px', paddingRight: '5px'}}>
                                    AutoGroup
                                </Checkbox>
                            </div>
                            <div className={"p-2 align-self-center"}>
                                <ASelectPicker
                                    placeholder={"KeyframeTrack"}
                                    onChange={this.setSelectedKeyframeTrackName}
                                    data={this.state.availableKeyframeTracks}
                                    value={this.getSelectedKeyframeTrackName}
                                    defaultValue={this.getSelectedKeyframeTrackName()}
                                />
                            </div>
                        </div>
                        {/*<div className={"d-inline-flex p-2 align-items-right align-self-center"}>*/}
                        {/*    <button onClick={this.onDeleteButtonClick}>Delete</button>*/}
                        {/*</div>*/}
                        <div className={"p-3 align-items-right align-self-center"}>
                            New:<Toggle onChange={this.setIsCreatingNewShape} checked={this.state.isCreatingNewShape}/>
                        </div>
                        <div className={"d-inline-flex p-3 align-items-right align-self-center"}>
                            Rotation <AModelSlider model={this.state.selectedModel} min={-4*Math.PI} max={4*Math.PI} getValueFromModel={this.getModelRotation} setModelValue={this.setModelRotation} step={0.1}/>
                        </div>
                        <div className={"d-inline-flex p-3 align-items-right align-self-center"}>
                            <ASelectPicker
                                placeholder={"EditMode"}
                                onChange={this.setCurrentEditMode}
                                data={this.state.editModeDataItems}
                                value={this.getCurrentEditMode}
                                defaultValue={this.getCurrentEditMode()}
                            />
                        </div>
                    </div>
                    {this.props.children}
                </div>
            </div>
        )
    }
}