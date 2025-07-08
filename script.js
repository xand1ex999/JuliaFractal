const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');
const speedSlider = document.getElementById('speedSlider');
const zoomSlider = document.getElementById('zoomSlider');
const iterSlider = document.getElementById('iterSlider');
const resetBtn = document.getElementById('resetBtn');
const randomBtn = document.getElementById('randomBtn');
const fpsDisplay = document.getElementById('fps');
//const timeDisplay = document.querySelector('#time');
const timeDisplay = document.getElementById('time');


let animationId;
let startTime = Date.now();
let frameCount = 0;
let lastFpsTime = Date.now();

//
let time = 0;
let speed = 1;
let zoom = 1;
let maxIterations = 100;
let offsetX = 0;
let offsetY = 0;

const colors = [];
for (let i = 0; i < 256; i++) {
    const r = Math.floor(128 + 127 * Math.sin(i * 0.1));
    const g = Math.floor(128 + 127 * Math.sin(i * 0.1 + 2));
    const b = Math.floor(128 + 127 * Math.sin(i * 0.1 + 4));
    colors.push(`rgb(${r},${g},${b})`);
}

function julia(x, y, cx, cy, maxIter) {
    let zx = x;
    let zy = y;
    let iter = 0;
    
    while (zx * zx + zy * zy < 4 && iter < maxIter) {
        const tmp = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = tmp;
        iter++;
    }
    
    return iter;
}

function drawFractal() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    const cx = -0.4 + 0.6 * Math.cos(time * 0.3);
    const cy = 0.6 + 0.4 * Math.sin(time * 0.7);
    
    const centerX = canvas.width / 2 + offsetX;
    const centerY = canvas.height / 2 + offsetY;
    const scale = zoom * 150;
    
    for (let px = 0; px < canvas.width; px++) {
        for (let py = 0; py < canvas.height; py++) {
            const x = (px - centerX) / scale;
            const y = (py - centerY) / scale;
            
            const iterations = julia(x, y, cx, cy, maxIterations);
            
            const pixelIndex = (py * canvas.width + px) * 4;
            
            if (iterations === maxIterations) {
                data[pixelIndex] = 0;
                data[pixelIndex + 1] = 0;
                data[pixelIndex + 2] = 0;
                data[pixelIndex + 3] = 255;
            } else {
                const colorIndex = Math.floor((iterations / maxIterations) * 255);
                const smoothColor = iterations + 1 - Math.log2(Math.log2(x*x + y*y));
                const colorValue = Math.floor(smoothColor * 8) % 256;
                
                const r = Math.floor(128 + 127 * Math.sin(colorValue * 0.1 + time));
                const g = Math.floor(128 + 127 * Math.sin(colorValue * 0.1 + time + 2));
                const b = Math.floor(128 + 127 * Math.sin(colorValue * 0.1 + time + 4));
                
                data[pixelIndex] = r;
                data[pixelIndex + 1] = g;
                data[pixelIndex + 2] = b;
                data[pixelIndex + 3] = 255;
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function animate() {
    time += 0.01 * speed;
    
    drawFractal();
    
    frameCount++;
    const currentTime = Date.now();
    if (currentTime - lastFpsTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsTime));
        fpsDisplay.textContent = fps;
        frameCount = 0;
        lastFpsTime = currentTime;
    }
    
    const elapsedTime = ((currentTime - startTime) / 1000).toFixed(1);
    timeDisplay.textContent = elapsedTime;
    
    animationId = requestAnimationFrame(animate);
}

speedSlider.addEventListener('input', (e) => {
    speed = parseFloat(e.target.value);
});

zoomSlider.addEventListener('input', (e) => {
    zoom = parseFloat(e.target.value);
});

iterSlider.addEventListener('input', (e) => {
    maxIterations = parseInt(e.target.value);
});

resetBtn.addEventListener('click', () => {
    time = 0;
    speed = 1;
    zoom = 1;
    maxIterations = 100;
    offsetX = 0;
    offsetY = 0;
    speedSlider.value = 1;
    zoomSlider.value = 1;
    iterSlider.value = 100;
    startTime = Date.now();
});

randomBtn.addEventListener('click', () => {
    time = Math.random() * 100;
    speed = 0.1 + Math.random() * 2.9;
    zoom = 0.5 + Math.random() * 2.5;
    maxIterations = 50 + Math.random() * 250;
    speedSlider.value = speed;
    zoomSlider.value = zoom;
    iterSlider.value = maxIterations;
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldX = (mouseX - canvas.width / 2 - offsetX) / (zoom * 150);
    const worldY = (mouseY - canvas.height / 2 - offsetY) / (zoom * 150);
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, zoom * delta));
    
    const scaleFactor = newZoom / zoom;
    offsetX = mouseX - canvas.width / 2 - worldX * (newZoom * 150);
    offsetY = mouseY - canvas.height / 2 - worldY * (newZoom * 150);
    
    zoom = newZoom;
    zoomSlider.value = Math.min(3, zoom);
});

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        offsetX += deltaX;
        offsetY += deltaY;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

canvas.style.cursor = 'grab';

animate();