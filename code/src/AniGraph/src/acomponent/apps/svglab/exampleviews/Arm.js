import {Matrix3x3, P2D, Vec2, Vec3} from "../../../../amath"

export default function Arm(model, endWorldPoint) {
    const armCoordsEndPoint = model.getWorldToArmMatrix().times(endWorldPoint);
    return {
        model: model,
        armCoordsAnchor: P2D(0,0),
        armCoordsEndPoint: armCoordsEndPoint,
        armPointBaseRotation: Math.atan2(armCoordsEndPoint.y, armCoordsEndPoint.x),
        getAnchor: function() {
            return this.model.getWorldPosition();
        },
        getEndPoint: function () {
            return this.model.getArmToWorldMatrix().times(this.armCoordsEndPoint);
        },
        getRotationToWorldPoint(worldPoint){
            const wpac = this.model.getWorldToArmMatrix().times(worldPoint).getNormalized();
            const armcepn = this.armCoordsEndPoint.getNormalized();
            const armR = Matrix3x3.Rotation(-Math.atan2(armcepn.y, armcepn.x));
            const wrt = armR.times(wpac);
            return this.model.getRotation()+Math.atan2(wrt.y, wrt.x);
        },
        rotateToWorldPoint(worldPoint){
            this.model.setRotation(this.getRotationToWorldPoint(worldPoint));
        },
        setRotation(angle){
            this.model.setRotation(angle);
        },
        worldVector(){
            return this.getEndPoint().minus(this.getAnchor());
        },
        getLength() {
            return this.worldVector().L2();
        }
    }
}