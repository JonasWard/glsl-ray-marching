function main() {
    const ctx = document.createElement('canvas').getContext('2d');
    document.body.appendChild(ctx.canvas);
    ctx.canvas.width = 256;
    ctx.canvas.height = 256;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    function randInt(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min | 0;
    }

    function drawRandomDot() {
        ctx.fillStyle = `#${randInt(0x1000000).toString(16).padStart(6, '0')}`;
        ctx.beginPath();

        const x = randInt(256);
        const y = randInt(256);
        const radius = randInt(10, 64);
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function render() {
        drawRandomDot();
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();