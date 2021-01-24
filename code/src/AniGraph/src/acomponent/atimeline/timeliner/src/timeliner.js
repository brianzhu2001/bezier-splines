/*
 * @author Joshua Koo http://joshuakoo.com
 */

import AObject from "../../../../aobject/AObject";

const ANIGRAPH_TIMELINER_VERSION = "1.0.0-dev";

import { UndoManager, UndoState } from './utils/util_undo.js'
import { Dispatcher } from './utils/util_dispatcher.js'
import { Theme } from './theme.js'
import { LayoutConstants as Settings } from './layout_constants.js';
import { utils } from './utils/utils.js'
import { LayerCabinet } from './views/layer_cabinet.js'
import { TimelinePanel } from './views/panel.js'
import { IconButton } from './ui/icon_button.js'
var style = utils.style
// var saveToFile = utils.saveToFile
// var openAs = utils.openAs
var STORAGE_PREFIX = utils.STORAGE_PREFIX
import { ScrollBar } from './ui/scrollbar.js'
import { DataStore } from './utils/util_datastore.js'
// import { DockingWindow } from './utils/docking_window.d.ts'
import { DockingWindow } from './utils/docking_window'


var Z_INDEX = 999;


// function LayerProp(name) {
// 	this.name = name;
// 	this.values = [];
// 	this._value = 0;
// 	this._color = '#' + (Math.random() * 0xffffff | 0).toString(16);
// 	/*
// 	this.max
// 	this.min
// 	this.step
// 	*/
// }

import ATimelinerProp from "../ATimelinerProp";

export default class Timeliner extends AObject{
	constructor(args) {
		super(args);
		this.saveToFile = (args && args.saveToFileFunc)? args.saveToFileFunc: utils.saveToFile;
		this.openAs = (args && args.openAsFunc)? args.openAsFunc: utils.openAs;
		this.onTimelineDataUpdate = (args && args.onTimelineDataUpdate)? args.onTimelineDataUpdate: this._onTimelineDataUpdate;
		this.onCurrentTimeUpdate = (args && args.onCurrentTimeUpdate)? args.onCurrentTimeUpdate: this._onCurrentTimeUpdate;
		this.host = (args && args.host!==undefined)? args.host : undefined;
		// this.saveAs = (args && args.saveAsFunction)? args.saveAsFunction :
		this.bindMethods();
		this.initVars();
		this.initTimeliner(args.propDict);
		this.openLocalSave = this.open;
		this.getValues = this.getValueRanges;
		this.onUpdate =
		window.Timeliner = Timeliner;

	}

	/** Get set host */
	set host(value){this.setTimelineHost(value);}
	get host(){return this._host;}

	bindMethods(){
		this.paint = this.paint.bind(this);
		this.resize = this.resize.bind(this);
		this.paint = this.paint.bind(this);
		this.setCurrentTime = this.setCurrentTime.bind(this);
		this.setStatus = this.setStatus.bind(this);
		this.save = this.save.bind(this);
		this.saveSimply = this.saveSimply.bind(this);
		this.open = this.open.bind(this);
		this.load = this.load.bind(this);
		this.exportJSON = this.exportJSON.bind(this);
		this.saveAs = this.saveAs.bind(this);
		// this._onTimelineDataUpdate = this._onTimelineDataUpdate.bind(this);
		this._onCurrentTimeUpdate = this._onCurrentTimeUpdate.bind(this);
	}


	//##################//--ABECODE--\\##################
	//<editor-fold desc="ABECODE">

	getTimelineJSON(){
		return this.data.getJSONString(...arguments);
	}
	setTimelineJSON(json){
		this.data.setJSON(json);
	}


	//##################//--update host funcs--\\##################
	//<editor-fold desc="update host funcs">
	updateHost(args){
		// this.onTimelineDataUpdate(args);
	}

	onKeyframeAdded(layer, keyframe){
		// console.log(layer);
		// console.log(keyframe);
		this.host.onKeyframeAdded(layer._name, keyframe);
	}

	onKeyframeRemoved(layer, keyframe){
		console.log(layer);
		console.log(keyframe);
		this.host.onKeyframeRemoved(layer._name, keyframe);
	}

	onDuplicateKeyframeAtTime(layer, keyframe, time){
		this.host.onDuplicateKeyframeAtTime(layer._name, keyframe, time);
	}

