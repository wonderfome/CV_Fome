document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const pixels = imageData.data;

    function putPixel(x, y, r, g, b, a = 255) {
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
        const idx = (y * canvas.width + x) * 4;
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = a;
    }

    function drawLine(x1, y1, x2, y2, r, g, b, a = 255) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);

        if (dx > dy) {
            const m = (x2 !== x1) ? (y2 - y1) / (x2 - x1) : 0;
            const c = y1 - m * x1;
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                const y = Math.round(m * x + c);
                putPixel(x, y, r, g, b, a);
            }
        } else {
            const m = (y2 !== y1) ? (x2 - x1) / (y2 - y1) : 0;
            const c = x1 - m * y1;
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                const x = Math.round(m * y + c);
                putPixel(x, y, r, g, b, a);
            }
        }
    }

    function drawRectFilled(x1, y1, x2, y2, r, g, b, a = 255) {
        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                putPixel(x, y, r, g, b, a);
            }
        }
    }

    function drawEllipse(cx, cy, rx, ry, r, g, b, a = 255) {
        for (let y = -ry; y <= ry; y++) {
            for (let x = -rx; x <= rx; x++) {
                if ((rx > 0 && ry > 0) && ((x * x) / (rx * rx) + (y * y) / (ry * ry) < 1)) {
                    putPixel(cx + x, cy + y, r, g, b, a);
                }
            }
        }
    }

    function drawSprite24BitRotateScale(sprite, x, y, degree, scaleX, scaleY) {
        for (let j = 0; j < sprite.length; j++) {
            for (let i = 0; i < sprite[j].length; i++) {
                const color = sprite[j][i];

                if (color !== null) {
                    const r = (color >> 16) & 255;
                    const g = (color >> 8) & 255;
                    const b = color & 255;

                    const cX = i - (sprite[j].length / 2);
                    const cY = j - (sprite.length / 2);

                    const rad = degree * Math.PI / 180;
                    const x_rotated = Math.round(cX * Math.cos(rad) - cY * Math.sin(rad));
                    const y_rotated = Math.round(cX * Math.sin(rad) + cY * Math.cos(rad));

                    const x_rotated_scaled = Math.round(x_rotated * scaleX);
                    const y_rotated_scaled = Math.round(y_rotated * scaleY);

                    drawEllipse(
                        x + x_rotated_scaled, 
                        y + y_rotated_scaled, 
                        Math.max(1, Math.round(scaleX)), 
                        Math.max(1, Math.round(scaleY)), 
                        r, g, b
                    );
                }
            }
        }
    }

    function toScaledMousePos(posX, posY) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: Math.floor((posX - rect.left) * scaleX),
            y: Math.floor((posY - rect.top) * scaleY)
        };
    }

    const cuteWhaleSprite24bit = [
        [null, null, null, null, null, 0xFFFFFF, null, 0xFFFFFF, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, 0x81D4FA, 0x29B6F6, 0x81D4FA, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, 0x1A237E, null, null, null, null, null, null, null, null, null],
        [null, null, null, 0x1A237E, 0x1A237E, 0x1A237E, 0x1A237E, 0x1A237E, 0x1A237E, null, null, null, null, null, null, null],
        [null, null, 0x1A237E, 0x81D4FA, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x1A237E, null, null, null, null, null, null],
        [null, 0x1A237E, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x1A237E, null, null, null, null, null],
        [null, 0x1A237E, 0x29B6F6, 0x1A237E, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x1A237E, null, null, null, null],
        [null, 0x1A237E, 0xF48FB1, 0x1A237E, 0xFFFFFF, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x1A237E, null, 0x1A237E, null],
        [null, 0x1A237E, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x1A237E, 0x29B6F6, 0x1A237E],
        [null, null, 0x1A237E, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x29B6F6, 0x1A237E],
        [null, null, 0x1A237E, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0x29B6F6, 0x1A237E, 0x1A237E, 0x29B6F6, 0x29B6F6, 0x1A237E, null],
        [null, null, null, 0x1A237E, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0x1A237E, 0x29B6F6, 0x29B6F6, 0x1A237E, 0x1A237E, null, null],
        [null, null, null, null, 0x1A237E, 0x1A237E, 0x1A237E, 0x1A237E, 0x1A237E, 0x29B6F6, 0x29B6F6, 0x1A237E, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, 0x1A237E, 0x1A237E, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
    ];

    let isDragging = false; 
    let previousX = 0;
    let previousY = 0;
    let r = 255, g = 0, b = 0; 
    let degree = 0; 
    let scale = 1.5; // ขยายขนาดวาฬขึ้นเล็กน้อย
    
    // ตั้งพิกัดให้อยู่ตรงกลาง Canvas พอดี
    let mouseX = Math.floor(canvas.width / 2);
    let mouseY = Math.floor(canvas.height / 2);

    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        const { x, y } = toScaledMousePos(event.clientX, event.clientY);
        previousX = x;
        previousY = y;
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mousemove', (event) => {
        const { x, y } = toScaledMousePos(event.clientX, event.clientY);
        mouseX = x;
        mouseY = y;

        if (isDragging) {
            drawLine(previousX, previousY, x, y, r, g, b);
            previousX = x;
            previousY = y;
        }
    });

    window.addEventListener('keydown', (event) => {
        // ป้องกันไม่ให้หน้าเว็บเลื่อน (Scroll) เมื่อกดปุ่มลูกศร
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }

        if (event.key === '1') { r = 255; g = 0; b = 0; }
        else if (event.key === '2') { r = 0; g = 255; b = 0; } 
        else if (event.key === '3') { r = 0; g = 0; b = 255; }

        if (event.key === 'ArrowLeft') { degree -= 5; }
        else if (event.key === 'ArrowRight') { degree += 5; }

        if (event.key === 'ArrowUp') { scale += 0.1; }
        else if (event.key === 'ArrowDown') { scale = Math.max(0.2, scale - 0.1); }
    });

   
    function animate() {
        drawRectFilled(0, 0, canvas.width - 1, canvas.height - 1, 255, 255, 255);
        drawSprite24BitRotateScale(cuteWhaleSprite24bit, mouseX, mouseY, degree, scale, scale);
        ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(animate);
    }

    animate();
});