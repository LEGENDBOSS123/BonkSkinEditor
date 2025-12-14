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
        for(let property of Skin.properties) {
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
}