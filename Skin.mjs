import { Layer } from "./Layer.mjs";
import { getSkinImages } from "./skinShapes.mjs";

export class Skin {

    static offScreenCanvas = new OffscreenCanvas(1, 1);
    static properties = new Set(['layers', 'bc']);

    constructor() {
        this.layers = [];
        this.bc = 0x448aff;
    }

    addLayer(layer) {
        this.layers.push(layer);
    }

    async exportCanvas(size = 735) {
        const off = new OffscreenCanvas(size, size);
        const offCtx = off.getContext('2d');
        await this.draw(offCtx, size / 2, 0, 0, 1);
        return off;
    }

    async exportBlob(size = 735) {
        const canvas = await this.exportCanvas(size);
        return await canvas.convertToBlob({ type: 'image/png' });
    }

    async download(size = 735, filename = 'skin.png') {
        const blob = await this.exportBlob(size);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    async draw(ctx, radius = 100, offsetX = 0, offsetY = 0, scale = 1) {
        const off = Skin.offScreenCanvas;
        off.width = ctx.canvas.width;
        off.height = ctx.canvas.height;
        const offCtx = off.getContext('2d');
        const cx = ctx.canvas.width / 2;
        const cy = ctx.canvas.height / 2;


        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        offCtx.save();
        offCtx.translate(offsetX, offsetY);
        offCtx.scale(scale, scale);
        offCtx.beginPath();
        offCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        offCtx.clip();

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = this.toHexString(this.bc);
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();

        offCtx.translate(cx, cy);
        offCtx.scale(radius / 15, radius / 15);


        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            const skinImage = (await getSkinImages())[layer.id];
            if (!skinImage) {
                continue;
            }
            const { x, y, scale, angle, flipX, flipY, color } = layer;
            const width = skinImage.width * scale;
            const height = skinImage.height * scale;


            offCtx.save();
            offCtx.setTransform(1, 0, 0, 1, 0, 0);
            offCtx.clearRect(0, 0, offCtx.canvas.width, offCtx.canvas.height);
            offCtx.restore();

            offCtx.save();
            offCtx.translate(x, y);
            offCtx.rotate(angle * (Math.PI / 180));
            offCtx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
            offCtx.drawImage(skinImage, -width / 2, -height / 2, width, height);

            offCtx.globalCompositeOperation = 'source-in';
            offCtx.fillStyle = this.toHexString(color);
            offCtx.fillRect(-width / 2, -height / 2, width, height);
            offCtx.globalCompositeOperation = 'source-over';

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(off, 0, 0);
            ctx.restore();
            offCtx.restore();
        }
        offCtx.restore();
        ctx.restore();
    }

    toHexString(color) {
        return `#${color.toString(16).padStart(6, '0')}`;
    }

    static fromJSON(json) {
        for (let key of Object.keys(json)) {
            if (!Skin.properties.has(key)) {
                throw new Error(`Unknown property in Skin JSON: ${key}`);
            }
        }
        for (let property of Skin.properties) {
            if (!(property in json)) {
                throw new Error(`Missing property in Skin JSON: ${property}`);
            }
        }
        const skin = new Skin();
        skin.layers = json.layers;
        for (let i = 0; i < skin.layers.length; i++) {
            skin.layers[i] = Layer.fromJSON(skin.layers[i]);
        }
        skin.bc = json.bc;
        return skin;
    }

    toJSON(){
        return {
            layers: this.layers.map(layer => layer.toJSON()),
            bc: this.bc
        };
    }

    copy() {
        const newSkin = new Skin();
        newSkin.bc = this.bc;
        for (const layer of this.layers) {
            newSkin.layers.push(layer.copy());
        }
        return newSkin;
    }

    toString() {
        let view = new DataView(new ArrayBuffer(1024));
        let offset = 0;

        view.setUint8(offset, 0x0A);
        offset += 1;
        view.setUint8(offset, 0x07);
        offset += 1;
        view.setUint8(offset, 0x03);
        offset += 1;
        view.setUint8(offset, 0x61);
        offset += 1;
        view.setUint16(offset, 0x02);
        offset += 2;
        view.setUint8(offset, 0x09);
        offset += 1;
        view.setUint8(offset, this.layers.length * 2 + 1);
        offset += 1;
        view.setUint8(offset, 0x01);
        offset += 1;

        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            view.setUint8(offset, 0x0A);
            offset += 1;
            if (i == 0) {
                view.setUint8(offset, 0x07);
                offset += 1;
                view.setUint8(offset, 0x05);
                offset += 1;
                view.setUint8(offset, 0x61);
                offset += 1;
                view.setUint8(offset, 0x6C);
                offset += 1;
            }
            else {
                view.setUint8(offset, 0x05);
                offset += 1;
            }
            view.setUint16(offset, 1);
            offset += 2;
            view.setUint16(offset, layer.id);
            offset += 2;
            view.setFloat32(offset, layer.scale);
            offset += 4;
            view.setFloat32(offset, layer.angle);
            offset += 4;
            view.setFloat32(offset, layer.x);
            offset += 4;
            view.setFloat32(offset, layer.y);
            offset += 4;
            view.setUint8(offset, layer.flipX ? 1 : 0);
            offset += 1;
            view.setUint8(offset, layer.flipY ? 1 : 0);
            offset += 1;
            view.setUint32(offset, layer.color);
            offset += 4;
        }

        view.setUint32(offset, this.bc);
        offset += 4;

        const u8arr = new Uint8Array(view.buffer, 0, offset);
        return btoa(String.fromCharCode(...u8arr));
    }

    static fromString(str) {
        let u8arr;
        try {
            u8arr = Uint8Array.from(atob(decodeURIComponent(str)), c => c.charCodeAt(0));
        }
        catch (e) {
            try {
                u8arr = Uint8Array.from(atob(str), c => c.charCodeAt(0));
            }
            catch (e) {
                throw new Error("Invalid skin string");
            }
        }
        let dataView = new DataView(u8arr.buffer);
        let offset = 0;
        let skin = new Skin();

        offset += 4;

        let x5 = dataView.getUint16(offset);
        offset += 3;

        let layerCount = (dataView.getUint8(offset) - 1) / 2;
        offset += 1;

        let x7 = dataView.getUint8(offset);;
        offset += 1;

        while (x7 != 1) {
            let x8 = 0;
            if (x7 == 3) {
                x8 = dataView.getUint8(offset) - 48;
                offset += 1;
            }
            else if (x7 == 5) {
                let x9 = dataView.getUint8(offset);
                offset += 1;
                let x10 = dataView.getUint8(offset);
                offset += 1;
                x8 = (x9 - 48) * 10 + (x10 - 48);
            }
            let [layer, newOffset] = Layer.fromDataView(dataView, offset);
            skin.layers[x8] = layer;
            x7 = dataView.getUint8(newOffset);
            offset = newOffset + 1;
        }

        for (let i = 0; i < layerCount; i++) {
            let [layer, newOffset] = Layer.fromDataView(dataView, offset);
            skin.layers[i] = layer;
            offset = newOffset;
        }
        if (x5 >= 2) {
            skin.bc = dataView.getUint32(offset);
            offset += 4;
        }

        return skin;
    }
}