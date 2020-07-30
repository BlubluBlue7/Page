import BezierAssembler from "./bezier-assembler";

const {ccclass, property} = cc._decorator;


@ccclass
export default class BezierRender extends cc.RenderComponent {
    @property({type: [cc.Texture2D], displayName: "纹理"})
    public textureList: cc.Texture2D[] = []

    @property({displayName: "每条边上的顶点数量"})
    public pointsCount: number = 10

    protected _initedMaterial: boolean = false

    onEnable () {
        super.onEnable();
        this.init();
    }

    public init() {
        if (!this._initedMaterial) {
            this.updateMaterial()
        }

        this.setVertsDirty()
    }

    public _resetAssembler() {
        let assembler = this._assembler = new BezierAssembler()
        assembler.init(this)
    }

    protected _updateMaterial() {
        let material = this.getMaterial(0)
        if (material) {
            material.define('CC_USE_MODEL', 1);
            if (this.textureList.length === 2) {
                material.setProperty('texture0', this.textureList[0]);
                material.setProperty('texture1', this.textureList[1]);
            }
        }
    }

    protected updateMaterial () {
        if (this.textureList.length === 2) {
            this._updateMaterial()
            this._initedMaterial = true
            return
        }   
    }

    public getPointCount() {
        return this.pointsCount
    }

    public updateAngle(angle: number) {
        if(!this._assembler) {
            return
        }

        this._assembler.angle = angle;
        this._assembler.updateRenderData(this);
    }
}