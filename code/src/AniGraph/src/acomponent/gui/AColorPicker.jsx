import React from 'react';
import reactCSS from 'reactcss';
import {SketchPicker} from "react-color";
import tinycolor from "tinycolor2"

const defaultColor = {rgb: tinycolor({r: 200, g:200, b:200, a:1}).toRgb()};

export default class AColorPicker extends React.Component {
    constructor(props){
        super(props);
        if(this.state===undefined){
            this.state = {};
        }
        this.state.value = (props && props.value)? {rgb:tinycolor(props.value)} : defaultColor;
        this.state.displayColorPicker = false;
        this.bindMethods();
    }

    bindMethods() {
        this.handleClick=this.handleClick.bind(this);
        this.handleClose=this.handleClose.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleClick(){
        if(!!this.state.value) {
            this.setState({displayColorPicker: !this.state.displayColorPicker});
        }else{
            this.setState({displayColorPicker: false});
        }
    }

    handleClose(){
        this.setState({ displayColorPicker: false })
    }

    handleChange(value){
        this.setState({value: value});
        this.props.onChange(value);
    }

    render() {
        var color = this.state.value;
        if(color===undefined){
            color = defaultColor;
        }
        // else{
        //     color = color.rgb;
        // }

        const styles = reactCSS({
            'default': {
                color: {
                    padding: '2px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '2px',
                    background: `rgba(${ color.rgb.r }, ${ color.rgb.g }, ${ color.rgb.b }, ${ color.rgb.a })`,
                },
                swatch: {
                    padding: '2px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            },
        });

        return (
            <React.Fragment>
                <div style={ styles.swatch } onClick={ this.handleClick }>
                    <div style={ styles.color }>
                        {this.props.label}
                    </div>
                </div>
                { this.state.displayColorPicker ? <div style={ styles.popover }>
                    <div style={ styles.cover } onClick={ this.handleClose }/>
                    <SketchPicker color={ color } onChange={ this.handleChange } />
                </div> : null }
            </React.Fragment>
        )
    }
}