	onTweenChange(layer, keyframe){
		this.host.onKeyframeTweenChange(layer._name, keyframe);
	}

	onKeyframeMoved(layerName, keyframe){
		this.host.onKeyframeMoved(layerName, keyframe);
	}

	// /**
	//  * Default update function. Can be replaced with another function by passing it into constructor args
	//  * @param args
	//  * @private
	//  */
	// _onTimelineDataUpdate(args){
	// 	this.host.onTimelineDataUpdate(this.data.data);
	// }
	_onCurrentTimeUpdate(time){
		this.host.onCurrentTimeUpdate(time);
		// this.host.onCurrentTimeUpdate(time);
		// console.log(time);
		// console.assert("NOT IMPLEMENTED! You should specify onCurrentTimeUpdate in args for constructor");
	}
	_updateTotalTime(totalTime){
		// console.log(totalTime);
		this.host.onSequenceDurationUpdate(totalTime);
	}

	//</editor-fold>
	//##################\\--update host funcs--//##################

	getLayerNamed(name){
		if(!this.layers){
			return;
		}
		for(let l of this.layers){
			if(l.name===name){
				return l;
			}
		}
	}

	setValue(layerName, value){
		dispatcher.fire('value.change', layer, value, done);
	}

	//</editor-fold>
	//##################\\--ABECODE--//##################

	initVars(){
		this.dispatcher = new Dispatcher();
		// Data
		this.data = new DataStore();
		this.layer_store = this.data.get('layers');
		this.layers = this.layer_store.value;
		window._timeliner_data = this.data; // expose it for debugging
		// Undo manager
		this.undo_manager = new UndoManager(this.dispatcher);
		// Views
		this.timeline = new TimelinePanel(this.data, this.dispatcher);
		this.layer_panel = new LayerCabinet(this.data, this.dispatcher);
		this.currentTimeStore = this.data.get('ui:currentTime');

		this.start_play = null;
		this.played_from = 0; // requires some more tweaking
	}

	startPlaying() {
		// played_from = timeline.current_frame;
		this.start_play = performance.now() - this.data.get('ui:currentTime').value * 1000;
		this.layer_panel.setControlStatus(true);
		// dispatcher.fire('controls.status', true);
	}

	pausePlaying() {
		this.start_play = null;
		this.layer_panel.setControlStatus(false);
		// dispatcher.fire('controls.status', false);
	}




	setCurrentTime(value) {
		value = Math.max(0, value);
		this.currentTimeStore.value = value;

		if (this.start_play){
			this.start_play = performance.now() - value * 1000;
		}
		this.onCurrentTimeUpdate(value);
		this.repaintAll();
		// layer_panel.repaint(s);
	}

	/*
    Paint Routines
*/

	paint() {
		requestAnimationFrame(this.paint);
		if (this.start_play) {
			var t = (performance.now() - this.start_play) / 1000;
			this.setCurrentTime(t);


			if (t > this.data.get('ui:totalTime').value) {
				// simple loop
				this.start_play = performance.now();
			}
		}

		if (this.needsResize) {
			this.domelements.div.style.width = Settings.width + 'px';
			this.domelements.div.style.height = Settings.height + 'px';

			this.restyle(this.layer_panel.dom, this.timeline.dom);

			this.timeline.resize();
			this.repaintAll();
			this.needsResize = false;

			this.dispatcher.fire('resize');
		}

		this.timeline._paint();
	}


	save(name) {
		if (!name) name = 'autosave';

		var json = this.getTimelineJSON();
			// this.data.getJSONString();

		try {
			localStorage[STORAGE_PREFIX + name] = json;
			this.dispatcher.fire('save:done');
		} catch (e) {
			console.log('Cannot save', name, json);
		}
	}

	saveAs(name) {
		if (!name) name = this.data.get('name').value;
		name = prompt('Pick a name to save to (localStorage)', name);
		if (name) {
			this.data.data.name = name;
			this.save(name);
		}
	}

	saveSimply() {
		var name = this.data.get('name').value;
		if (name) {
			this.save(name);
		} else {
			this.saveAs(name);
		}
	}

