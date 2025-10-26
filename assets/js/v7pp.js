let sleep = ms => new Promise(reslv => setTimeout(reslv, ms));
let frame = () => new Promise(reslv => requestAnimationFrame(reslv));

async function* frames() {
    let p = await frame();
    let t = 0;
    while (true) {
        yield t;

        let n = await frame();
        t += (n - p) / 1000;
        p = n;
    }
}

async function lerp(time, func) {
    for await (let t of frames()) {
        if (t >= time) break;
        func(t / time);
    }
    func(1);
}

const V8_IMAGE = new Image();

let triggered = false;
async function activate() {
    if (triggered) return;
    triggered = true;

    V8_IMAGE.src = "/assets/img/v8.png";
    await new Promise(reslv => V8_IMAGE.onload = reslv);

    let credits = document.getElementById("credits");
    (async function () {
        await sleep(2000);

        let microchip = new Audio("/assets/audio/microchip.mp3");
        microchip.volume = 0.2;
        microchip.loop = true;

        credits.onclick = () => {
            if (microchip.paused) {
                credits.style.textDecoration = "none";
                microchip.play();
            } else {
                credits.style.textDecoration = "line-through";
                microchip.pause();
            }
        };

        await microchip.play();
    })();

    (async function () {
        let disc = document.getElementById("disclaimer");
        await lerp(2, l => disc.style.transform = `rotate(${l * 100}deg) scale(${Math.pow(1 - l, 2)})`);
        disc.parentNode.remove();
        document.title = "popax::landing_page";

        await sleep(500);

        let pc = document.getElementById("panel-container");
        pc.style.opacity = 1;
        await lerp(0.5, l => [...pc.children].forEach(p => p.style.scale = 1 - Math.pow(1 - l, 3)));

        let drag = null;
        function dragover(e) {
            if (drag) {
                let [p, offx, offy, w, h] = drag;
                let x = e.clientX + offx, y = e.clientY + offy;
                if (x < 0) x = 0;
                if (y < 0) y = 0;
                if (x + w > window.innerWidth) x = window.innerWidth - w;
                if (y + h > window.innerHeight) y = window.innerHeight - h;
                p.style.left = `${x}px`;
                p.style.top = `${y}px`;
            }
        }
        pc.ondragover = dragover;

        var blimg = document.createElement('img');
        blimg.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

        let nzi = 110;
        for (let p of document.getElementsByClassName("panel")) {
            let r = p.getBoundingClientRect();
            p.style.left = `${r.left}px`;
            p.style.top = `${r.top}px`;
            p.ondragover = dragover;

            let t = p.getElementsByTagName("strong")[0];
            t.draggable = true;
            t.ondragstart = e => {
                if (getComputedStyle(p).position != "absolute") {
                    e.stopPropagation();
                    return;
                }

                let r = p.getBoundingClientRect();
                drag = [p, r.x - e.clientX, r.y - e.clientY, r.width, r.height];
                p.style.zIndex = nzi++;
                e.dataTransfer.setDragImage(blimg, 0, 0);
            };
            t.ondragend = () => drag = null;
            t.style.cursor = "grab";

            addEventListener("resize", e => {
                let { x, y, width, height } = p.getBoundingClientRect();
                if (x < 0) x = 0;
                if (y < 0) y = 0;
                if (x + width > window.innerWidth) x = window.innerWidth - width;
                if (y + height > window.innerHeight) y = window.innerHeight - height;
                p.style.left = `${x}px`;
                p.style.top = `${y}px`;
            });
        }
    })();
    await sleep(1200);

    (async function () {
        await sleep(50);
        confetti();
    })();

    let txt = document.getElementById("txt");
    txt.style.transform = "translate(-50%, -50%) scale(2)";

    (async function () {
        for await (t of frames()) {
            txt.style.color = `hsl(${(t * 100) % 360}, 100%, 50%)`;
            txt.style.transform = `translate(-50%, -50%) rotate(${Math.sin(t * 4) * 20}deg) scale(2)`;
        }
    })();

    await sleep(200);

    cube();

    let backdrop = document.getElementById("backdrop");
    await lerp(0.5, l => backdrop.style.backgroundColor = `rgba(127, 255, 212, ${1 - l})`);

    await sleep(2000);

    credits.style.display = "block";
    await lerp(0.2, l => credits.style.transform = `translate(-50%, -${150 * l}%)`);

    await sleep(8000);
    tracers();

    await sleep(10000);
    waves();

    await sleep(10000);
    walkers();
}

