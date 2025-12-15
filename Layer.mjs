export class Layer {

    static properties = new Set(['id', 'scale', 'angle', 'x', 'y', 'flipX', 'flipY', 'color']);

    constructor(id) {
        this.id = id;
        this.scale = 0.25;
        this.angle = 0;
        this.x = 0;
        this.y = 0;
        this.flipX = false;
        this.flipY = false;
        this.color = 0xffffff;
    }


    static fromJSON(json) {
        for (let key of Object.keys(json)) {
            if (!Layer.properties.has(key)) {
                throw new Error(`Unknown property in Layer JSON: ${key}`);
            }
        }
        for (let property of Layer.properties) {
            if (!(property in json)) {
                throw new Error(`Missing property in Layer JSON: ${property}`);
            }
        }
        const layer = new Layer(json.id);
        layer.scale = json.scale;
        layer.angle = json.angle;
        layer.x = json.x;
        layer.y = json.y;
        layer.flipX = json.flipX;
        layer.flipY = json.flipY;
        layer.color = json.color;
        return layer;
    }

    toJSON() {
        return {
            id: this.id,
            scale: this.scale,
            angle: this.angle,
            x: this.x,
            y: this.y,
            flipX: this.flipX,
            flipY: this.flipY,
            color: this.color
        };
    }

    copy() {
        const newLayer = new Layer(this.id);
        newLayer.scale = this.scale;
        newLayer.angle = this.angle;
        newLayer.x = this.x;
        newLayer.y = this.y;
        newLayer.flipX = this.flipX;
        newLayer.flipY = this.flipY;
        newLayer.color = this.color;
        return newLayer;
    }

    static fromDataView(dataView, offset) {
        const layer = new Layer(0);
        let letter = (dataView.getUint8(offset)).toString(16);
        offset += 1;
        if (letter != "a") {
            return [layer, offset];
        }
        if (dataView.getUint8(offset) == 7) {
            offset += 3;
        }
        offset += 3;
        layer.id = dataView.getUint16(offset);
        offset += 2;
        layer.scale = dataView.getFloat32(offset);
        offset += 4;
        layer.angle = dataView.getFloat32(offset);
        offset += 4;
        layer.x = dataView.getFloat32(offset);
        offset += 4;
        layer.y = dataView.getFloat32(offset);
        offset += 4;
        layer.flipX = dataView.getUint8(offset) !== 0;
        offset += 1;
        layer.flipY = dataView.getUint8(offset) !== 0;
        offset += 1;
        layer.color = dataView.getUint32(offset);
        offset += 4;
        return [layer, offset];
    }
}