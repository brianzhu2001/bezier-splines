import React from "react";
import "../styles/ATimelineComponent.css"
import {Timeliner} from "./timeliner/src/timeliner";
import AComponent from "../AComponent";
import AKeyframe from "./AKeyframe";
import Vector from "../../amath/Vector";
import Vec2, {P2D} from "../../amath/Vec2";
import Vec3 from "../../amath/Vec3";

export default class ATimelineComponent extends AComponent{

    /** Get set timeline */
    set timeline(value){this.setAppState('timeline', value);}
    get timeline(){return this.getAppState('timeline');}

    /** Get set currentTime */
    set currentTime(value){this.setAppState('currentTime', value);}
    get currentTime(){return this.getAppState('currentTime');}

    /** Get set sequenceDuration */
    set sequenceDuration(value){this._sequenceDuration = value;}
    get sequenceDuration(){return this._sequenceDuration;}


    constructor(args) {
        super(args);
        this.currentTime=0;
    }

    _onModelSelectionChange(selectedModel){
        // this.timeline.loadKeyframeTracksFromModel(model);
        this.setModel(selectedModel);
        this.pushChangesToTimeline();
    }

    onKeyframeAdded(trackName, timeliner_keyframe_json){
        var track = this.state.selectedModel.getKeyframeTrack(trackName);
        var newKeyframe = AKeyframe.FromTimelinerJSON(timeliner_keyframe_json);
        newKeyframe.value = this.state.selectedModel.getProperty(trackName);
        timeliner_keyframe_json.uid = newKeyframe.getUID();
        track.addKeyframe(newKeyframe);
        this.state.selectedModel.notifyAnimationTrackChanged();
        // this._onTimelinerUpdate();
    }
    onKeyframeRemoved(trackName, timeliner_keyframe_json){
        var track = this.state.selectedModel.getKeyframeTrack(trackName);
        track.removeKeyframeWithUID(timeliner_keyframe_json.uid);
        // this._onTimelinerUpdate();
    }

    onDuplicateKeyframeAtTime(trackName, timeliner_keyframe_json, time){
        var track = this.state.selectedModel.getKeyframeTrack(trackName);
        track.duplicateKeyframeWithUIDAtTime(timeliner_keyframe_json.uid, time);
        this.state.selectedModel.notifyAnimationTrackChanged();
        // this.pushChangesToTimeline();
    }

    onKeyframeMoved(trackName, timeliner_keyframe_json){
        // this.stopListening();
        var track = this.state.selectedModel.getKeyframeTrack(trackName);
        track.moveKeyframeWithUID(timeliner_keyframe_json.uid, timeliner_keyframe_json.time);
        this.pushChangesToTimeline();
        this.stopListening();
        this.state.selectedModel.notifyListeners({
            type: 'moveKeyframe',
            args: {
                track:track,
                keyframeUID: timeliner_keyframe_json.uid,
                time: timeliner_keyframe_json.time
            }
        });
        this.listen();

        // this.listen();
        // this._onTimelinerUpdate();
    }

    onKeyframeTweenChange(trackName, timeliner_keyframe_json){
        var track = this.state.selectedModel.getKeyframeTrack(trackName);
        track.toggleTweenForKeyframeWithID(timeliner_keyframe_json.uid, timeliner_keyframe_json.tween);
        this.state.selectedModel.notifyListeners({
            type: 'changeInterpolation',
            args: {
                track:track,
                keyframeUID: timeliner_keyframe_json.uid,
            }
        });
    }

    /**
     * Need to turn off listening while updating model with new timeline data
     * Main component is reponsible for updating models when time is changed
     * @param time
     */
    onCurrentTimeUpdate(time){
        this.currentTime=time;
        this.stopListening();
        // console.log(time);
        this.getAppState('model').setSubtreeCurrentAnimationTime(time);
        // this._onTimelinerUpdate();
        this.listen();
    }

    onSequenceDurationUpdate(value){
        this.sequenceDuration=value;
    }

    /**
     * called when range of visible times is updates
     * @param timerange - [earliestvisibletime, latestvisibletime]
     */
    onTimelineUpdateVisibleRange(timerange){
        this.setAppState('timelineVisibleRange', timerange);
    }

    initAppState() {
        super.initAppState();
        const self = this;
        this.addAppStateListener('selectedModelControllers', function(selectedModelControllers){
            const selectedModel = selectedModelControllers && selectedModelControllers.length? selectedModelControllers[0].getModel() : undefined;
            self.setState({selectedModel: selectedModel});
            self._onModelSelectionChange(selectedModel);
        });
        this.timeline = new Timeliner({host:this});
        this.pushChangesToTimeline();
        this.timeline.snapToBottom();
    }

    onModelRelease(){
        this.stopListening();
    }

    pushChangesToTimeline(){
        if(this.timeline) {
            this.timeline.loadKeyframeTracksFromModel(this.model);
        }
    }



    onModelPropertiesUpdate(args, model){
        // var selectedModel = model? model:this.state.selectedModel;
        // function _are_equal(a,b){
        //     if(a===b){
        //         return true;
        //     }
        //     if(a instanceof Vector){
        //         return a.equalTo(b);
        //     }
        //     if(a instanceof Vec2 || a instanceof Vec3 || a instanceof P2D){
        //         return a.equalTo(b);
        //     }
        //     return false;
        // }
        //
        // // console.log(args);
        // const track = selectedModel.getKeyframeTrack(args.name);
        // if(track && track.keyframes.length>0){
        //     var prevkey = track.getPreviousKeyframeForTime(this.currentTime);
        //     if(!prevkey){
        //         prevkey = track.keyframes[0];
        //     }
        //     var propval = selectedModel.getProperty(args.name);
        //     if(!_are_equal(propval, prevkey.value)){
        //         if(prevkey.time===this.currentTime){
        //             prevkey.value =propval;
        //         }else {
        //             var newkey = new AKeyframe({
        //                 time: this.currentTime,
        //                 value: propval,
        //             });
        //             newkey.tween = new (AKeyframe.TweenClass)({startKey: newkey});
        //             track.addKeyframe(newkey, true);
        //             this.pushChangesToTimeline();
        //         }
        //     }
        // }
        // this.updateAnimationTimeline();

    }

    onModelAttributesUpdate(args){
        // this.updateAnimationTimeline();
    }

    onModelUpdate(args){
        const self = this;
        switch (args.type){
            case 'setProperty':
                self.onModelPropertiesUpdate(args);
                break;
            case "setAttributes":
                self.onModelAttributesUpdate(args);
                break;
            case 'animationDataChange':
                self.pushChangesToTimeline(args);
                break;
            case "release":
                return self.onModelRelease();
                break;
            default:
                return;
        }

    }

    // onTimelineUpdate(args){
    //     var self = this;
    //     switch(args.type){
    //         case 'keyframe.added':
    //             this.onKeyframeAdded();
    //             break;
    //     }
    // }


    render(){
        return (
            <div
                className={"anigraph-timeline"}
                // ref={el => {this.setStage(el);}}
                // ref = {this.stage}
                style={{
                    width: '100%'
                }}
            />
        );
    }

}