async function confetti() {
    let vctx = document.getElementById("confetti").getContext("2d");
    let ctx = document.createElement("canvas").getContext("2d");

    let pts = [];
    for (let i = 0; i < 500; i++) {
        let a = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random()) * 0.7;
        let v = Math.max(window.innerWidth * 0.5, window.innerHeight) * (0.2 + Math.random() * 0.6);
        pts.push({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.525, vx: Math.sin(a) * v, vy: Math.cos(a) * v, a: a, c: Math.random() });
    }

    let pt = 0;
    for await (let t of frames()) {
        let dt = pt - t;
        pt = t;

        if (ctx.canvas.width != window.innerWidth || ctx.canvas.height != window.innerHeight) {
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerHeight;
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (pts.length == 0) break;

        for (let i = 0; i < pts.length; i++) {
            let p = pts[i];

            p.vx *= Math.pow(0.6, dt);
            p.vy *= Math.pow(0.6, dt);

            p.vy += 700 * dt;

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.x <= 0 || p.x >= window.innerWidth || p.y >= window.innerHeight) {
                pts.splice(i, 1);
                i--;
            }

            let na = Math.atan2(p.vx, p.vy);
            let da = (na - p.a + 2 * Math.PI) % (2 * Math.PI);
            if (da >= Math.PI) da -= 2 * Math.PI;
            p.a = (p.a + da * dt + 2 * Math.PI) % (2 * Math.PI);

            ctx.strokeStyle = `hsla(${p.c * 360}, 100%, 50%, ${Math.min(t * 8, 1)})`;
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.sin(p.a) * 15, p.y + Math.cos(p.a) * 15);
            ctx.stroke();
        }

        if (vctx.canvas.width != ctx.canvas.width || vctx.canvas.height != ctx.canvas.height) {
            vctx.canvas.width = ctx.canvas.width;
            vctx.canvas.height = ctx.canvas.height;
        }
        vctx.clearRect(0, 0, vctx.canvas.width, vctx.canvas.height);
        vctx.drawImage(ctx.canvas, 0, 0);
    }

    vctx.clearRect(0, 0, vctx.canvas.width, vctx.canvas.height);
}

async function cube() {
    let gl = document.getElementById("cube").getContext("webgl");
    if (!gl) throw new Error("WebGL init error!");

    let data = [];
    for (let a = 0; a < 3; a++) {
        for (let s = -1; s <= 1; s += 2) {
            let mkc = (u, v) => {
                let c = [u * 2 - 1, v * 2 - 1];
                c.splice(a, 0, s);
                return c.concat([u, 1 - v]);
            };

            data.push(...mkc(0, 0));
            data.push(...mkc(1, 0));
            data.push(...mkc(0, 1));
            data.push(...mkc(1, 0));
            data.push(...mkc(0, 1));
            data.push(...mkc(1, 1));
        }
    }

    let buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    function shader(type, src) {
        let s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`Failed to compile shader: ${gl.getShaderInfoLog(s)}`);
        return s;
    }

    let tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, V8_IMAGE);
    gl.generateMipmap(gl.TEXTURE_2D);

    let prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VSHADER));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FSHADER));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(`Failed to link shader program: ${gl.getProgramInfoLog(prog)}`);

    let vattr = gl.getAttribLocation(prog, "pos");
    if (vattr >= 0) {
        gl.vertexAttribPointer(vattr, 3, gl.FLOAT, false, 5 * 4, 0);
        gl.enableVertexAttribArray(vattr);
    }

    let uattr = gl.getAttribLocation(prog, "uv");
    if (uattr >= 0) {
        gl.vertexAttribPointer(uattr, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
        gl.enableVertexAttribArray(uattr);
    }

    let tunif = gl.getUniformLocation(prog, "tex");
    if (tunif >= 0) {
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(tunif, 0);
    }

    gl.useProgram(prog);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1.0);

    let p = 0, r = 0;
    for await (t of frames()) {
        if (gl.canvas.width != window.innerWidth || gl.canvas.height != window.innerHeight) {
            gl.canvas.width = window.innerWidth;
            gl.canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let pmat = mat4.create();
        mat4.perspective(pmat, 45 / 180 * Math.PI, window.innerWidth / window.innerHeight, 0.1, 100);
        gl.uniformMatrix4fv(gl.getUniformLocation(prog, "pmat"), false, pmat);

        r += (t - p) * 4;
        p = t;

        let mvmat = mat4.create();
        mat4.rotate(mvmat, mvmat, 45 / 180 * Math.PI, [1, 0, 0]);
        mat4.translate(mvmat, mvmat, [0, -6 + Math.sin(t * 3) * 0.5, -6]);
        mat4.rotate(mvmat, mvmat, r, [0, 1, 0]);
        gl.uniformMatrix4fv(gl.getUniformLocation(prog, "mvmat"), false, mvmat);

        gl.drawArrays(gl.TRIANGLES, 0, data.length / 5);
    }
}

