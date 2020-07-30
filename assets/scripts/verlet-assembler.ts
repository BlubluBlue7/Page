const gfx = cc.gfx

interface BookVertex {
    x:number,
    y:number,
    u:number,
    v:number
}

interface BookQuad {
    lt:number,
    lb:number,
    rb:number,
    rt:number
}

export default class VerletAssembler extends cc.Assembler {
    protected  vfmtPosUvColor = new gfx.VertexFormat([
        { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
        { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
        { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },
        { name: "a_isFront", type: gfx.ATTR_TYPE_FLOAT32, num: 1},
    ]);

    protected verts:BookVertex[] = []
    protected quads:BookQuad[] = []

    public updateRenderData (comp: any) {
        if (comp) {
            let pointList: cc.Vec2[] = comp.getPointList()
            let pointNum: number = pointList.length
            this.verts.length = 0
            this.quads.length = 0
            if (pointNum < 2) {
                return
            }

            let node = comp.node
            let height = node.height
            let width = node.width
            let posX = - width * node.anchorX
            let posY = - height * node.anchorY

            let gapU = 1 / (pointNum - 1)
            let lastU = 0
            let nextU = 0
            for (let i = 1; i < pointNum; i++) {
                let lastPoint = pointList[i - 1]
                let nextPoint = pointList[i]
                nextU = lastU + gapU
                // 顶点和质点一一对应
                let lb = this.verts.push({x: posX + lastPoint.x, y: posY + lastPoint.y, u: lastU, v: 1 })
                let rb = this.verts.push({x: posX + nextPoint.x, y: posY + nextPoint.y, u: nextU, v: 1 })
                let lt = this.verts.push({x: posX + lastPoint.x, y: posY + height + lastPoint.y, u: lastU, v: 0 })
                let rt = this.verts.push({x: posX + nextPoint.x, y: posY + height + nextPoint.y, u: nextU, v: 0 })
                this.quads.push({
                    lb: lb - 1,
                    rb: rb - 1,
                    lt: lt - 1,
                    rt : rt - 1,
                })
                lastU = nextU
            }
        }
    }

    public fillBuffers (comp:cc.RenderComponent, renderer:cc.renderer) {
        if (this.verts.length == 0) {
            return
        }
        let buffer = renderer.getBuffer('mesh', this.vfmtPosUvColor)

        let vertexOffset = buffer.byteOffset >> 2
        let indiceOffset = buffer.indiceOffset
        let vertexId = buffer.vertexOffset

        let verts = this.verts
        let vertexCount = verts.length
        let indiceCount = this.quads.length * 6
        // 通过设定的顶点数量及顶点索引数量获取 buffer 的数据空间
        buffer.request(vertexCount, indiceCount)

        let vbuf = buffer._vData //positon/uv
        let ibuf = buffer._iData //index 
        let uintbuf = buffer._uintVData // colors


        let white = cc.Color.WHITE._val
        // 填充顶点缓冲
        for (let i = 0, len = verts.length; i < len; i++) {
            let vert = verts[i]
            let isFirstVert = i % 2 === 0
            let firstVert = isFirstVert ? vert : verts[i - 1]
            let secondVert = isFirstVert ? verts[i + 1] : vert
            let isFront = firstVert.x < secondVert.x ? 1.0 : 0.0
            vbuf[vertexOffset++] = vert.x;
            vbuf[vertexOffset++] = vert.y;
            vbuf[vertexOffset++] = vert.u;
            vbuf[vertexOffset++] = vert.v;
            uintbuf[vertexOffset++] = white;
            vbuf[vertexOffset++] = isFront;
        }

        // 填充索引缓冲
        // 正面
        for (let i = 0, len = this.quads.length; i < len; i++) {
            let quad = this.quads[i]
            ibuf[indiceOffset++] = vertexId + quad.lb
            ibuf[indiceOffset++] = vertexId + quad.rb
            ibuf[indiceOffset++] = vertexId + quad.lt

            ibuf[indiceOffset++] = vertexId + quad.rb
            ibuf[indiceOffset++] = vertexId + quad.rt
            ibuf[indiceOffset++] = vertexId + quad.lt
        }
    }
}