	exportJSON() {
		// var json = this.data.getJSONString();
		var json = this.getTimelineJSON();
		var ret = prompt('Hit OK to download otherwise Copy and Paste JSON', json);

		console.log(JSON.stringify(this.data.data, null, '\t'));
		if (!ret) return;
		// make json downloadable
		// json = this.data.getJSONString('\t');
		json = this.getTimelineJSON('\t');
		var fileName = 'AniGraphScene' + '.json';
		this.saveToFile(json, fileName);
	}

	loadJSONString(o) {
		// should catch and check errors here
		var json = JSON.parse(o);
		this.load(json);
	}

	load(o) {
		// this.data.setJSON(o);
		this.setTimelineJSON(o);
		//
		if (this.data.getValue('ui') === undefined) {
			this.data.setValue('ui', {
				currentTime: 0,
				totalTime: Settings.default_length,
				scrollTime: 0,
				visibleTimeRange: [0,0],
				timeScale: Settings.time_scale
			});
		}
		this.undo_manager.clear();
		this.undo_manager.save(new UndoState(this.data, 'Loaded'), true);
		this.updateState();
	}

	loadKeyframeTracksFromModel(model){
		var kfts = model? model.getKeyframeTracks():undefined;
		if(kfts===undefined || kfts.size===0){
			this.loadLayers([]);
			return;
		}

		const layerjsons = [];
		for(let track of Object.values(kfts)){
			layerjsons.push(track.getTimelinerJSON());
		}
		this.loadLayers(layerjsons, model.name);
	}

	loadLayers(layers, title){
		this.data.data.layers = layers;
		// this.layers=layers;

		// this.layer_panel.setState(this.layer_store);

		if(title!==undefined){
			this.data.data.title = title;
		}
		this.data.modified = new Date().toString();
		this.undo_manager.clear();
		this.undo_manager.save(new UndoState(this.data, 'Loaded'), true);
		this.updateState();



	}

	updateState() {
		this.layers = this.layer_store.value; // FIXME: support Arrays
		this.layer_panel.setState(this.layer_store);
		this.timeline.setState(this.layer_store);
		this.updateHost(this.data.data);

		this.repaintAll();
	}

	repaintAll() {
		var content_height = this.layers.length * Settings.LINE_HEIGHT;
		this.scrollbar.setLength(Settings.TIMELINE_SCROLL_HEIGHT / content_height);
		this.layer_panel.repaint();
		this.timeline.repaint();
	}

	promptImport() {
		var json = prompt('Paste JSON in here to Load');
		if (!json) return;
		console.log('Loading.. ', json);
		this.loadJSONString(json);
	}

	open(title) {
		if (title) {
			this.loadJSONString(localStorage[STORAGE_PREFIX + title]);
		}
	}

	resize(width, height) {
		// data.get('ui:bounds').value = {
		// 	width: width,
		// 	height: height
		// };
		// TODO: remove ugly hardcodes
		width -= 4;
		height -= 44;

		Settings.width = width - Settings.LEFT_PANE_WIDTH;
		Settings.height = height;

		Settings.TIMELINE_SCROLL_HEIGHT = height - Settings.MARKER_TRACK_HEIGHT;
		var scrollable_height = Settings.TIMELINE_SCROLL_HEIGHT;

		this.scrollbar.setHeight(scrollable_height - 2);

		style(this.scrollbar.dom, {
			top: Settings.MARKER_TRACK_HEIGHT + 'px',
			left: (width - 16) + 'px',
		});

		this.needsResize = true;
	}

	restyle(left, right) {
		left.style.cssText = 'position: absolute; left: 0px; top: 0px; height: ' + Settings.height + 'px;';
		style(left, {
			// background: Theme.a,
			overflow: 'hidden'
		});
		left.style.width = Settings.LEFT_PANE_WIDTH + 'px';

		// right.style.cssText = 'position: absolute; top: 0px;';
		right.style.position = 'absolute';
		right.style.top = '0px';
		right.style.left = Settings.LEFT_PANE_WIDTH + 'px';
	}

	addLayer(name) {
		var layer = new ATimelinerProp({name:name});

		this.layers = this.layer_store.value;
		this.layers.push(layer);

		this.layer_panel.setState(this.layer_store);
	}

	sortLayers(){
		// this.layers = this.layer_store.value;
		// for(let i=0;i<this.layers.length;i++){
			// this.layers[i].sortKeyframes();
		// }
		// this.layer_panel.setState(this.layer_store);
		this.updateState();
		this.repaintAll()
	}

	setTimelineHost(t) {
		this._host = t;
	};