const VSHADER = `
attribute vec4 pos;
attribute vec2 uv;

uniform mat4 pmat;
uniform mat4 mvmat;

varying mediump vec2 fuv;

void main() {
    fuv = uv;
    gl_Position = pmat * mvmat * pos;
}
`.trim();

const FSHADER = `
varying mediump vec2 fuv;

uniform sampler2D tex;

void main() {
    mediump vec4 col = texture2D(tex, fuv);
    gl_FragColor = col * col.a + vec4(1.0) * (1.0 - col.a);
}
`.trim();

async function tracers() {
    let vctx = document.getElementById("tracers").getContext("2d");
    let ctx = document.createElement("canvas").getContext("2d");
    vctx.canvas.style.opacity = "50%";

    let ts = [];
    let nst = 0;

    let mtl = Math.max(window.innerWidth, window.innerHeight);

    let p = 0;
    for await (t of frames()) {
        let dt = t - p;
        p = t;

        if (ts.length < 4 && nst <= t) {
            ts.push({
                x: window.innerWidth / 2, y: window.innerHeight / 2,
                vx: Math.random() > 0.5 ? +1 : -1, vy: Math.random() > 0.5 ? +1 : -1,
                p: [[window.innerWidth / 2, window.innerHeight / 2]]
            });
            nst = t + 10 + Math.random() * 15;
        }

        if (ctx.canvas.width != window.innerWidth || ctx.canvas.height != window.innerHeight) {
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerHeight;

            for (let t of ts) {
                if (t.x < 24) t.x = 24;
                if (t.y < 24) t.y = 24;
                if (t.x > window.innerWidth - 24) t.x = window.innerWidth - 24;
                if (t.y > window.innerHeight - 24) t.y = window.innerHeight - 24;
                t.p = [[t.x, t.y]];
            }
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (let t of ts) {
            t.x += t.vx * 90 * dt;
            t.y += t.vy * 90 * dt;

            if (t.x <= 24) {
                t.p.unshift([t.x, t.y]);
                t.x = 24;
                t.vx = +1;
            } else if (t.x >= window.innerWidth - 24) {
                t.p.unshift([t.x, t.y]);
                t.x = window.innerWidth - 24;
                t.vx = -1;
            }

            if (t.y <= 24) {
                t.p.unshift([t.x, t.y]);
                t.y = 24;
                t.vy = +1;
            } else if (t.y >= window.innerHeight - 24) {
                t.p.unshift([t.x, t.y]);
                t.y = window.innerHeight - 24;
                t.vy = -1;
            }

            ctx.lineWidth = 2;
            ctx.strokeStyle = "#c0c0c0";
            ctx.beginPath();
            ctx.moveTo(t.x, t.y);
            let cx = t.x, cy = t.y, tl = 0;
            for (let i = 0; i < t.p.length; i++) {
                let [x, y] = t.p[i];
                let l = Math.sqrt((cx - x) * (cx - x) + (cy - y) * (cy - y));

                if (tl + l >= mtl) {
                    let dx = x - cx, dy = y - cy;
                    let rl = mtl - tl;
                    x = cx + dx / l * rl;
                    y = cy + dy / l * rl;
                }

                ctx.lineTo(x, y);
                cx = x;
                cy = y;
                tl += l;
                if (tl >= mtl) {
                    t.p.splice(i + 1);
                    break;
                }
            }
            ctx.stroke();

            ctx.translate(t.x, t.y);
            ctx.rotate(-Math.atan2(t.vx, t.vy));
            ctx.drawImage(V8_IMAGE, -24, -24, 48, 48);
            ctx.resetTransform();
        }

        if (vctx.canvas.width != ctx.canvas.width || vctx.canvas.height != ctx.canvas.height) {
            vctx.canvas.width = ctx.canvas.width;
            vctx.canvas.height = ctx.canvas.height;
        }
        vctx.clearRect(0, 0, vctx.canvas.width, vctx.canvas.height);
        vctx.drawImage(ctx.canvas, 0, 0);
    }
}

async function waves() {
    let vctx = document.getElementById("waves").getContext("2d");
    let ctx = document.createElement("canvas").getContext("2d");

    while (true) {
        await sleep(7000 + Math.random() * 15000);

        let wy = window.innerHeight * (0.15 + Math.random() * 0.7);
        let fx = Math.random() > 0.5;

        for await (t of frames()) {
            if (ctx.canvas.width != window.innerWidth || ctx.canvas.height != window.innerHeight) {
                ctx.canvas.width = window.innerWidth;
                ctx.canvas.height = window.innerHeight;
            }
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            let d = t > 5;
            for (let i = 0; i < 10; i++) {
                let x = t * 200 - (i + 1) * 70;
                if (fx) x = window.innerWidth - x;
                d &= x < -64 || x > window.innerWidth + 64;
                ctx.drawImage(V8_IMAGE, x, wy + Math.sin(x / 200) * 100, 64, 64);
            }
            if (d) break;

            if (vctx.canvas.width != ctx.canvas.width || vctx.canvas.height != ctx.canvas.height) {
                vctx.canvas.width = ctx.canvas.width;
                vctx.canvas.height = ctx.canvas.height;
            }
            vctx.clearRect(0, 0, vctx.canvas.width, vctx.canvas.height);
            vctx.drawImage(ctx.canvas, 0, 0);
        }

        vctx.clearRect(0, 0, vctx.canvas.width, vctx.canvas.height);
    }
}

async function walkers() {
    let ctx = document.getElementById("walkers").getContext("2d");

    while (true) {
        await sleep(7000 + Math.random() * 15000);

        let r = Math.random();
        let x, y, dx, dy;
        if (r < 0.25) {
            x = -100;
            y = window.innerHeight * (0.1 + Math.random() * 0.8);
            dx = +1;
            dy = 0;
        } else if (r < 0.5) {
            x = window.innerWidth + 100;
            y = window.innerHeight * (0.1 + Math.random() * 0.8);
            dx = -1;
            dy = 0;
        } else if (r < 0.75) {
            x = window.innerWidth * (0.1 + Math.random() * 0.8);
            y = -100;
            dx = 0;
            dy = +1;
        } else {
            x = window.innerWidth * (0.1 + Math.random() * 0.8);
            y = window.innerHeight + 100;
            dx = 0;
            dy = -1;
        }

        while (true) {
            await lerp(4 / 6, l => {
                l = 3 * l * l - 2 * l * l * l;

                if (ctx.canvas.width != window.innerWidth || ctx.canvas.height != window.innerHeight) {
                    ctx.canvas.width = window.innerWidth;
                    ctx.canvas.height = window.innerHeight;
                }
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.translate(x + dx * 200 * l, y + dy * 200 * l);
                ctx.rotate(-Math.atan2(dx, dy));
                ctx.drawImage(V8_IMAGE, -48, -48, 96, 96);
                ctx.resetTransform();
            });

            x += dx * 200;
            y += dy * 200;

            if (dx < 0 && x < -300) break;
            if (dx > 0 && x > window.innerWidth + 300) break;
            if (dy < 0 && y < -300) break;
            if (dy > 0 && y > window.innerHeight + 300) break;

            await sleep(4 / 6 * 1000);
        }

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}