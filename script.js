 // ═══════════ AMBIENT PARTICLE SYSTEM ═══════════
    (function(){
        const canvas = document.getElementById('particle-canvas');
        const ctx = canvas.getContext('2d');
        let W, H, particles = [];

        function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < 45; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 2.2 + 0.5,
                dx: (Math.random() - 0.5) * 0.25,
                dy: (Math.random() - 0.5) * 0.18,
                o: Math.random() * 0.5 + 0.2,
                pulse: Math.random() * Math.PI * 2
            });
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            for (const p of particles) {
                p.pulse += 0.012;
                const alpha = p.o + Math.sin(p.pulse) * 0.15;
                ctx.globalAlpha = Math.max(0.08, Math.min(0.75, alpha));
                // Gold glow
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
                grad.addColorStop(0, 'rgba(232,201,122,0.6)');
                grad.addColorStop(0.5, 'rgba(201,168,76,0.15)');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
                ctx.fill();
                // Core dot
                ctx.fillStyle = '#E8C97A';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();

                p.x += p.dx;
                p.y += p.dy;
                if (p.x < -10) p.x = W + 10;
                if (p.x > W + 10) p.x = -10;
                if (p.y < -10) p.y = H + 10;
                if (p.y > H + 10) p.y = -10;
            }
            ctx.globalAlpha = 1;
            requestAnimationFrame(draw);
        }
        draw();
    })();


    // ═══════════ AURORA MOUSE TRACKER ═══════════
    (function(){
        const aurora = document.getElementById('bg-aurora');
        let ax = 30, ay = 25, bx = 70, by = 70;
        let tx = 30, ty = 25;

        document.addEventListener('mousemove', e => {
            tx = (e.clientX / window.innerWidth) * 100;
            ty = (e.clientY / window.innerHeight) * 100;
        });

        function animate() {
            ax += (tx - ax) * 0.008;
            ay += (ty - ay) * 0.008;
            bx += ((100 - tx) - bx) * 0.006;
            by += ((100 - ty) - by) * 0.006;
            aurora.style.setProperty('--ax', ax + '%');
            aurora.style.setProperty('--ay', ay + '%');
            aurora.style.setProperty('--bx', bx + '%');
            aurora.style.setProperty('--by', by + '%');
            requestAnimationFrame(animate);
        }
        animate();
    })();


    // ═══════════ SCROLL REVEAL OBSERVER ═══════════
    (function(){
        const els = document.querySelectorAll('.reveal, .reveal-stagger');
        if (!('IntersectionObserver' in window)) {
            els.forEach(el => el.classList.add('active'));
            return;
        }
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('active'); obs.unobserve(e.target); }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        
        window.refreshReveals = () => {
            els.forEach(el => {
                const rect = el.getBoundingClientRect();
                // If invitation isn't opened, don't auto-activate
                if (!document.body.classList.contains('invitation-opened')) {
                    obs.observe(el);
                    return;
                }
                
                if (rect.top < window.innerHeight) {
                    el.classList.add('active');
                } else {
                    obs.observe(el);
                }
            });
        };
        
        window.refreshReveals();
    })();


    // ═══════════ MAIN-PAGE ONLY AUDIO PLAYER ═══════════
    // Put your song file beside index.html and name it: Jhilmil-Sitaron.mp3
    const audio = document.getElementById('wedding-audio');
    const audioIcon = document.getElementById('audio-icon');
    const audioPulse = document.getElementById('audio-pulse');
    const audioStatus = document.getElementById('audio-status');
    let isPlaying = false;
    let musicStartedAfterInvitation = false;
    let musicFadeTimer = null;

    function fadeAudioTo(targetVolume, duration) {
        if (!audio) return;
        clearInterval(musicFadeTimer);
        const start = audio.volume;
        const startTime = performance.now();
        musicFadeTimer = setInterval(() => {
            const t = Math.min(1, (performance.now() - startTime) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            audio.volume = start + (targetVolume - start) * eased;
            if (t >= 1) clearInterval(musicFadeTimer);
        }, 32);
    }

    function updateAudioUI(playing) {
        if (!audioIcon || !audioPulse) return;
        if (playing) {
            audioIcon.textContent = '❚❚';
            audioPulse.style.animation = 'pulse 1.5s ease-in-out infinite';
            audioPulse.style.opacity = '1';
            if (audioStatus) audioStatus.textContent = 'Now Playing';
            isPlaying = true;
        } else {
            audioIcon.textContent = '▶';
            audioPulse.style.animation = 'none';
            audioPulse.style.opacity = '0.4';
            if (audioStatus) audioStatus.textContent = 'Paused';
            isPlaying = false;
        }
    }

    window.toggleAudio = function() {
        if (!audio) return;
        if (audio.paused) {
            audio.muted = false;
            audio.volume = 0.9;
            audio.play().then(() => {
                musicStartedAfterInvitation = true;
                updateAudioUI(true);
            }).catch(err => {
                console.log('Audio play failed:', err);
                if (audioStatus) audioStatus.textContent = 'Tap to Play';
            });
        } else {
            audio.pause();
            updateAudioUI(false);
        }
    };

    window.primeInvitationMusic = function() {
        if (!audio || musicStartedAfterInvitation) return;
        audio.muted = false;
        audio.volume = 0;
        audio.play().then(() => {
            musicStartedAfterInvitation = true;
            updateAudioUI(true);
            if (audioStatus) audioStatus.textContent = 'Opening...';
        }).catch(err => {
            console.log('Music prime blocked:', err);
            updateAudioUI(false);
            if (audioStatus) audioStatus.textContent = 'Tap to Play';
        });
    };

    window.startInvitationMusic = function() {
        if (!audio || musicStartedAfterInvitation) return;
        audio.muted = false;
        audio.volume = 0;
        audio.play().then(() => {
            musicStartedAfterInvitation = true;
            updateAudioUI(true);
            fadeAudioTo(0.9, 900);
        }).catch(err => {
            // This normally should not happen because it is called from OPEN INVITATION click.
            console.log('Main-page music blocked:', err);
            updateAudioUI(false);
            if (audioStatus) audioStatus.textContent = 'Tap to Play';
        });
    };

    window.fadeInInvitationMusic = function() {
        if (!audio) return;
        audio.muted = false;
        if (audio.paused) {
            window.startInvitationMusic();
        } else {
            updateAudioUI(true);
            fadeAudioTo(0.9, 900);
        }
    };

    if (audio) {
        audio.addEventListener('play', () => updateAudioUI(true));
        audio.addEventListener('pause', () => updateAudioUI(false));
        audio.addEventListener('ended', () => {
            if (!audio.loop) updateAudioUI(false);
        });

        // Initial idle state for floating control
        audioIcon.textContent = '▶';
        audioPulse.style.animation = 'none';
        audioPulse.style.opacity = '0.4';
        if (audioStatus) audioStatus.textContent = 'Click to Play';
        isPlaying = false;
    }


    // ═══════════ RSVP → FIREWORKS ═══════════
    function submitRSVP() {
        const c = document.getElementById('fireworks-container');
        c.style.display = 'flex';
        launchFireworks();
    }
    function closeFireworks() {
        document.getElementById('fireworks-container').style.display = 'none';
        if (window._fwInt) clearInterval(window._fwInt);
    }

    function launchFireworks() {
        const canvas = document.getElementById('fireworks-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let sparks = [];
        const colors = ['#C9A84C','#E8C97A','#FAF3E0','#8B6914','#FFFFFF','#1A5C45'];

        function burst(x, y) {
            for (let i = 0; i < 80; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 1.5;
                sparks.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: Math.random() * 60 + 50,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: Math.random() * 3 + 1.5
                });
            }
        }

        for (let i = 0; i < 5; i++) {
            setTimeout(() => burst(
                Math.random() * canvas.width * 0.7 + canvas.width * 0.15,
                Math.random() * canvas.height * 0.5 + 60
            ), i * 200);
        }

        window._fwInt = setInterval(() => {
            if (document.getElementById('fireworks-container').style.display !== 'none') {
                burst(Math.random() * canvas.width, Math.random() * canvas.height * 0.6 + 40);
            }
        }, 700);

        function animate() {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                s.x += s.vx; s.y += s.vy; s.vy += 0.04; s.life--;
                ctx.globalAlpha = Math.max(0, s.life / 70);
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
                // Tail
                ctx.globalAlpha = Math.max(0, s.life / 140);
                ctx.beginPath();
                ctx.arc(s.x - s.vx, s.y - s.vy, s.size * 0.6, 0, Math.PI * 2);
                ctx.fill();
                if (s.life <= 0) sparks.splice(i, 1);
            }
            ctx.globalAlpha = 1;
            if (document.getElementById('fireworks-container').style.display !== 'none') {
                requestAnimationFrame(animate);
            }
        }
        animate();
    }

    // ═══════════ RESPONSIVE GRID FIX ═══════════
    (function(){
        function fixGrids() {
            // Only target inline-style grids, not CSS-class-based grids
            const inlineGrids = document.querySelectorAll('[style*="grid-template-columns: 1fr 1fr"]');
            if (window.innerWidth < 768) {
                inlineGrids.forEach(el => {
                    if (!el.classList.contains('gallery-grid')) {
                        el.style.gridTemplateColumns = '1fr';
                    }
                });
            } else {
                inlineGrids.forEach(el => {
                    if (!el.classList.contains('gallery-grid')) {
                        el.style.gridTemplateColumns = '1fr 1fr';
                    }
                });
            }
        }
        fixGrids();
        window.addEventListener('resize', fixGrids);
    })();

    // ═══════════ COUNTDOWN TIMER ═══════════
    (function(){
        const targetDate = new Date('2026-12-18T17:30:00').getTime();
        
        const dEl = document.getElementById('cd-days');
        const hEl = document.getElementById('cd-hours');
        const mEl = document.getElementById('cd-mins');
        const sEl = document.getElementById('cd-secs');
        
        if (!dEl) return;
        
        function pad(n){ return String(Math.max(0,n)).padStart(2,'0'); }
        
        function update(){
            const now = Date.now();
            const diff = targetDate - now;
            
            if (diff <= 0) {
                dEl.textContent = '00';
                hEl.textContent = '00';
                mEl.textContent = '00';
                sEl.textContent = '00';
                return;
            }
            
            const days  = Math.floor(diff / (1000*60*60*24));
            const hours = Math.floor((diff / (1000*60*60)) % 24);
            const mins  = Math.floor((diff / (1000*60)) % 60);
            const secs  = Math.floor((diff / 1000) % 60);
            
            dEl.textContent = pad(days);
            hEl.textContent = pad(hours);
            mEl.textContent = pad(mins);
            sEl.textContent = pad(secs);
        }
        
        update();
        setInterval(update, 1000);
    })();

    // ═══════════ SCRATCH CARD FUNCTIONALITY ═══════════
    (function(){
        const scratchCards = document.querySelectorAll('.scratch-card');
        
        window.setupScratchCanvases = () => {
            scratchCards.forEach(card => {
                const canvas = card.querySelector('canvas');
                if (canvas && canvas._setup) canvas._setup();
            });
        };

        scratchCards.forEach(card => {
            const result = card.querySelector('.scratch-result');
            const wrap = document.createElement('div');
            wrap.className = 'scratch-canvas-wrap';
            card.appendChild(wrap);
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            wrap.appendChild(canvas);
            
            let isDrawing = false;
            let scratchedPixels = 0;
            let isRevealed = false;
            
            function setupCanvas() {
                const rect = card.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
                const r  = Math.min(cx, cy);
                
                // Clip to circle shape
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.clip();
                
                // Gold radial gradient fill
                const grad = ctx.createRadialGradient(cx * 0.7, cy * 0.6, r * 0.05, cx, cy, r);
                grad.addColorStop(0,   '#F0D875');
                grad.addColorStop(0.4, '#C9A84C');
                grad.addColorStop(0.8, '#8B6914');
                grad.addColorStop(1,   '#6B4F0E');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Diagonal lines
                ctx.strokeStyle = 'rgba(139, 105, 20, 0.35)';
                ctx.lineWidth = 1;
                for (let i = -canvas.height; i < canvas.width + canvas.height; i += 12) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i + canvas.height, canvas.height);
                    ctx.stroke();
                }
                
                // Texture dots
                for (let i = 0; i < 400; i++) {
                    ctx.fillStyle = `rgba(255,220,100,${Math.random() * 0.25})`;
                    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2.5, Math.random() * 2.5);
                }
                
                // Shine arc at top
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(cx, cy, r * 0.6, Math.PI * 1.2, Math.PI * 1.9);
                ctx.stroke();
                
                // Text
                ctx.fillStyle = 'rgba(250, 243, 224, 0.9)';
                const isGrand = card.classList.contains('grand');
                ctx.font = `bold ${isGrand ? 16 : 13}px "Cinzel Decorative", serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('✦ SCRATCH ✦', cx, cy - (isGrand ? 12 : 10));
                ctx.font = `${isGrand ? 13 : 11}px "Cormorant Garamond", serif`;
                ctx.fillStyle = 'rgba(250, 243, 224, 0.65)';
                ctx.fillText('to reveal', cx, cy + (isGrand ? 10 : 8));
                
                ctx.restore();
                // Now switch to erase mode
                ctx.globalCompositeOperation = 'destination-out';
                
                scratchedPixels = 0;
                isRevealed = false;
            }
            
            function getPos(e) {
                const rect = canvas.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                return {
                    x: clientX - rect.left,
                    y: clientY - rect.top
                };
            }
            
            function scratch(e) {
                if (!isDrawing || isRevealed) return;
                e.preventDefault();
                const pos = getPos(e);
                const isGrand = card.classList.contains('grand');
                const brushSize = isGrand ? 38 : 28;
                
                ctx.globalCompositeOperation = 'destination-out';
                // Soft gradient eraser for smooth scratching feel
                const eraseGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, brushSize);
                eraseGrad.addColorStop(0, 'rgba(0,0,0,1)');
                eraseGrad.addColorStop(0.5, 'rgba(0,0,0,0.8)');
                eraseGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = eraseGrad;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Count scratched area
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let transparent = 0;
                for (let i = 3; i < imageData.data.length; i += 4) {
                    if (imageData.data[i] === 0) transparent++;
                }
                scratchedPixels = transparent / (imageData.data.length / 4);
                
                // Auto reveal when 45% scratched
                if (scratchedPixels > 0.45 && !isRevealed) {
                    revealCard();
                }
            }
            
            function revealCard() {
                if (isRevealed) return;
                isRevealed = true;
                isDrawing = false;
                
                // Clear entire canvas smoothly
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Mark as scratched and fade out
                wrap.classList.add('scratched');
                
                // Celebration effect
                card.style.transform = 'scale(1.03)';
                card.style.transition = 'transform 0.4s ease';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 400);
                
                // Play a subtle chime if audio context exists
                try {
                    if (window.audioCtx) {
                        const chime = window.audioCtx.createOscillator();
                        const chimeGain = window.audioCtx.createGain();
                        chime.type = 'sine';
                        chime.frequency.value = 880;
                        chimeGain.gain.setValueAtTime(0, window.audioCtx.currentTime);
                        chimeGain.gain.linearRampToValueAtTime(0.1, window.audioCtx.currentTime + 0.02);
                        chimeGain.gain.exponentialRampToValueAtTime(0.001, window.audioCtx.currentTime + 0.3);
                        chime.connect(chimeGain);
                        chimeGain.connect(window.audioCtx.destination);
                        chime.start();
                        chime.stop(window.audioCtx.currentTime + 0.3);
                    }
                } catch(e) {}
            }
            
            function startDraw(e) {
                if (isRevealed) return;
                isDrawing = true;
                scratch(e);
            }
            
            function endDraw() {
                isDrawing = false;
            }
            
            // Mouse events
            canvas.addEventListener('mousedown', startDraw);
            canvas.addEventListener('mousemove', scratch);
            canvas.addEventListener('mouseup', endDraw);
            canvas.addEventListener('mouseleave', endDraw);
            
            // Touch events
            canvas.addEventListener('touchstart', startDraw, { passive: false });
            canvas.addEventListener('touchmove', scratch, { passive: false });
            canvas.addEventListener('touchend', endDraw);
            canvas.addEventListener('touchcancel', endDraw);
            
            // Double-click to reveal (easier for some users)
            canvas.addEventListener('dblclick', revealCard);
            
            // Expose setup for later
            canvas._setup = setupCanvas;

            // Setup on load and resize
            setTimeout(setupCanvas, 300);
            window.addEventListener('resize', () => {
                if (!isRevealed) setupCanvas();
            });
        });
    })();

   // ═══════════ FIREBASE GUEST MESSAGES ═══════════
(function () {

    const form = document.getElementById('guest-message-form');
    const nameInput = document.getElementById('guest-name');
    const msgInput = document.getElementById('guest-message');
    const charCount = document.getElementById('char-count');
    const listEl = document.getElementById('guest-messages-list');
    const noMsg = document.getElementById('no-messages');

    if (!form) return;

    // Character Counter
    msgInput.addEventListener('input', () => {
        charCount.textContent =
            msgInput.value.length + ' / 300 characters';
    });

    // Submit Message
    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const name = nameInput.value.trim();
        const message = msgInput.value.trim();

        if (!name || !message) return;

        try {

            await firebaseFunctions.addDoc(
                firebaseFunctions.collection(
                    firebaseDB,
                    "messages"
                ),
                {
                    name,
                    message,
                    timestamp:
                        firebaseFunctions.serverTimestamp()
                }
            );

            form.reset();
            charCount.textContent =
                '0 / 300 characters';

        } catch (err) {

            console.error(err);

            alert(
                'Failed to send message. Please try again.'
            );
        }
    });

    // Live Messages
    const q = firebaseFunctions.query(
        firebaseFunctions.collection(
            firebaseDB,
            "messages"
        ),
        firebaseFunctions.orderBy(
            "timestamp",
            "desc"
        )
    );

    firebaseFunctions.onSnapshot(
        q,
        (snapshot) => {

            listEl.innerHTML = '';

            if (snapshot.empty) {

                listEl.appendChild(noMsg);
                return;
            }

            snapshot.forEach((doc) => {

                const m = doc.data();

                const card =
                    document.createElement('div');

                card.className =
                    'guest-message-card';

                card.style.cssText = `
                    background: linear-gradient(
                        145deg,
                        rgba(20,73,58,0.55),
                        rgba(8,8,8,0.75)
                    );
                    border: 1px solid rgba(201,168,76,0.3);
                    border-radius: 20px;
                    padding: 24px 20px;
                    backdrop-filter: blur(10px);
                    margin-bottom: 20px;
                    text-align:center;
                `;

                card.innerHTML = `
                    <div style="
                        width:40px;
                        height:40px;
                        margin:auto;
                        border-radius:50%;
                        background:linear-gradient(
                            145deg,
                            #E8C97A,
                            #C9A84C
                        );
                        color:#000;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-weight:bold;
                        margin-bottom:12px;
                    ">
                        ${(m.name || '?')
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <h4 style="
                        color:#E8C97A;
                        margin-bottom:10px;
                    ">
                        ${m.name}
                    </h4>

                    <p style="
                        color:#FAF3E0;
                        line-height:1.6;
                    ">
                        ${m.message}
                    </p>
                `;

                listEl.appendChild(card);
            });
        }
    );

})();

    // ═══════════ PREMIUM TOUCH / HOVER GLOW EFFECT ═══════════
    (function(){
        const selector = '.gallery-item, .glass-panel, .wedding-card, .ceremony-deck, .countdown-box, .scratch-card, .photo-frame, .guest-message-card, .double-border, .map-btn';
        const elements = document.querySelectorAll(selector);
        
        // Detect device capability
        const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const supportsTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        elements.forEach(el => {
            // ─── MOUSE TRACKING for radial glow (desktop/laptop/TV) ───
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty('--mx', x + '%');
                el.style.setProperty('--my', y + '%');
            });

            el.addEventListener('mouseleave', () => {
                el.style.setProperty('--mx', '50%');
                el.style.setProperty('--my', '50%');
            });

            // ─── TOUCH HANDLING for mobile/tablet ───
            if (supportsTouch) {
                el.addEventListener('touchstart', (e) => {
                    // Update glow position to touch point
                    const touch = e.touches[0];
                    const rect = el.getBoundingClientRect();
                    const x = ((touch.clientX - rect.left) / rect.width) * 100;
                    const y = ((touch.clientY - rect.top) / rect.height) * 100;
                    el.style.setProperty('--mx', x + '%');
                    el.style.setProperty('--my', y + '%');
                    el.classList.add('touched');

                    // Create ripple at touch point
                    createRipple(el, touch.clientX, touch.clientY);
                }, { passive: true });

                el.addEventListener('touchend', () => {
                    setTimeout(() => el.classList.remove('touched'), 1200);
                }, { passive: true });

                el.addEventListener('touchcancel', () => {
                    el.classList.remove('touched');
                }, { passive: true });
            }

            // ─── CLICK / PRESS VISUAL FEEDBACK ───
            const startPress = () => {
                el.classList.add('press-active');
                
                // Add a brief light flash inside
                const flash = document.createElement('div');
                flash.className = 'press-flash';
                el.appendChild(flash);
                setTimeout(() => flash.remove(), 450);
            };

            const endPress = () => {
                el.classList.remove('press-active');
            };

            // Mouse events
            el.addEventListener('mousedown', startPress);
            window.addEventListener('mouseup', endPress);

            // Touch events
            el.addEventListener('touchstart', startPress, { passive: true });
            el.addEventListener('touchend', endPress, { passive: true });
            el.addEventListener('touchcancel', endPress, { passive: true });

            // ─── CLICK ripple for desktop (so you also see ripple on click) ───
            el.addEventListener('click', (e) => {
                createRipple(el, e.clientX, e.clientY);
            });
        });

        function createRipple(el, clientX, clientY) {
            const rect = el.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = (clientX - rect.left - 40) + 'px';
            ripple.style.top = (clientY - rect.top - 40) + 'px';
            
            // Make sure element clips ripple
            const originalOverflow = el.style.overflow;
            if (getComputedStyle(el).overflow === 'visible') {
                el.style.overflow = 'hidden';
                el.style.position = el.style.position || 'relative';
            }
            
            el.appendChild(ripple);
            setTimeout(() => {
                ripple.remove();
                if (originalOverflow !== undefined) {
                    el.style.overflow = originalOverflow;
                }
            }, 900);
        }

        console.log('✨ Premium touch/glow effect activated on', elements.length, 'elements');
    })();

    // ═══════════ WELCOME GATE UNLOCK ═══════════
    window.unlockInvitation = function() {
        const gate = document.getElementById('welcome-gate');
        const wrapper = document.getElementById('main-content-wrapper');
        const body = document.body;
        if (!gate || !wrapper || gate.dataset.opening === 'true') return;
        gate.dataset.opening = 'true';

        // Prime the song silently from this user click. It fades in only when the main page appears.
        if (typeof window.primeInvitationMusic === 'function') {
            window.primeInvitationMusic();
        }

        // Build the portal zoom from the small Charminar gate.
        const anchor = document.getElementById('charminar-gate-anchor') || document.getElementById('charminar-logo-wrap');
        const rect = anchor.getBoundingClientRect();
        const portal = document.createElement('div');
        portal.id = 'gate-zoom-portal';
        portal.style.left = rect.left + 'px';
        portal.style.top = rect.top + 'px';
        portal.style.width = rect.width + 'px';
        portal.style.height = rect.height + 'px';
        portal.style.opacity = '1';
        document.body.appendChild(portal);

        gate.classList.add('gate-opening');
        gate.style.pointerEvents = 'none';

        // Prepare main content while the gate zooms.
        wrapper.style.visibility = 'visible';

        // Expand the portal until it becomes the whole screen.
        requestAnimationFrame(() => {
            portal.style.left = '50%';
            portal.style.top = '50%';
            portal.style.width = '145vmax';
            portal.style.height = '145vmax';
            portal.style.transform = 'translate(-50%, -50%)';
        });

        // Reveal main invitation after the zoom lands.
        setTimeout(() => {
            gate.style.opacity = '0';
            portal.style.opacity = '0';
            wrapper.style.opacity = '1';
            wrapper.style.transform = 'translateY(0)';
            body.classList.remove('overflow-hidden');
            body.classList.add('invitation-opened'); // Activate letter-by-letter
            body.style.overflowX = 'hidden';
            body.style.overflowY = 'auto';
            
            // Re-trigger reveal animations for visible elements
            if (window.refreshReveals) window.refreshReveals();
            
            // Re-setup scratch canvases (needed because they were hidden)
            if (window.setupScratchCanvases) window.setupScratchCanvases();

            // Main page is now visible: fade in Jhilmil Sitaron.
            if (typeof window.fadeInInvitationMusic === 'function') window.fadeInInvitationMusic();
        }, 1180);

        // Remove gate/portal after the transition completes.
        setTimeout(() => {
            gate.style.display = 'none';
            portal.remove();
            // IMPORTANT: clear the transform so position:fixed children (floating audio)
            // stay truly fixed to the viewport instead of scrolling with the page.
            wrapper.style.transition = 'none';
            wrapper.style.transform = 'none';
            wrapper.style.willChange = 'auto';
        }, 2100);
    };

    // ═══════════ MOON AND FALLING STARS ANIMATION ═══════════
    (function(){
        const container = document.getElementById('celestial-container');
        if (!container) return;
        
        function createFallingStar() {
            const star = document.createElement('div');
            star.className = 'falling-star';
            
            // Random horizontal position
            star.style.left = Math.random() * 100 + 'vw';
            
            // Random duration for "slow but continuous" feel (6-12 seconds)
            const duration = 6 + Math.random() * 6;
            star.style.animationDuration = duration + 's';
            
            // Random delay so they don't start all at once
            star.style.animationDelay = Math.random() * 5 + 's';
            
            container.appendChild(star);
            
            // Remove star after its animation ends to keep DOM clean
            setTimeout(() => {
                star.remove();
            }, (duration + 5) * 1000);
        }
        
        // Create initial batch
        for(let i = 0; i < 8; i++) {
            createFallingStar();
        }
        
        // Continuously create stars
        setInterval(createFallingStar, 1400);
    })();