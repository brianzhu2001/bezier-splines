import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import jQuery from 'jquery';
import React from "react";
import ReactDOM from "react-dom";
import ABezierInterpolator from "./classes/interpolation/ABezierInterpolator";
import {
    AGUISpec,
    AMVCAppState,
    ASceneGraphEditor,
    AAnimatedModelGroup,
    AKeyframe,
    ATweenComponent,
    ATimelineComponent,
    AAnimatedModel,
    ASliderSpec
} from "./AniGraph"
AKeyframe.TweenClass=ABezierInterpolator;
import CustomEditorComponent from "./classes/components/CustomEditorComponent";
import CustomViewsComponent from "./classes/components/CustomViewsComponent";
import AModelControlPanel from "./classes/components/AModelControlPanel";
import AAnimateMainToolPanel from "./classes/components/AAnimateMainToolPanel";
import AObject from "./AniGraph/src/aobject/AObject";


AObject.MapClasses({
    A2Model: AAnimatedModel,
    A2ModelGroup: AAnimatedModelGroup
})

export default function RunAniGraph() {
    const appState = new AMVCAppState({
        model: new AAnimatedModelGroup({name:'rootModel'}),
        newModelClass: AAnimatedModel,
        GUISpec: new AGUISpec({
            appGUI: [
                new ASliderSpec({
                    name: 'TweenZoom',
                    minVal: 0.1,
                    maxVal: 1.2,
                    defaultValue: 0.5
                })
            ]
        })
    });

    const app = (
        <div>
            <div className={"container-fluid"}>
                <div className={"row"}>
                    <div className={"col-12"}>
                        <AAnimateMainToolPanel appState={appState}/>
                    </div>
                </div>
                <div className={"row"}>
                    <div className={"col-6"}>
                        <div className="container mt-3">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <a className="nav-link active" href="#shapeeditor">Shape Editor</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#creativecontrols">Controls</a>
                                </li>
                            </ul>
                            <div className="tab-content">
                                <div id="shapeeditor" className="container tab-pane active">
                                    <CustomEditorComponent appState={appState}/>
                                </div>
                                <div id="creativecontrols" className="container tab-pane">
                                    <AModelControlPanel appState={appState}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={"col-6"}>
                        <div className="container mt-3">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <a className="nav-link active" href="#liveview">Live View</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#grapheditor">Graph Editor</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#tweeneditor">Tween Editor</a>
                                </li>
                            </ul>
                            <div className="tab-content">
                                <div id="liveview" className="container tab-pane active">
                                    <CustomViewsComponent appState={appState}/>
                                </div>
                                <div id="grapheditor" className="container tab-pane">
                                    <ASceneGraphEditor appState={appState}/>
                                </div>
                                <div id="tweeneditor" className="container tab-pane">
                                    <ATweenComponent appState={appState}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <ATimelineComponent appState={appState}/>
            </div>
            <div style={{height: 100}}>
            </div>
        </div>
    );
    ReactDOM.render(app,
        document.querySelector('#main')
    );
    jQuery(".nav-tabs a").click(function(){
        jQuery(this).tab('show');
    });
}
RunAniGraph();
