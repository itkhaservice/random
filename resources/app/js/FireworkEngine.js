class FireworkEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
        this.cw = window.innerWidth;
        this.ch = window.innerHeight;
        this.fireworks = [];
        this.particles = [];
        this.hue = 120;
        this.limiterTotal = 20;
        this.limiterTick = 0;
        this.timerTotal = 500;
        this.timerTick = 0;
        this.mousedown = false;
        this.mx = 0;
        this.my = 0;
        this.isEnabled = true;
        this.currentStyle = 'classic';
        
        this.rafId = null;

        if (this.canvas) {
            this.canvas.width = this.cw;
            this.canvas.height = this.ch;
            this.bindEvents();
            this.startLoop();
        }

        window.addEventListener('resize', () => {
            this.cw = window.innerWidth;
            this.ch = window.innerHeight;
            if (this.canvas) {
                this.canvas.width = this.cw;
                this.canvas.height = this.ch;
            }
        });
    }

    bindEvents() {
        if (!this.canvas) return;
        this.canvas.addEventListener("mousemove", (e) => {
            this.mx = e.pageX - this.canvas.offsetLeft;
            this.my = e.pageY - this.canvas.offsetTop;
        });
        this.canvas.addEventListener("mousedown", (e) => {
            e.preventDefault();
            this.mousedown = true;
        });
        this.canvas.addEventListener("mouseup", (e) => {
            e.preventDefault();
            this.mousedown = false;
        });
    }

    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    calculateDistance(p1x, p1y, p2x, p2y) {
        return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.clear();
        }
    }

    setStyle(style) {
        this.currentStyle = style;
    }

    reset() {
        this.fireworks = [];
    }

    clear() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.cw, this.ch);
        }
        this.fireworks = [];
        this.particles = [];
    }

    startLoop() {
        if (!this.rafId) {
            this.loop();
        }
    }

    // --- Firework Class Logic (Internal) ---
    createFirework(sx, sy, tx, ty, customHue) {
        const firework = {
            x: sx, sx: sx,
            y: sy, sy: sy,
            tx: tx, ty: ty,
            distanceToTarget: this.calculateDistance(sx, sy, tx, ty),
            distanceTraveled: 0,
            coordinates: [],
            coordinateCount: 3,
            angle: Math.atan2(ty - sy, tx - sx),
            speed: 2,
            acceleration: 1.05,
            brightness: this.random(50, 70),
            targetRadius: 1,
            hue: customHue || this.hue
        };
        while (firework.coordinateCount--) {
            firework.coordinates.push([firework.x, firework.y]);
        }
        return firework;
    }

    updateFirework(firework, index) {
        firework.coordinates.pop();
        firework.coordinates.unshift([firework.x, firework.y]);
        if (firework.targetRadius < 8) {
            firework.targetRadius += 0.3;
        } else {
            firework.targetRadius = 1;
        }
        firework.speed *= firework.acceleration;
        var vx = Math.cos(firework.angle) * firework.speed,
            vy = Math.sin(firework.angle) * firework.speed;
        firework.distanceTraveled = this.calculateDistance(firework.sx, firework.sy, firework.x + vx, firework.y + vy);
        
        if (firework.distanceTraveled >= firework.distanceToTarget) {
            this.createParticles(firework.tx, firework.ty, false, firework.hue);
            this.fireworks.splice(index, 1);
        } else {
            firework.x += vx;
            firework.y += vy;
            if (this.currentStyle === 'rising' && Math.random() < 0.4) {
                if (this.particles.length < 1000)
                    this.particles.push(this.createParticle(firework.x, firework.y, 0.1, false, false, undefined, undefined, firework.hue));
            }
        }
    }

    drawFirework(firework) {
        this.ctx.beginPath();
        this.ctx.setLineDash([6, 3]);
        this.ctx.lineCap = 'round';
        this.ctx.moveTo(firework.coordinates[firework.coordinates.length - 1][0], firework.coordinates[firework.coordinates.length - 1][1]);
        for (let i = firework.coordinates.length - 2; i >= 0; i--) {
            this.ctx.lineTo(firework.coordinates[i][0], firework.coordinates[i][1]);
        }
        this.ctx.lineTo(firework.x, firework.y);
        this.ctx.strokeStyle = "hsl(" + firework.hue + ", 100%, " + firework.brightness + "%)";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    // --- Particle Class Logic (Internal) ---
    createParticle(x, y, customGravity, twinkleEffect, isSubParticle, angle, speed, pIdHue) {
        const particle = {
            x: x, y: y,
            coordinates: [],
            coordinateCount: Math.floor(this.random(25, 50)),
            angle: angle !== undefined ? angle + this.random(-0.1, 0.1) : this.random(0, Math.PI * 2),
            speed: speed !== undefined ? speed : this.random(1, 12),
            friction: this.random(0.94, 0.98),
            gravity: customGravity !== undefined ? customGravity : this.random(0.3, 0.5),
            hue: pIdHue !== undefined ? this.random(pIdHue - 15, pIdHue + 15) : this.random(this.hue - 15, this.hue + 15),
            brightness: this.random(50, 85),
            alpha: 1,
            decay: this.random(0.008, 0.025),
            isTwinkling: twinkleEffect,
            hasSubExploded: isSubParticle
        };
        while (particle.coordinateCount--) {
            particle.coordinates.push([particle.x, particle.y]);
        }
        return particle;
    }

    updateParticle(particle, index) {
        particle.coordinates.pop();
        particle.coordinates.unshift([particle.x, particle.y]);

        if (this.currentStyle === 'spiral' && !particle.hasSubExploded) {
            particle.angle += 0.1;
        }

        particle.speed *= particle.friction;
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed + particle.gravity;

        particle.alpha -= particle.decay;

        if (particle.speed < 0.5) {
            particle.alpha -= 0.01;
        }

        if (this.currentStyle === 'falling_rain' && Math.random() < 0.1 && particle.alpha > 0.3) {
            this.particles.push(this.createParticle(particle.x, particle.y, 0.05, false, true, this.random(0, Math.PI * 2), 0.3));
        }

        if (this.currentStyle === 'double_burst' && !particle.hasSubExploded && particle.alpha < 0.7 && Math.random() < 0.03) {
            this.createParticles(particle.x, particle.y, true);
            particle.hasSubExploded = true;
        }

        if (particle.alpha <= 0) {
            this.particles.splice(index, 1);
        }
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.moveTo(particle.coordinates[particle.coordinates.length - 1][0], particle.coordinates[particle.coordinates.length - 1][1]);
        for (let i = particle.coordinates.length - 2; i >= 0; i--) {
            this.ctx.lineTo(particle.coordinates[i][0], particle.coordinates[i][1]);
        }
        this.ctx.lineTo(particle.x, particle.y);

        this.ctx.setLineDash([this.random(10, 20), this.random(5, 15)]);

        let displayAlpha = particle.alpha;
        if (particle.isTwinkling && Math.random() < 0.2) {
            displayAlpha = this.random(0.2, 1);
        }

        this.ctx.lineWidth = displayAlpha * 1.5;
        this.ctx.strokeStyle = "hsla(" + particle.hue + ", 100%, " + (particle.brightness * displayAlpha + 20) + "%, " + displayAlpha + ")";

        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    createParticles(x, y, isSubParticle = false, pIdHue) {
        if (this.particles.length > 2000) return;

        let particleCount = 30;
        let style = isSubParticle ? 'classic' : this.currentStyle;
        let targetHue = pIdHue !== undefined ? pIdHue : this.hue;

        if (style === 'ring') {
            for (let layer = 1; layer <= 3; layer++) {
                let layerCount = 25 + layer * 15;
                for (let i = 0; i < layerCount; i++) {
                    let angle = (i / layerCount) * Math.PI * 2;
                    let speed = layer * 4;
                    this.particles.push(this.createParticle(x, y, 0.05, false, false, angle, speed, targetHue));
                }
            }
        } else if (style === 'heart') {
            for (let layer = 1; layer <= 2; layer++) {
                let layerCount = 50 + layer * 25;
                for (let i = 0; i < layerCount; i++) {
                    let t = (i / layerCount) * Math.PI * 2;
                    let tx = 16 * Math.pow(Math.sin(t), 3);
                    let ty = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                    let angle = Math.atan2(ty, tx);
                    let speed = (Math.sqrt(tx * tx + ty * ty) / 3) * (layer * 1.5);
                    this.particles.push(this.createParticle(x, y, 0.05, false, false, angle, speed, targetHue));
                }
            }
        } else if (style === 'spiral') {
            particleCount = 25;
            for (let i = 0; i < particleCount; i++) {
                let angle = (i / particleCount) * Math.PI * 10;
                let speed = i / 15 + 1;
                this.particles.push(this.createParticle(x, y, 0.02, false, false, angle, speed, targetHue));
            }
        } else if (style === 'twinkle') {
            for (let layer = 1; layer <= 2; layer++) {
                let layerCount = 15 + layer * 10;
                while (layerCount--) {
                    let p = this.createParticle(x, y, 0.15, true, false, undefined, this.random(4, 15) * layer, targetHue);
                    p.decay = this.random(0.02, 0.04);
                    p.coordinateCount = 15;
                    this.particles.push(p);
                }
            }
        } else {
            let customGravity = 0.6;
            let twinkleEffect = false;

            switch (style) {
                case 'rising':
                    particleCount = 40;
                    break;
                case 'falling_rain':
                    customGravity = 1.2;
                    particleCount = 30;
                    break;
                case 'double_burst':
                    particleCount = 25;
                    break;
                case 'classic':
                default:
                    particleCount = 60;
                    break;
            }

            while (particleCount--) {
                this.particles.push(this.createParticle(x, y, customGravity, twinkleEffect, isSubParticle, undefined, this.random(2, 12), targetHue));
            }
        }
    }

    loop() {
        this.rafId = requestAnimationFrame(this.loop.bind(this));

        if (!this.isEnabled) {
            if (this.ctx) this.ctx.clearRect(0, 0, this.cw, this.ch);
            this.fireworks = [];
            this.particles = [];
            return;
        }

        if (!this.ctx) return;
        this.hue += 0.5;

        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.fillRect(0, 0, this.cw, this.ch);
        this.ctx.globalCompositeOperation = "lighter";

        var i = this.fireworks.length;
        while (i--) {
            this.drawFirework(this.fireworks[i]);
            this.updateFirework(this.fireworks[i], i);
        }

        i = this.particles.length;
        while (i--) {
            this.drawParticle(this.particles[i]);
            this.updateParticle(this.particles[i], i);
        }

        if (this.timerTick >= this.timerTotal) {
            this.timerTick = 0;
        } else {
            var temp = this.timerTick % 400;

            if (temp % 60 === 0) {
                let randomX = this.random(this.cw * 0.1, this.cw * 0.9);
                let targetX = this.random(this.cw * 0.2, this.cw * 0.8);
                let targetY = this.random(this.ch * 0.1, this.ch * 0.4);
                let randomHue = this.random(0, 360);
                this.fireworks.push(this.createFirework(randomX, this.ch, targetX, targetY, randomHue));
            }

            if (temp <= 15 && temp % 5 === 0) {
                this.fireworks.push(this.createFirework(100, this.ch, this.random(this.cw * 0.3, this.cw * 0.5), this.random(this.ch * 0.1, this.ch * 0.3), this.random(0, 360)));
                this.fireworks.push(this.createFirework(this.cw - 100, this.ch, this.random(this.cw * 0.5, this.cw * 0.7), this.random(this.ch * 0.1, this.ch * 0.3), this.random(0, 360)));
            }

            this.timerTick++;
        }

        if (this.limiterTick >= this.limiterTotal) {
            if (this.mousedown) {
                this.fireworks.push(this.createFirework(this.cw / 2, this.ch, this.mx, this.my, this.random(0, 360)));
                this.limiterTick = 0;
            }
        } else {
            this.limiterTick++;
        }
    }
}
