import AKeyframeInterpolation from "../../AniGraph/src/acomponent/atimeline/AKeyframeInterpolation";
import AObject from "../../AniGraph/src/aobject/AObject";

// this is an interpolator for keyframes using 3D (time, x, y) cubic Bezier splines
export default class ABezierInterpolator extends AKeyframeInterpolation {

    constructor(args) {
        super(args);
    }

    // returns spline value at a given time parameter between 0 and 1
    getValueAtTime(time) {
        // return this.getValueAtTimeLinear(time);
        return this.getValueAtTimeBezier(time);
    }

    // returns spline control points as a Vec2 array
    getControlPointArrays(){
        var controls = [];
        if(this.nValueDimensions!==undefined){
            // endKeyTime is a scalar
            var endKeyTime = this.getEndKeyTime();

            // these are all vectors
            var endKeyValues = this.getEndKeyValue();
            var startHandleTimes = this.getStartHandleTimeAbsolute();
            var endHandleTimes = this.getEndHandleTimeAbsolute();
            var startHandleValues = this.getStartHandleValueAbsolute();
            var endHandleValues = this.getEndHandleValueAbsolute();

            for(let d=0;d<this.nValueDimensions;d++){
                var dpoints = [];
                dpoints.push([this.startKey.time, this.startKey.value.elements[d]]);
                dpoints.push([startHandleTimes.elements[d], startHandleValues.elements[d]]);
                dpoints.push([endHandleTimes.elements[d], endHandleValues.elements[d]]);
                dpoints.push([endKeyTime, endKeyValues.elements[d]]);
                controls.push(dpoints);
            }
        }else{
            var dpoints = [];
            dpoints.push([this.startKey.time, this.startKey.value]);
            dpoints.push([this.getStartHandleTimeAbsolute(), this.getStartHandleValueAbsolute()]);
            dpoints.push([this.getEndHandleTimeAbsolute(), this.getEndHandleValueAbsolute()]);
            dpoints.push([this.getEndKeyTime(), this.getEndKeyValue()]);
            controls.push(dpoints);
        }
        return controls;
    }

    // returns spline value at a given time parameter between 0 and 1 using cubic Bezier interpolation
    getValueAtTimeBezier(t) {
        var controlPointArrays = this.getControlPointArrays()
        if(this.nValueDimensions===undefined){
            return ABezierInterpolator.GetSplineYAtX(t, ...controlPointArrays[0]);
        }else{
            var returnarg = [];
            for(let d=0;d<controlPointArrays.length;d++){
                returnarg.push(ABezierInterpolator.GetSplineYAtX(t, ...controlPointArrays[d]));
            }
            return new this.ValueClass(returnarg);
        }
    }

    // AniGraph can keyframe any property that is a scalar or a Vector (which includes Vec2's, Vec3's,
    // and Point2D's). each dimension of the property is represented as a 2D Bezier spline and resolved 
    // individually where the dimensions are (alpha, value). 

    /**
     * get the value of the 2D Bezier spline for specified alpha parameter
     * @param alpha -- the parameter indicating progress along the spline
     * @param p0 -- first control point (scalar)
     * @param p1 -- second control point (scalar)
     * @param p2 -- third control point (scalar)
     * @param p3 -- fourse control point (scalar)
     * @constructor
     */
    static GetSplineValueForAlpha(alpha, p0, p1, p2, p3) {
        return (p0 * (1 - alpha) ** 3
            + p1 * 3 * alpha * (1 - alpha) ** 2
            + p2 * 3 * (1 - alpha) * alpha ** 2
            + p3 * alpha ** 3)
    }

    /**
     * given the four control points of a 3D spline as arrays with two scalars, returns the y coordinate 
     * of the spline at the provided x. the second and third control points are limited to being in between 
     * the first and last control points to guarantee a unique solution. this cannot not be used where x is
     * not between xy0[0] and xy1[0].
     * @param x the x coordinate
     * @param xy0 -- first control point ([x, y])
     * @param xy1 -- second control point ([x, y])
     * @param xy2 -- third control point ([x, y])
     * @param xy3 -- fourth control point ([x, y])
     * @constructor
     */
    static GetSplineYAtX(x, xy0, xy1, xy2, xy3) {
        let alpha = ABezierInterpolator.GetSplineAlphaForValue(x, xy0[0], xy1[0], xy2[0], xy3[0])
        return ABezierInterpolator.GetSplineValueForAlpha(alpha, xy0[1], xy1[1], xy2[1], xy3[1])
    }

    /**
     * gets the alpha that maps to a specified value in a 2D spline, plus or minus 0.001. if there
     * is no such alpha, returns ~0 or ~1, whichever is closest.
     * @param value
     * @param p0
     * @param p1
     * @param p2
     * @param p3
     * @constructor
     */
    static GetSplineAlphaForValue(value, p0, p1, p2, p3) {
        // binary search
        // iter counts iterations, each iteration moves a bound by (1/2)^(iter+1)
        // eg, after iteration 0, the bounds are either [0, 1/2] or [1/2, 1]
        var iter, lower_alpha = 0, upper_alpha = 1
        var lower_dist = ABezierInterpolator.GetSplineValueForAlpha(lower_alpha, p0, p1, p2, p3) - value
        var upper_dist = ABezierInterpolator.GetSplineValueForAlpha(upper_alpha, p0, p1, p2, p3) - value
        // direction is true if low-high, false is high-low
        // this helps us determine which bound to move
        var direction = !!(Math.sign(upper_dist - lower_dist) + 1)
        var mid_alpha, mid_dist
        for (iter = 0; iter < 10; iter += 1) {
            // finds midpoint
            mid_alpha = (lower_alpha + upper_alpha) / 2
            mid_dist = ABezierInterpolator.GetSplineValueForAlpha(mid_alpha, p0, p1, p2, p3) - value
            // chooses the appropriate bound and moves it to the midpoint
            if ((mid_dist > 0) ^ direction) {
                lower_alpha = mid_alpha
                lower_dist = mid_dist
            } else {
                upper_alpha = mid_alpha
                upper_dist = mid_dist
            }
        }
        return (lower_alpha + upper_alpha) / 2
    }
}

AObject.RegisterClass(ABezierInterpolator);