	getValueRanges(ranges, interval) {
		interval = interval ? interval : 0.15;
		ranges = ranges ? ranges : 2;

		// not optimized!
		var t = this.data.get('ui:currentTime').value;

		var values = [];

		for (var u = -ranges; u <= ranges; u++) {
			// if (u == 0) continue;
			var o = {};

			for (var l = 0; l < layers.length; l++) {
				var layer = layers[l];
				var m = utils.layerPropInfoAtTime(layer, t + u * interval);
				o[layer.name] = m.value;
			}

			values.push(o);

		}

		return values;
	}



	setStatus(text) {
		this.domelements.label_status.textContent = text;
	};

	initDOMStuff(){
		this.domelements = {};
		this.buttons = {};
		this.domelements.div = document.createElement('div');
		var div = this.domelements.div;

		style(div, {
			textAlign: 'left',
			lineHeight: '1em',
			position: 'absolute',
			top: '22px'
		});

		this.domelements.pane = document.createElement('div');
		var pane = this.domelements.pane;
		style(pane, {
			position: 'fixed',
			top: '20px',
			left: '20px',
			margin: 0,
			border: '1px solid ' + Theme.a,
			padding: 0,
			overflow: 'hidden',
			backgroundColor: Theme.a,
			color: Theme.d,
			zIndex: Z_INDEX,
			fontFamily: 'monospace',
			fontSize: '12px'
		});

		this.header_styles = {
			position: 'absolute',
			top: '0px',
			width: '100%',
			height: '22px',
			lineHeight: '22px',
			overflow: 'hidden'
		};


		this.button_styles = {
			width: '20px',
			height: '20px',
			padding: '2px',
			marginRight: '2px'
		};

		var header_styles = this.header_styles;
		var button_styles = this.button_styles;

		this.domelements.pane_title =document.createElement('div');
		var pane_title = this.domelements.pane_title;



		style(pane_title, header_styles, {
			borderBottom: '1px solid ' + Theme.b,
			textAlign: 'center'
		});

		this.domelements.title_bar = document.createElement('span');
		var title_bar = this.domelements.title_bar;



		pane_title.appendChild(title_bar);
		title_bar.innerHTML = 'AniGraph Timeline ' + ANIGRAPH_TIMELINER_VERSION;
		pane_title.appendChild(title_bar);

		this.domelements.top_right_bar =document.createElement('div');
		var top_right_bar =this.domelements.top_right_bar;
		style(top_right_bar, header_styles, {
			textAlign: 'right'
		});

		pane_title.appendChild(top_right_bar);

		// resize minimize
		// var resize_small = new IconButton(10, 'resize_small', 'minimize', dispatcher);
		// top_right_bar.appendChild(resize_small.dom);

		// resize full

		this.buttons.resize_full =new IconButton(10, 'resize_full', 'maximize', this.dispatcher);
		var resize_full = this.buttons.resize_full;

		style(resize_full.dom, button_styles, { marginRight: '2px' });
		top_right_bar.appendChild(resize_full.dom);

		this.domelements.pane_status = document.createElement('div');
		var pane_status = this.domelements.pane_status;


		var footer_styles = {
			position: 'absolute',
			width: '100%',
			height: '22px',
			lineHeight: '22px',
			bottom: '0',
			// padding: '2px',
			background: Theme.a,
			fontSize: '11px'
		};

		style(pane_status, footer_styles, {
			borderTop: '1px solid ' + Theme.b,
		});

		pane.appendChild(div);
		pane.appendChild(pane_status);
		pane.appendChild(pane_title);

		this.domelements.label_status =document.createElement('span');
		var label_status = this.domelements.label_status;
		label_status.textContent = 'hello!';
		label_status.style.marginLeft = '10px';
	}


	keydown(e) {
		var play = e.keyCode == 32; // space
		var enter = e.keyCode == 13; //
		var undo = e.metaKey && e.keyCode == 91 && !e.shiftKey;

		var active = document.activeElement;
		// console.log( active.nodeName );

		if (active.nodeName.match(/(INPUT|BUTTON|SELECT|TIMELINER)/)) {
			active.blur();
		}

		if (play) {
			self.dispatcher.fire('controls.toggle_play');
		}
		else if (enter) {
			// FIXME: Return should play from the start or last played from?
			dispatcher.fire('controls.restart_play');
			// dispatcher.fire('controls.undo');
		}
		else if (e.keyCode == 27) {
			// Esc = stop. FIXME: should rewind head to last played from or Last pointed from?
			dispatcher.fire('controls.pause');
		}
		// else console.log('keydown', e.keyCode);
	}

