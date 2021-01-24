import AParticleView from "../../../../amvc/views/AParticleView";
import ASliderSpec from "../../../gui/specs/ASliderSpec";
import ExampleExplicitParticleElement from "../elementclasses/ExampleExplicitParticleElement";
import AColorPickerSpec from "../../../AniGraph/src/acomponent/gui/specs/AColorPickerSpec";


function closestPointOnLineSegment(args){
    const point = args.point;
    const A = args.segmentStart;
    const B = args.segmentEnd;

    const AB = B.minus(A);
    const AP = point.minus(A);
    const ABNorm = AB.getNormalized();

    const pdot = (ABNorm.x*AP.x+ABNorm.y*AP.y);
    const alpha = pdot/AB.L2();

    if(alpha>1){
        return B;
    }
    if(alpha<0){
        return A;
    }
    return A.plus(
        AB.times(alpha)
    );
}


export default class NearestPointView extends AParticleView {
    static DefaultParticleClass = ExampleExplicitParticleElement;

    //Define the sliders that you want to appear in the controls tab when the selected view is set to this view
    static GUISpecs = [
        new ASliderSpec({
            name: 'ParticleSize',
            minVal: 0,
            maxVal: 100,
        }),
        new AColorPickerSpec({
            name: 'ParticleColor'
        })
    ];


    /**
     * Initialize slider variables that are global to the app
     * Their values will only be set if they are currently undefined
     */
    initSliderVariablesApp() {
        super.initSliderVariablesApp();
    }

    /**
     * Initialize slider variables that control model properties
     * Their values will only be set if they are currently undefined
     */
    initSliderVariablesModel() {
        super.initSliderVariablesModel();
        this._initModelVariable("ParticleSize", 10);
    }

    constructor(args) {
        super(args);
    }


    createShapeElement(model, open = true) {
        return super.createShapeElement(model, open);
    }


    initGeometry() {
        super.initGeometry();
        const verts = this.getModel().getVertices();
        this.nParticles = verts.length;
        this.particles = [];
        const anchor = this.getModel().getWorldPosition();


        // Here we will create a particle for each edge of our geometry,
        // and set the particle's position to be the point on that edge closest to our model's anchor
        for (let p = 0; p < (this.nParticles - 1); p++) {
            this.particles.push(this.createParticle());
            // var lineseg = new LineSegment2D(verts[p], verts[p+1]);
            this.particles[p].setPosition(closestPointOnLineSegment({
                point: anchor,
                segmentStart: verts[p],
                segmentEnd: verts[p + 1]
            }));
            this.particles[p].show();
            this.particles[p].setRadius(this.getSliderVariable("ParticleSize"));
            // this.particles[p].hide(); // potentially hide particles that have not been emitted yet.
        }
    }

    updateViewElements() {
        super.updateViewElements();
        var time = this.getComponentAppState('appTime');
        time = (time !== undefined) ? time : 0;
        const model = this.getModel();
        // ...

        if (!this.particles) {
            return;
        }

        // If you wanted to emit at a regular interval, or under some condition, you could change this logic.
        // you could also keep track of the last particle you emitted.
        if (this.lastEmitTime === undefined) {
            this.emitParticle(this.particles[0], {time: this.getComponentAppState('appTime')});
            this.lastEmitTime = time;
        }

        const anchor = this.getModel().getWorldPosition();

        const verts = this.getModel().getVertices();
        for (let p = 0; p < (verts.length - 1); p++) {
            var particle = this.particles[p];
            const radius = this.getSliderVariable("ParticleSize");
            particle.setRadius(radius);
            // var lineseg = new LineSegment2D(verts[p], verts[p+1]);
            // particle.setPosition(lineseg.closestPoint(anchor));
            particle.setPosition(closestPointOnLineSegment({
                point: anchor,
                segmentStart: verts[p],
                segmentEnd: verts[p + 1]
            }));
            particle.setAttribute('fill', model.getProperty('ParticleColor'));

        }
    }
}
