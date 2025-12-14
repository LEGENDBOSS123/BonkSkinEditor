import { Layer } from "./Layer.mjs";
import { Skin } from "./Skin.mjs";

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

canvas.height = window.innerHeight - 50;
canvas.width = window.innerWidth - 50;

window.addEventListener('resize', () => {
    canvas.height = window.innerHeight - 50;
    canvas.width = window.innerWidth - 50;
});

const skin = Skin.fromJSON(await fetch('skinExample.json').then(res => res.json()));

let isDragging = false;
let lastMouseX, lastMouseY;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        offsetX += e.clientX - lastMouseX;
        offsetY += e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const zoomFactor = Math.exp(0.003 * e.deltaY);
    const oldScale = scale;
    scale *= zoomFactor;
    const worldX = (mouseX - offsetX) / oldScale;
    const worldY = (mouseY - offsetY) / oldScale;
    offsetX = mouseX - worldX * scale;
    offsetY = mouseY - worldY * scale;
});

let scale = 1;
let offsetX = 0;
let offsetY = 0;

async function animate() {
    ctx.fillStyle = '#1E3246';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await skin.draw(ctx, canvas.height * 0.4, offsetX, offsetY, scale);
    requestAnimationFrame(animate);
}

animate();


document.addEventListener('keydown', (e) => {
    const moveAmount = 10;
    switch (e.code) {
        case 'KeyD':
            skin.download(64, 'skin.png');
            break;
    }
});