	initButtons(){
		// zoom in
		this.buttons.zoom_in = new IconButton(12, 'zoom_in', 'zoom in', this.dispatcher);
		// zoom out
		this.buttons.zoom_out = new IconButton(12, 'zoom_out', 'zoom out', this.dispatcher);
		// settings
		this.buttons.cog = new IconButton(12, 'cog', 'settings', this.dispatcher);

		// this.domelements.bottom_right.appendChild(zoom_in.dom);
		// this.domelements.bottom_right.appendChild(zoom_out.dom);
		// this.domelements.bottom_right.appendChild(cog.dom);

		// add layer
		this.buttons.plus = new IconButton(12, 'plus', 'New Layer', this.dispatcher);
		this.buttons.plus.onClick(function() {
			var name = prompt('Layer name?');
			self.addLayer(name);

			undo_manager.save(new UndoState(data, 'Layer added'));

			self.repaintAll();
		});
		style(this.buttons.plus.dom, this.button_styles);
		this.domelements.bottom_right.appendChild(this.buttons.plus.dom);


		// trash
		this.buttons.trash = new IconButton(12, 'trash', 'Delete save', this.dispatcher);
		this.buttons.trash.onClick(function() {
			var name = data.get('name').value;
			if (name && localStorage[STORAGE_PREFIX + name]) {
				var ok = confirm('Are you sure you wish to delete ' + name + '?');
				if (ok) {
					delete localStorage[STORAGE_PREFIX + name];
					dispatcher.fire('status', name + ' deleted');
					dispatcher.fire('save:done');
				}
			}
		});
		style(this.buttons.trash.dom, this.button_styles, { marginRight: '2px' });
		this.domelements.bottom_right.appendChild(this.buttons.trash.dom);
	}

	dispose() {
		var domParent = this.domelements.pane.parentElement;
		domParent.removeChild(this.domelements.pane);
		domParent.removeChild(this.domelements.ghostpane);
	};

	snapToBottom(){
		// this.widget.snapToType('dock-bottom');
		this.widget.snapToType('snap-bottom-edge');
		console.log("Snapping timeline to bottom");
	}

	initTimeliner() {
		var self = this;
		// Dispatcher for coordination
		var dispatcher = this.dispatcher;
		// Data
		var data = this.data;
		var layer_store = this.layer_store;
		var layers = this.layers;
		// Undo manager
		var undo_manager = this.undo_manager;
		// Views
		var timeline = this.timeline;
		var layer_panel = this.layer_panel;

		setTimeout(function() {
			// hack!
			undo_manager.save(new UndoState(data, 'Loaded'), true);
		});

		dispatcher.on('keyframe', function(layer, value) {
			// var index = layers.indexOf(layer);

			var t = data.get('ui:currentTime').value;
			var v = utils.findTimeinLayer(layer, t);

			// console.log(v, '...keyframe index', index, utils.format_friendly_seconds(t), typeof(v));
			// console.log('layer', layer, value);

			if (typeof(v) === 'number') {
				// this means that it was not on a existing keyframe. It should add a new keyframe, then, spliced at index v
				var keyToAdd = {
					time: t,
					value: value,
					_color: '#' + (Math.random() * 0xffffff | 0).toString(16)
				};
				layer.values.splice(v, 0, keyToAdd);
				self.onKeyframeAdded(layer, keyToAdd);
				// undo_manager.save(new UndoState(data, 'Add Keyframe'));
			} else {
				// console.log('remove from index', v);
				layer.values.splice(v.index, 1);
				// self.sortLayers();
				self.onKeyframeRemoved(layer, v.object);
				// undo_manager.save(new UndoState(data, 'Remove Keyframe'));
			}

			self.repaintAll();

		});

		dispatcher.on('keyframe.dup', function(layer, value) {
			var t = data.get('ui:currentTime').value;
			var v = utils.findTimeinLayer(layer, t);
			if (typeof(v) === 'number') {
				self.onDuplicateKeyframeAtTime(layer, layer.values[v-1],t);
			} else {
				self.onDuplicateKeyframeAtTime(layer, layer.values[v.index],t);
			}

			self.repaintAll();

		});


		dispatcher.on('keyframe.previous', function(layer, value) {
			// var index = layers.indexOf(layer);
			var t = data.get('ui:currentTime').value;
			var v = utils.findTimeinLayer(layer, t);
			if (typeof(v) === 'number') {
				// this means that it was not on a existing keyframe. It should add a new keyframe, then, spliced at index v
				if(v>0){
					self.setCurrentTime(layer.values[v-1].time);
				}else{
					self.setCurrentTime(0);
				}

			} else {
				if(v.index>0){
					self.setCurrentTime(layer.values[v.index-1].time);
				}else{
					self.setCurrentTime(0);
				}
			}

			self.repaintAll();

		});

		dispatcher.on('keyframe.next', function(layer, value) {
			// var index = layers.indexOf(layer);
			var t = data.get('ui:currentTime').value;
			var v = utils.findTimeinLayer(layer, t);
			if (typeof(v) === 'number') {
				// this means that it was not on a existing keyframe. It should add a new keyframe, then, spliced at index v
				if(v<layer.values.length){
					self.setCurrentTime(layer.values[v].time);
				}

			} else {
				if(v.index<layer.values.length){
					self.setCurrentTime(layer.values[v.index+1].time);
				}
			}

			self.repaintAll();

		});



		dispatcher.on('keyframe.move', function(object, newTime) {
			// undo_manager.save(new UndoState(data, 'Move Keyframe'));
			// self.sortLayers();
			// console.log([layer, value]);
			if(object.isKeyframe) {
				console.assert(newTime === object.keyframe.time, "newTime out of synch with keyframe time");
				self.onKeyframeMoved(object.layerName, object.keyframe);
				self.repaintAll();
			}
		});

		// dispatcher.fire('value.change', layer, me.value);
		dispatcher.on('value.change', function(layer, value, dont_save) {
			if (layer._mute) return;

			var t = data.get('ui:currentTime').value;
			var v = utils.findTimeinLayer(layer, t);

			// console.log(v, 'value.change', layer, value, utils.format_friendly_seconds(t), typeof(v));
			//if it's a number that means there is not a key at t, and v is the index where the new key should be spliced... I didn't write this... (Abe)
			if (typeof(v) === 'number') {
				layer.values.splice(v, 0, {
					time: t,
					value: value,
					_color: '#' + (Math.random() * 0xffffff | 0).toString(16)
				});
				if (!dont_save) undo_manager.save(new UndoState(data, 'Add value'));
			} else {
				v.object.value = value;
				if (!dont_save) undo_manager.save(new UndoState(data, 'Update value'));
			}

			self.repaintAll();
		});

		dispatcher.on('action:solo', function(layer, solo) {
			layer._solo = solo;

			console.log(layer, solo);

			// When a track is solo-ed, playback only changes values
			// of that layer.
		});

		dispatcher.on('action:mute', function(layer, mute) {
			layer._mute = mute;

			// When a track is mute, playback does not play
			// frames of those muted layers.

			// also feels like hidden feature in photoshop

			// when values are updated, eg. from slider,
			// no tweens will be created.
			// we can decide also to "lock in" layers
			// no changes to tween will be made etc.
		});

		dispatcher.on('ease', function(layer, ease_type) {
			var t = data.get('ui:currentTime').value;
			var v = utils.layerPropInfoAtTime(layer, t);
			// console.log('Ease Change > ', layer, value, v);
			if (v && v.entry) {
				if(ease_type==='default'){
					delete v.entry.tween;
				}else {
					v.entry.tween = ease_type;
				}
				self.onTweenChange(layer, v.entry);
			}
			// undo_manager.save(new UndoState(data, 'Add Ease'));
			self.repaintAll();
		});



		dispatcher.on('controls.toggle_play', function() {
			if (self.start_play) {
				self.pausePlaying();
			} else {
				self.startPlaying();
			}
		});

		dispatcher.on('controls.restart_play', function() {
			if (!self.start_play) {
				self.startPlaying();
			}

			self.setCurrentTime(played_from);
		});

		dispatcher.on('controls.play', self.startPlaying);
		dispatcher.on('controls.pause', self.pausePlaying);


		dispatcher.on('controls.stop', function() {
			if (self.start_play !== null) self.pausePlaying();
			self.setCurrentTime(0);
		});


		dispatcher.on('time.update', self.setCurrentTime);

		dispatcher.on('totalTime.update', function(value) {
			self._updateTotalTime(value);
			// console.log("totalTime")
			// console.log(value);
			// context.totalTime = value;
			// controller.setDuration(value);
			// timeline.repaint();
		});

		/* update scroll viewport */
		dispatcher.on('update.scrollTime', function(v) {
			// console.log(v);
			v = Math.max(0, v);
			data.get('ui:scrollTime').value = v;
			self.repaintAll();
		});

		dispatcher.on('update.visibleTimeRange', function(vrange){
			// console.log(vrange);
			var oldval = data.get('ui:visibleTimeRange').value;
			if(oldval[0]!==vrange[0] || oldval[1]!==vrange[1]){
				data.get('ui:visibleTimeRange').value = vrange;
				self.host.onTimelineUpdateVisibleRange(vrange);
			}
			// console.log(oldval);
		});


		// dispatcher.on('target.notify', function(name, value) {
		// 	if (target) target[name] = value;
		// });

		dispatcher.on('update.scale', function(v) {
			// console.log('range', v);
			data.get('ui:timeScale').value = v;
			// self.host.onTimelineScaleUpdate(v);
			timeline.repaint();
		});

		// handle undo / redo
		dispatcher.on('controls.undo', function() {
			var history = undo_manager.undo();
			// data.setJSONString(history.state);
			// self.updateState();
			self.setTimelineJSON(history.state);
			self.updateState();
		});

		dispatcher.on('controls.redo', function() {
			var history = undo_manager.redo();
			// data.setJSONString(history.state);
			// self.updateState();
			self.setTimelineJSON(history.state);
			self.updateState();
		});


		// self.paint();


		// this.openLocalSave = self.open;

		dispatcher.on('import', function() {
			self.promptImport();
		}.bind(this));

		dispatcher.on('new', function() {
			data.blank();
			self.updateState();
		});

		dispatcher.on('openfile', function() {
			self.openAs(function(data) {
				// console.log('loaded ' + data);
				self.loadJSONString(data);
			}, div);
		});

		dispatcher.on('open', self.open);
		dispatcher.on('export', self.exportJSON);

		dispatcher.on('save', self.saveSimply);
		dispatcher.on('save_as', self.saveAs);

		// Expose API
		// this.save = save;
		// this.load = load;

		/*
            Start DOM Stuff (should separate file)
        */

//##################//--DOM STUFF--\\##################
//<editor-fold desc="DOM STUFF">
		this.initDOMStuff();
		var header_styles = this.header_styles;
		var button_styles = this.button_styles;
		var pane = this.domelements.pane;
		var div = this.domelements.div;
		var label_status = this.domelements.label_status;
		var pane_status = this.domelements.pane_status;
		var top_right_bar =this.domelements.top_right_bar;
		var title_bar = this.domelements.title_bar;
		var pane_title = this.domelements.pane_title;
		var header_styles = this.header_styles;
		var button_styles = this.button_styles;
//</editor-fold>
//##################\\--DOM STUFF--//##################
		self.paint();

		dispatcher.on('state:save', function(description) {
			dispatcher.fire('status', description);
			self.save('autosave');
		});

		dispatcher.on('status', this.setStatus);

		this.domelements.bottom_right =document.createElement('div');
		style(this.domelements.bottom_right, this.footer_styles, {
			textAlign: 'right'
		});


		// var button_save = document.createElement('button');
		// style(button_save, button_styles);
		// button_save.textContent = 'Save';
		// button_save.onclick = function() {
		// 	save();
		// };

		// var button_load = document.createElement('button');
		// style(button_load, button_styles);
		// button_load.textContent = 'Import';
		// button_load.onclick = this.promptLoad;

		// var button_open = document.createElement('button');
		// style(button_open, button_styles);
		// button_open.textContent = 'Open';
		// button_open.onclick = this.promptOpen;


		// this.domelements.bottom_right.appendChild(button_load);
		// this.domelements.bottom_right.appendChild(button_save);
		// this.domelements.bottom_right.appendChild(button_open);

		this.domelements.pane_status.appendChild(this.domelements.label_status);
		this.domelements.pane_status.appendChild(this.domelements.bottom_right);


		/**/
		this.initButtons();


		// pane_status.appendChild(document.createTextNode(' | TODO <Dock Full | Dock Botton | Snap Window Edges | zoom in | zoom out | Settings | help>'));

		/*
                End DOM Stuff
        */

		this.domelements.ghostpane =document.createElement('div');
		var ghostpane = this.domelements.ghostpane
		ghostpane.id = 'ghostpane';
		style(ghostpane, {
			background: '#999',
			opacity: 0.2,
			position: 'fixed',
			margin: 0,
			padding: 0,
			zIndex: (Z_INDEX - 1),
			// transition: 'all 0.25s ease-in-out',
			transitionProperty: 'top, left, width, height, opacity',
			transitionDuration: '0.25s',
			transitionTimingFunction: 'ease-in-out'
		});


		//
		// Handle DOM Views
		//

		// Shadow Root
		this.domelements.root = document.createElement('timeliner');
		var root = this.domelements.root;
		document.body.appendChild(root);
		if (root.createShadowRoot) root = root.createShadowRoot();

		window.r = root;

		// var iframe = document.createElement('iframe');
		// document.body.appendChild(iframe);
		// root = iframe.contentDocument.body;

		root.appendChild(pane);
		root.appendChild(ghostpane);

		div.appendChild(layer_panel.dom);
		div.appendChild(timeline.dom);

		this.scrollbar = new ScrollBar(200, 10);
		var scrollbar = this.scrollbar;
		div.appendChild(scrollbar.dom);

		// percentages
		scrollbar.onScroll.do(function(type, scrollTo) {
			switch (type) {
				case 'scrollto':
					layer_panel.scrollTo(scrollTo);
					timeline.scrollTo(scrollTo, layer_panel);
					break;
				//		case 'pageup':
				// 			scrollTop -= pageOffset;
				// 			me.draw();
				// 			me.updateScrollbar();
				// 			break;
				// 		case 'pagedown':
				// 			scrollTop += pageOffset;
				// 			me.draw();
				// 			me.updateScrollbar();
				// 			break;
			}
		});



		// document.addEventListener('keypress', function(e) {
		// 	console.log('kp', e);
		// });
		// document.addEventListener('keyup', function(e) {
		// 	if (undo) console.log('UNDO');

		// 	console.log('kd', e);
		// });

		// TODO: Keyboard Shortcuts
		// Esc - Stop and review to last played from / to the start?
		// Space - play / pause from current position
		// Enter - play all
		// k - keyframe

		// document.addEventListener('keydown', this.keydown);

		this.needsResize = true;

		// this.addLayer = addLayer;
		// this.dispose = function dispose() {
		// 	var domParent = pane.parentElement;
		// 	domParent.removeChild(pane);
		// 	domParent.removeChild(ghostpane);
		// };

		// this.setTarget = function(t) {
		// 	target = t;
		// };
		//
		// function getValueRanges(ranges, interval) {
		// 	interval = interval ? interval : 0.15;
		// 	ranges = ranges ? ranges : 2;
		//
		// 	// not optimized!
		// 	var t = data.get('ui:currentTime').value;
		//
		// 	var values = [];
		//
		// 	for (var u = -ranges; u <= ranges; u++) {
		// 		// if (u == 0) continue;
		// 		var o = {};
		//
		// 		for (var l = 0; l < layers.length; l++) {
		// 			var layer = layers[l];
		// 			var m = utils.layerPropInfoAtTime(layer, t + u * interval);
		// 			o[layer.name] = m.value;
		// 		}
		//
		// 		values.push(o);
		//
		// 	}
		//
		// 	return values;
		// }
		//
		// this.getValues = getValueRanges;

		/* Integrate pane into docking window */
		this.widget = new DockingWindow(pane, ghostpane)
		this.widget.allowMove(false);
		this.widget.resizes.do(self.resize)


		// pane_title.addEventListener('mouseover', function() {
		// 	self.widget.allowMove(true);
		// });

		pane_title.addEventListener('mouseout', function() {
			self.widget.allowMove(false);
		});




		//##################//--Add--\\##################
		//<editor-fold desc="Add">
		// widget.snapToType('dock-bottom');
		// widget.snapToType('snap-bottom-edge');
		//</editor-fold>
		//##################\\--Add--//##################
	}
}

// window.Timeliner = Timeliner;

export { Timeliner }