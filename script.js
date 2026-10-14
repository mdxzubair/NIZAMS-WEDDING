 // ═══════════ AMBIENT PARTICLE SYSTEM ═══════════
    (function(){

    if(window.innerWidth < 768){
        return;
    }

    const canvas =
    document.getElementById('particle-canvas');
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


    // ═══════════ REAL RSVP SYSTEM ═══════════
const RSVP_EMAIL_WEBHOOK = window.RSVP_EMAIL_WEBHOOK || "";
function setRSVPStatus(message, type) { const el=document.getElementById('rsvp-status-message'); if(el){el.textContent=message||'';el.className='rsvp-status-message '+(type||'');} }
async function sendRSVPEmail(data){ if(!RSVP_EMAIL_WEBHOOK) return {skipped:true}; await fetch(RSVP_EMAIL_WEBHOOK,{method:'POST',mode:'no-cors',body:JSON.stringify(data)}); return {sent:true}; }
async function saveRSVP(data){ return firebaseFunctions.addDoc(firebaseFunctions.collection(firebaseDB,'rsvps'),{name:data.name,guests:data.guests,attendance:data.attendance,status:data.status,message:data.message,timestamp:firebaseFunctions.serverTimestamp()}); }
function showRSVPSuccess(){const c=document.getElementById('fireworks-container');if(c){c.style.display='flex';launchFireworks();}}
window.submitRSVP=async function(){
 const form=document.getElementById('rsvp-form'); if(!form)return;
 const name=document.getElementById('rsvp-name')?.value.trim(), guests=Number(document.getElementById('rsvp-guests')?.value||1), status=document.getElementById('rsvp-status')?.value||'attending', attendance=document.getElementById('rsvp-attendance')?.value||'Attending All Events', message=document.getElementById('rsvp-message')?.value.trim()||'', button=document.getElementById('rsvp-submit');
 const honeypot=document.getElementById('rsvp-website')?.value.trim(); const last=Number(localStorage.getItem('nizam_rsvp_last_submit')||0); if(honeypot)return; if(Date.now()-last<15000)return setRSVPStatus('Please wait a few seconds before submitting again.','error'); if(!navigator.onLine)return setRSVPStatus('You appear to be offline. Please reconnect and try again.','error');
 if(!name||name.length<2)return setRSVPStatus('Please enter your full name.','error'); if(!Number.isInteger(guests)||guests<1||guests>10)return setRSVPStatus('Please select a valid guest count.','error'); if(message.length>300)return setRSVPStatus('Your message is too long.','error');
 if(button){button.disabled=true;button.textContent='SENDING…';} setRSVPStatus('Saving your RSVP securely…','loading');
 const payload={name,guests,status,attendance,message};
 try{ await saveRSVP(payload); localStorage.setItem('nizam_rsvp_last_submit',String(Date.now())); let emailResult={skipped:true}; try{emailResult=await sendRSVPEmail(payload);}catch(e){console.warn('RSVP email notification failed:',e);} form.reset();document.getElementById('rsvp-guests').value='1';document.getElementById('rsvp-status').value='attending';document.getElementById('rsvp-attendance').value='Attending All Events';setRSVPStatus(emailResult.sent?'RSVP received. Notification sent.':'RSVP received successfully.','success');showRSVPSuccess(); }
 catch(e){console.error('RSVP submission failed:',e);setRSVPStatus('We could not save your RSVP. Please check your connection and try again.','error');}
 finally{if(button){button.disabled=false;button.textContent='ACCEPT WITH BLESSINGS';}}
};
(function(){const f=document.getElementById('rsvp-form');if(f)f.addEventListener('submit',e=>{e.preventDefault();window.submitRSVP();});})();
function closeFireworks(){const c=document.getElementById('fireworks-container');if(c)c.style.display='none';if(window._fwInt)clearInterval(window._fwInt);if(window._fwTimeouts){window._fwTimeouts.forEach(clearTimeout);window._fwTimeouts=[];}const t=document.getElementById('fireworks-title'),s=document.getElementById('fireworks-subtitle');if(t){t.textContent='JazakAllah Khair!';t.style.fontFamily="'Cinzel Decorative',serif";t.style.fontStyle='normal';t.style.fontWeight='400';t.style.color='var(--gold)';t.style.fontSize='48px';}if(s){s.textContent='Thank you for your blessings';s.style.fontFamily="'Cormorant Garamond',serif";s.style.fontStyle='normal';s.style.fontWeight='400';s.style.color='var(--cream)';s.style.fontSize='20px';s.style.maxWidth='';s.style.marginLeft='';s.style.marginRight='';s.style.lineHeight='';}} window.closeFireworks=closeFireworks;
function launchFireworks(){
    const canvas=document.getElementById('fireworks-canvas');
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    canvas.width=innerWidth;
    canvas.height=innerHeight;
    let sparks=[];
    const colors=['#C9A84C','#E8C97A','#FAF3E0','#8B6914','#FFFFFF','#1A5C45'];
    function burst(x,y){
        for(let i=0;i<80;i++){
            const a=Math.random()*Math.PI*2,sp=Math.random()*6+1.5;
            sparks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:Math.random()*60+50,color:colors[Math.floor(Math.random()*colors.length)],size:Math.random()*3+1.5});
        }
    }
    if(window._fwInt)clearInterval(window._fwInt);
    if(window._fwTimeouts)window._fwTimeouts.forEach(clearTimeout);
    window._fwTimeouts=[];
    for(let i=0;i<5;i++){
        window._fwTimeouts.push(setTimeout(()=>burst(canvas.width*.15+Math.random()*canvas.width*.7,canvas.height*.15+Math.random()*canvas.height*.45),i*350));
    }
    window._fwInt=setInterval(()=>{
        ctx.fillStyle='rgba(0,0,0,.18)';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        sparks=sparks.filter(s=>s.life>0);
        sparks.forEach(s=>{
            s.x+=s.vx;s.y+=s.vy;s.vy+=.04;s.vx*=.99;s.life--;
            ctx.globalAlpha=Math.max(0,s.life/100);
            ctx.fillStyle=s.color;
            ctx.beginPath();ctx.arc(s.x,s.y,s.size,0,Math.PI*2);ctx.fill();
        });
        ctx.globalAlpha=1;
        if(!sparks.length){clearInterval(window._fwInt);ctx.clearRect(0,0,canvas.width,canvas.height);}
    },16);
}


// ═══════════ VISITOR COUNTER — CONTINUOUS WEDDING CELEBRATION ═══════════
(function(){
    const canvas = document.getElementById('visitor-celebration-canvas');
    const box = document.getElementById('visitor-counter');
    if(!canvas || !box) return;

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduceMotion) return;

    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    let width = 0, height = 0, dpr = 1, raf = 0, lastTime = 0;
    let bursts = [];
    let particles = [];
    let rockets = [];
    let nextBurstAt = 0;
    let burstCount = 0;

    const colors = ['#C9A84C','#E8C97A','#FAF3E0','#D4B85A','#FFFFFF','#8B6914'];

    function resize(){
        const rect = box.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
    }

    // The center 46% of the box is deliberately protected for the visitor number.
    function sidePoint(side){
        const left = side === 'left';
        const minX = left ? width * .08 : width * .75;
        const maxX = left ? width * .25 : width * .92;
        return {
            x: minX + Math.random() * (maxX - minX),
            y: height * (.30 + Math.random() * .40)
        };
    }

    function createBurst(side){
        const p = sidePoint(side);
        const mobile = width < 420;
        const count = mobile ? 34 : 52;
        const maxRadius = mobile ? 20 : 30;

        bursts.push({x:p.x,y:p.y,life:0,maxLife:22});

        // Bright radial "cracker" spokes.
        for(let i=0;i<count;i++){
            const angle = Math.random() * Math.PI * 2;
            const speed = (mobile ? .95 : 1.2) + Math.random() * (mobile ? 2.0 : 2.8);
            particles.push({
                x:p.x, y:p.y,
                vx:Math.cos(angle)*speed,
                vy:Math.sin(angle)*speed,
                life:34 + Math.random()*34,
                maxLife:68,
                size:.75 + Math.random()*1.8,
                color:colors[(Math.random()*colors.length)|0],
                gravity:.020 + Math.random()*.025,
                trail:true
            });
        }

        // A few slower glowing embers make the burst feel fuller.
        for(let i=0;i<8;i++){
            const angle = Math.random() * Math.PI * 2;
            const speed = .35 + Math.random()*.8;
            particles.push({
                x:p.x, y:p.y,
                vx:Math.cos(angle)*speed,
                vy:Math.sin(angle)*speed,
                life:55 + Math.random()*35,
                maxLife:90,
                size:.8 + Math.random()*1.2,
                color:'#E8C97A',
                gravity:.012 + Math.random()*.012,
                trail:false
            });
        }

        // Keep a tiny flash only at the burst origin, never over the number area.
        const flashRadius = Math.min(maxRadius, 10 + Math.random()*8);
        bursts[bursts.length-1].flashRadius = flashRadius;
    }

    function scheduleNext(now){
        // Continuous forever: no multi-second empty gaps.
        // Every burst is independent of the visitor count.
        const delay = 620 + Math.random()*520;
        nextBurstAt = now + delay;
    }

    function draw(now){
        if(!lastTime) lastTime = now;
        const dt = Math.min(2, (now-lastTime)/16.67);
        lastTime = now;

        ctx.clearRect(0,0,width,height);

        // Burst flashes / radial spokes.
        bursts = bursts.filter(b => {
            b.life += dt;
            const progress = b.life / b.maxLife;
            const alpha = Math.max(0,1-progress);

            ctx.save();
            ctx.globalAlpha = alpha * .9;
            ctx.strokeStyle = '#E8C97A';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#E8C97A';

            for(let i=0;i<10;i++){
                const angle = i * Math.PI/5;
                const r1 = 2 + progress * 3;
                const r2 = Math.min(34,width*.12) * progress + 4;
                ctx.beginPath();
                ctx.moveTo(b.x+Math.cos(angle)*r1,b.y+Math.sin(angle)*r1);
                ctx.lineTo(b.x+Math.cos(angle)*r2,b.y+Math.sin(angle)*r2);
                ctx.stroke();
            }

            ctx.globalAlpha = alpha * .75;
            ctx.fillStyle = '#FAF3E0';
            ctx.beginPath();
            ctx.arc(b.x,b.y,Math.max(1,b.flashRadius*(1-progress)),0,Math.PI*2);
            ctx.fill();
            ctx.restore();

            return b.life < b.maxLife;
        });

        // Particle sparks with short trails.
        particles = particles.filter(p => {
            const oldX = p.x;
            const oldY = p.y;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.vx *= Math.pow(.985,dt);
            p.life -= dt;
            if(p.life <= 0) return false;

            const alpha = Math.min(1,p.life/20) * .95;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;

            if(p.trail){
                ctx.strokeStyle = p.color;
                ctx.lineWidth = Math.max(.45,p.size*.65);
                ctx.beginPath();
                ctx.moveTo(oldX,oldY);
                ctx.lineTo(p.x,p.y);
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
            ctx.fill();
            ctx.restore();
            return true;
        });

        // Launch a side cracker, then explode it shortly afterward.
        if(now >= nextBurstAt){
            const side = (burstCount++ % 2 === 0) ? 'left' : 'right';
            createBurst(side);

            // Sometimes make a celebratory paired burst on the opposite side.
            if(Math.random() < .38){
                setTimeout(() => createBurst(side === 'left' ? 'right' : 'left'), 210);
            }

            scheduleNext(now);
        }

        raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize, {passive:true});
    nextBurstAt = performance.now() + 350;
    raf = requestAnimationFrame(draw);

    window.addEventListener('beforeunload', () => cancelAnimationFrame(raf), {once:true});
})();


    
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

    // ═══════════ SCRATCH REVEAL CELEBRATION ═══════════
(function(){
    // EDIT THIS VALUE in seconds to change only the full-screen EVENT 3 mega celebration.
    // Example: 10 means ten seconds. The two small circles keep their original short celebration.
    window.SCRATCH_MEGA_CELEBRATION_SECONDS = 5;

    window.playScratchCelebration = function(card){
        if(!card) return;
        const grand=card.classList.contains('grand');
        const existing=grand
            ? document.querySelector('.scratch-celebration-canvas.fullscreen')
            : card.querySelector('.scratch-celebration-canvas.local');
        if(existing) existing.remove();

        const canvas=document.createElement('canvas');
        canvas.className='scratch-celebration-canvas '+(grand?'fullscreen':'local');
        canvas.setAttribute('aria-hidden','true');
        if(grand){
            document.body.appendChild(canvas);
            const section=card.closest('.scratch-section');
            if(section){
                section.classList.add('all-events-revealed');
                section.querySelectorAll('.scratch-sub-label').forEach((label,n)=>{
                    label.textContent='EVENT '+(n+1);
                });
            }
        }else card.appendChild(canvas);

        const ctx=canvas.getContext('2d');
        if(!ctx){canvas.remove();return;}
        const dpr=Math.min(window.devicePixelRatio||1,2);
        let width=1,height=1;
        function resize(){
            if(grand){width=document.documentElement.clientWidth||window.innerWidth;height=window.innerHeight;}
            else{const r=card.getBoundingClientRect();width=Math.max(1,Math.round(Math.min(r.width,r.height)));height=width;}
            canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
            canvas.style.width=width+'px';canvas.style.height=height+'px';
            ctx.setTransform(dpr,0,0,dpr,0,0);
        }
        resize();
        const size=Math.min(width,height);
        const colors=['#C9A84C','#E8C97A','#FAF3E0','#D4B85A','#FFFFFF','#8B6914','#FFF1A8'];
        const bursts=[],particles=[],rockets=[];
        const duration=grand?Math.max(1,Number(window.SCRATCH_MEGA_CELEBRATION_SECONDS)||3)*1000:1450;
        const started=performance.now(),endAt=started+duration;
        const burstRadius=grand?Math.min(width,height)*.17:size*.27;

        function burst(x,y,power=1){
            const b={x,y,life:0,maxLife:25,power};bursts.push(b);
            const count=Math.round((grand?125:72)*power);
            for(let i=0;i<count;i++){
                const angle=Math.random()*Math.PI*2;
                const speed=(grand?1.2+Math.random()*4.2:.9+Math.random()*2.7)*power;
                particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
                    life:(grand?55+Math.random()*48:38+Math.random()*34),maxLife:grand?103:72,
                    size:(.7+Math.random()*(grand?2.5:1.7))*power,
                    color:colors[(Math.random()*colors.length)|0],gravity:grand?.012+Math.random()*.025:.018+Math.random()*.025});
            }
        }
        function launchRocket(){
            const x=width*(.1+Math.random()*.8),targetX=width*(.08+Math.random()*.84);
            const targetY=height*(.12+Math.random()*.58);
            rockets.push({x,y:height+8,vx:(targetX-x)/45,vy:-(5+Math.random()*4),targetX,targetY,life:0,color:colors[(Math.random()*colors.length)|0]});
        }

        if(grand){
            // Several large opening fireworks spread over the whole screen.
            burst(width*.22,height*.24,1.25);
            burst(width*.78,height*.25,1.15);
            burst(width*.28,height*.72,1.1);
            burst(width*.74,height*.70,1.2);
            // Rocket launches continue throughout the configurable duration.
            launchRocket();
            const rocketTimer=setInterval(()=>{if(performance.now()<endAt)launchRocket();else clearInterval(rocketTimer);},Math.max(180,Math.min(420,duration/9)));
            // Additional timed crackers: keep launching until the configured duration ends.
            const crackerTimer=setInterval(()=>{
                if(performance.now()>=endAt){clearInterval(crackerTimer);return;}
                burst(width*(.12+Math.random()*.76),height*(.12+Math.random()*.62),.55+Math.random()*.7);
            },Math.max(260,Math.min(650,duration/6)));
            canvas._celebrationTimers=[rocketTimer,crackerTimer];
        }else{
            burst(width*.22,height*.27,1);
            setTimeout(()=>{if(canvas.isConnected)burst(width*.78,height*.27,.9);},180);
            setTimeout(()=>{if(canvas.isConnected)burst(width*.28,height*.73,.82);},360);
        }

        let last=performance.now();
        function frame(now){
            const dt=Math.min(2,(now-last)/16.67);last=now;
            ctx.clearRect(0,0,width,height);
            // Firework rockets with bright trails, then a burst at the apex.
            for(let i=rockets.length-1;i>=0;i--){
                const r=rockets[i],ox=r.x,oy=r.y;
                r.x+=r.vx*dt;r.y+=r.vy*dt;r.vy+=.045*dt;r.life+=dt;
                ctx.save();ctx.globalAlpha=.95;ctx.strokeStyle=r.color;ctx.lineWidth=2.2;
                ctx.shadowBlur=14;ctx.shadowColor=r.color;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(r.x,r.y);ctx.stroke();
                for(let k=1;k<=4;k++){ctx.globalAlpha=.22;ctx.beginPath();ctx.arc(r.x-r.vx*k*2,r.y-r.vy*k*2,Math.max(.5,2-k*.3),0,Math.PI*2);ctx.fillStyle=r.color;ctx.fill();}
                ctx.restore();
                if(r.y<=r.targetY||r.life>80){burst(r.x,r.y,.75+Math.random()*.6);rockets.splice(i,1);}
            }
            for(let i=bursts.length-1;i>=0;i--){
                const b=bursts[i];b.life+=dt;const p=Math.min(1,b.life/b.maxLife),alpha=(1-p)*b.power;
                ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='#E8C97A';ctx.lineWidth=grand?1.4:1;
                ctx.shadowBlur=grand?18:10;ctx.shadowColor='#E8C97A';
                for(let k=0;k<16;k++){
                    const ang=k*Math.PI/8,r1=2+p*4,r2=Math.min(burstRadius,grand?Math.min(width,height)*.25:size*.38)*p+5;
                    ctx.beginPath();ctx.moveTo(b.x+Math.cos(ang)*r1,b.y+Math.sin(ang)*r1);ctx.lineTo(b.x+Math.cos(ang)*r2,b.y+Math.sin(ang)*r2);ctx.stroke();
                }
                ctx.restore();
                if(b.life>=b.maxLife)bursts.splice(i,1);
            }
            for(let i=particles.length-1;i>=0;i--){
                const q=particles[i],ox=q.x,oy=q.y;
                q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=q.gravity*dt;q.vx*=Math.pow(.985,dt);q.life-=dt;
                if(q.life<=0){particles.splice(i,1);continue;}
                ctx.save();ctx.globalAlpha=Math.min(1,q.life/22)*.98;ctx.fillStyle=q.color;ctx.strokeStyle=q.color;
                ctx.shadowBlur=grand?12:7;ctx.shadowColor=q.color;ctx.lineWidth=Math.max(.5,q.size*.7);
                ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(q.x,q.y);ctx.stroke();
                ctx.beginPath();ctx.arc(q.x,q.y,q.size,0,Math.PI*2);ctx.fill();ctx.restore();
            }
            if(now<endAt||rockets.length||particles.length||bursts.length){requestAnimationFrame(frame);}
            else{
                ctx.clearRect(0,0,width,height);
                canvas.classList.add('finished');
                if(canvas._celebrationTimers)canvas._celebrationTimers.forEach(clearInterval);
                setTimeout(()=>{clearTimeout(hardCleanup);canvas.remove();},250);
            }
        }
        requestAnimationFrame(frame);
        // Safety cleanup: the full-screen overlay must never remain stuck if animation frames pause.
        const hardCleanup=setTimeout(()=>{
            if(canvas.isConnected){
                if(canvas._celebrationTimers)canvas._celebrationTimers.forEach(clearInterval);
                canvas.remove();
            }
        },duration+6500);
        if(grand){
            const onResize=()=>resize();window.addEventListener('resize',onResize);
            const observer=new MutationObserver(()=>{if(!canvas.isConnected){window.removeEventListener('resize',onResize);observer.disconnect();if(canvas._celebrationTimers)canvas._celebrationTimers.forEach(clearInterval);}});
            observer.observe(document.body,{childList:true});
        }
    };
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
                
                // One-shot celebration for this specific scratch card.
                // Smaller cards get a lighter burst; the grand card gets the full celebration.
                if (typeof window.playScratchCelebration === 'function') {
                    window.playScratchCelebration(card);
                }

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

// ═══════════ GUEST MESSAGE FIREWORKS CELEBRATION ═══════════
(function(){
    // 20 thank-you messages. They cycle in order so every submission gets
    // a different message, then the same 20 repeat from the beginning.
    const thankYouMessages = [
        'Mr {name}, thank you for your beautiful blessings and warm wishes!',
        'Mr {name}, your kind blessings mean so much to our family. Thank you!',
        'Mr {name}, thank you for filling this celebration with your lovely wishes!',
        'Mr {name}, your heartfelt blessings made this moment even more special. Thank you!',
        'Mr {name}, thank you for your wonderful words and beautiful blessings!',
        'Mr {name}, your warm wishes have added joy to our celebration. Thank you!',
        'Mr {name}, thank you for sharing such sweet blessings with our family!',
        'Mr {name}, your thoughtful wishes brought a beautiful smile to our hearts. Thank you!',
        'Mr {name}, thank you for being part of our celebration with your lovely blessings!',
        'Mr {name}, your generous blessings are truly cherished. Thank you!',
        'جناب {name}، آپ کی خوبصورت دعاؤں اور نیک تمناؤں کا دل سے شکریہ!',
        'جناب {name}، آپ کی پیاری دعاؤں نے ہماری خوشی کو اور بھی بڑھا دیا۔ شکریہ!',
        'جناب {name}، ہماری خوشیوں میں اپنی دعائیں شامل کرنے کے لیے بہت شکریہ!',
        'جناب {name}، آپ کی محبت بھری دعائیں ہمارے لیے بہت قیمتی ہیں۔ شکریہ!',
        'جناب {name}، آپ کی نیک تمناؤں اور دعاؤں کے لیے تہہ دل سے شکریہ!',
        'جناب {name}، آپ کے خوبصورت الفاظ نے اس خوشی کو مزید یادگار بنا دیا۔ شکریہ!',
        'Mr {name}, thank you for your heartfelt prayers and for celebrating this happiness with us!',
        'Mr {name}, your blessings have made our special moment even more memorable. Thank you!',
        'Mr {name}, thank you for your love, prayers, and wonderful wishes for our family!',
        'Mr {name}, your sweet blessings are a beautiful part of our celebration. Thank you!'
    ];

    const hosts = [
        '⭐ Zubair Uddin Mohammed ⭐',
        '⭐ Zameer Uddin Mohammed ⭐',
        '⭐ Zia Uddin Mohammed ⭐',
        '⭐ From Zia Family ⭐'
    ];

    function nextIndex(key, length){
        let previous = -1;
        try {
            const stored = Number(localStorage.getItem(key));
            if (Number.isInteger(stored)) previous = stored;
        } catch (_) {}
        const next = (previous + 1 + length) % length;
        try { localStorage.setItem(key, String(next)); } catch (_) {}
        return next;
    }

    window.showGuestMessageCelebration = function(visitorName){
        const container=document.getElementById('fireworks-container');
        const title=document.getElementById('fireworks-title');
        const subtitle=document.getElementById('fireworks-subtitle');
        if(!container || !title || !subtitle || typeof window.launchFireworks !== 'function') return;

        const safeName=String(visitorName||'Guest').trim() || 'Guest';
        const thankIndex=nextIndex('nizam_guest_thankyou_index_v2', thankYouMessages.length);
        const hostIndex=nextIndex('nizam_guest_host_index_v2', hosts.length);

        // Large line = personalized thank-you. SWAP the RSVP subtitle's font/style/color onto it.
        title.textContent=thankYouMessages[thankIndex].replace('{name}', safeName);
        title.style.fontFamily="'Cormorant Garamond', serif";
        title.style.fontStyle='normal';
        title.style.fontWeight='600';
        title.style.color='var(--cream)';
        title.style.fontSize='clamp(30px, 5vw, 48px)';
        title.style.maxWidth='92vw';
        title.style.marginLeft='auto';
        title.style.marginRight='auto';
        title.style.lineHeight='1.15';
        title.style.overflowWrap='anywhere';

        // Smaller line = rotating host attribution. SWAP the RSVP title's font/style/color onto it.
        subtitle.textContent=hosts[hostIndex];
        subtitle.style.fontFamily="'Cinzel Decorative', serif";
        subtitle.style.fontStyle='normal';
        subtitle.style.fontWeight='400';
        subtitle.style.color='var(--gold)';
        subtitle.style.fontSize='clamp(18px, 2.2vw, 20px)';
        subtitle.style.maxWidth='90vw';
        subtitle.style.marginLeft='auto';
        subtitle.style.marginRight='auto';
        subtitle.style.lineHeight='1.2';
        subtitle.style.marginTop='12px';

        container.style.display='flex';
        window.launchFireworks();
    };
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

    // This UID is allowed to delete messages by the Firestore security rules.
    // It is an identifier, not a password or secret.
    const ADMIN_UID = "TyGIV4xQbESrne5q0FGWO7nqf022";

    let adminMode = false;
    let latestSnapshot = null;

    // Admin console handles authentication and controls.

    // Restore the admin session automatically when Firebase remembers the login.
    firebaseFunctions.onAuthStateChanged(firebaseAuth, (user) => {
        adminMode = !!user && user.uid === ADMIN_UID;
        renderMessages(latestSnapshot);
    });

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
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent.trim() : 'SHARE YOUR BLESSINGS ✦';

        if (!name || !message) return;

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'SUBMITTING YOUR MESSAGE';
            submitButton.style.opacity = '0.72';
            submitButton.style.cursor = 'wait';
        }

        try {

            await firebaseFunctions.addDoc(
                firebaseFunctions.collection(
                    firebaseDB,
                    "messages"
                ),
                {
                    name,
                    message,
                    hidden: false,
                    approved: true,
                    timestamp: firebaseFunctions.serverTimestamp()
                }
            );

            form.reset();
            charCount.textContent =
                '0 / 300 characters';
            if (typeof window.showGuestMessageCelebration === 'function') {
                window.showGuestMessageCelebration(name);
            }

        } catch (err) {

            console.error(err);

            const notice = document.createElement('p');
            notice.textContent = 'We could not send your message. Please check your connection and try again.';
            notice.style.cssText = 'margin-top:12px;color:#f2a2a2;font-size:13px;';
            form.appendChild(notice);
            setTimeout(() => notice.remove(), 3500);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                submitButton.style.opacity = '';
                submitButton.style.cursor = 'pointer';
            }
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

    function timeAgo(timestamp) {

        if (!timestamp) return "Just now";

        const date =
            timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);

        const diff =
            Date.now() - date.getTime();

        const mins =
            Math.floor(diff / 60000);

        const hours =
            Math.floor(diff / 3600000);

        const days =
            Math.floor(diff / 86400000);

        if (mins < 1) return "Just now";

        if (mins < 60)
            return mins + " min ago";

        if (hours < 24)
            return hours + " hour ago";

        if (days === 1)
            return "Yesterday";

        if (days < 30)
            return days + " days ago";

        return date.toLocaleDateString();
    }

    function renderMessages(snapshot) {
        if (!snapshot) return;

        listEl.innerHTML = '';

        if (snapshot.empty) {
            listEl.appendChild(noMsg);
            return;
        }

        snapshot.forEach((docSnap) => {

            const m = docSnap.data();
            const messageId = docSnap.id;
            if (!adminMode && m.hidden === true) return;

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

                <p style="
                    color:#FAF3E0;
                    line-height:1.6;
                ">
                    ${timeAgo(m.timestamp)}
                </p>
            `;

            if (adminMode) {
                const controls=document.createElement('div'); controls.className='message-admin-controls';
                const hideBtn=document.createElement('button'); hideBtn.className='admin-small-btn'; hideBtn.textContent=m.hidden?'Restore':'Hide';
                hideBtn.onclick=async()=>{try{await firebaseFunctions.updateDoc(firebaseFunctions.doc(firebaseDB,'messages',messageId),{hidden:!m.hidden});}catch(e){console.error(e);}};
                const delBtn=document.createElement('button'); delBtn.className='admin-danger-btn'; delBtn.textContent='Delete';
                delBtn.onclick=async()=>{if(!confirm('Permanently delete this message?'))return;try{await firebaseFunctions.deleteDoc(firebaseFunctions.doc(firebaseDB,'messages',messageId));}catch(e){console.error(e);}};
                controls.append(hideBtn,delBtn); card.appendChild(controls);
            }

            listEl.appendChild(card);
        });
    }

    firebaseFunctions.onSnapshot(
        q,
        (snapshot) => {
            latestSnapshot = snapshot;
            renderMessages(snapshot);
        },
        (error) => {
            console.error("Guest messages listener failed:", error);
            listEl.innerHTML = '';
            const errorEl = document.createElement('p');
            errorEl.textContent = 'Unable to load guest messages right now.';
            errorEl.style.cssText = 'color:#FAF3E0; text-align:center;';
            listEl.appendChild(errorEl);
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



// ═══════════ LIVE VISITOR COUNTER ═══════════
(function(){
    const display = document.getElementById('visitor-count');
    const adminCurrent = document.getElementById('admin-visitor-current');
    const adminActual = document.getElementById('admin-visitor-actual');
    const adminInput = document.getElementById('admin-visitor-count');
    const adminSet = document.getElementById('admin-visitor-set');
    const adminReset = document.getElementById('admin-visitor-reset');
    const adminStatus = document.getElementById('admin-visitor-status');
    if (!display || !window.firebaseDB || !window.firebaseFunctions) return;

    const counterRef = firebaseFunctions.doc(firebaseDB, 'siteStats', 'visitorCounter');
    const ADMIN_UID = 'TyGIV4xQbESrne5q0FGWO7nqf022';
    let currentValue = null;

    function cleanCount(value){
        const n = Number(value);
        return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    }

    function renderCount(value, animate = true){
        const next = String(cleanCount(value));
        const previous = currentValue === null ? null : String(cleanCount(currentValue));
        if (previous === next && display.dataset.value === next) {
            if (adminCurrent) adminCurrent.textContent = next;
            return;
        }

        const maxLen = Math.max(previous?.length || 0, next.length, 1);
        const oldPadded = (previous ?? '').padStart(maxLen, ' ');
        const nextPadded = next.padStart(maxLen, ' ');

        display.innerHTML = '';
        display.dataset.value = next;
        display.setAttribute('aria-label', `${next} visitors`);

        [...nextPadded].forEach((digit, index) => {
            const oldDigit = oldPadded[index] || ' ';
            const slot = document.createElement('span');
            slot.className = 'visitor-digit-slot';

            if (!animate || previous === null || oldDigit === digit) {
                const staticDigit = document.createElement('span');
                staticDigit.className = 'visitor-digit-static';
                staticDigit.textContent = digit === ' ' ? '' : digit;
                slot.appendChild(staticDigit);
            } else {
                const oldEl = document.createElement('span');
                oldEl.className = 'visitor-digit-old';
                oldEl.textContent = oldDigit === ' ' ? '' : oldDigit;

                const newEl = document.createElement('span');
                newEl.className = 'visitor-digit-new';
                newEl.textContent = digit === ' ' ? '' : digit;

                slot.append(oldEl, newEl);
                requestAnimationFrame(() => slot.classList.add('is-rolling'));
            }

            display.appendChild(slot);
        });

        currentValue = cleanCount(value);
        if (adminCurrent) adminCurrent.textContent = String(currentValue);
    }

    function setAdminStatus(message, type){
        if (!adminStatus) return;
        adminStatus.textContent = message || '';
        adminStatus.className = 'admin-visitor-status' + (type ? ` ${type}` : '');
    }

    firebaseFunctions.onSnapshot(counterRef, (snap) => {
        const value = snap.exists() ? cleanCount(snap.data().count) : 0;
        const actual = snap.exists() ? cleanCount(snap.data().actualCount ?? value) : 0;
        renderCount(value, currentValue !== null);
        if (adminActual) adminActual.textContent = String(actual);
    }, (error) => {
        console.error('Visitor counter listener failed:', error);
    });

    async function incrementForVisitor(){
        try {
            if (sessionStorage.getItem('nizam_visitor_counted') === '1') return;
        } catch (_) {}

        try {
            await firebaseFunctions.runTransaction(firebaseDB, async (tx) => {
                const snap = await tx.get(counterRef);
                const current = snap.exists() ? cleanCount(snap.data().count) : 0;
                const actual = snap.exists() ? cleanCount(snap.data().actualCount ?? current) : 0;
                tx.set(counterRef, {
                    count: current + 1,
                    actualCount: actual + 1,
                    updatedAt: firebaseFunctions.serverTimestamp()
                }, { merge: true });
            });

            try { sessionStorage.setItem('nizam_visitor_counted', '1'); } catch (_) {}
        } catch (error) {
            console.error('Visitor counter update failed:', error);
        }
    }

    async function setAdminCount(value){
        const user = firebaseAuth?.currentUser;
        if (!user || user.uid !== ADMIN_UID) {
            setAdminStatus('Admin authentication required.', 'error');
            return;
        }

        const count = cleanCount(value);
        setAdminStatus('Updating…', 'loading');
        if (adminSet) adminSet.disabled = true;
        if (adminReset) adminReset.disabled = true;

        try {
            await firebaseFunctions.runTransaction(firebaseDB, async (tx) => {
                tx.set(counterRef, {
                    count,
                    updatedAt: firebaseFunctions.serverTimestamp()
                }, { merge: true });
            });
            setAdminStatus(`Live count set to ${count}.`, 'success');
        } catch (error) {
            console.error('Admin visitor count update failed:', error);
            setAdminStatus('Could not update the visitor count.', 'error');
        } finally {
            if (adminSet) adminSet.disabled = false;
            if (adminReset) adminReset.disabled = false;
        }
    }

    adminSet?.addEventListener('click', () => {
        if (!adminInput?.value.trim()) {
            setAdminStatus('Enter a count first.', 'error');
            return;
        }
        setAdminCount(adminInput.value);
    });

    adminInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') adminSet?.click();
    });

    adminReset?.addEventListener('click', () => {
        if (confirm('Reset the live visitor count to 0?')) setAdminCount(0);
    });

    firebaseFunctions.onAuthStateChanged(firebaseAuth, (user) => {
        const isAdmin = user?.uid === ADMIN_UID;
        if (!isAdmin && adminStatus) setAdminStatus('');
    });

    incrementForVisitor();
})();

// ═══════════ PREMIUM ADMIN CONSOLE ═══════════
(function(){const el=document.getElementById('admin-console');if(!el)return;const login=document.getElementById('admin-login-view'),dash=document.getElementById('admin-dashboard-view'),email=document.getElementById('admin-email'),pass=document.getElementById('admin-password'),err=document.getElementById('admin-login-error'),stats=document.getElementById('admin-stats'),ml=document.getElementById('admin-messages-list'),rl=document.getElementById('admin-rsvps-list');const UID='TyGIV4xQbESrne5q0FGWO7nqf022';let messages=[],rsvps=[];function open(){el.classList.add('open');el.setAttribute('aria-hidden','false');setTimeout(()=>email?.focus(),50)}function close(){el.classList.remove('open');el.setAttribute('aria-hidden','true')}document.querySelectorAll('[data-admin-close]').forEach(x=>x.onclick=close);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});function auth(user){const ok=user?.uid===UID;login.hidden=ok;dash.hidden=!ok;document.getElementById('admin-auth-state').textContent=ok?'Authenticated admin':'Signed out';if(ok)load()}document.getElementById('admin-login-btn')?.addEventListener('click',async()=>{err.textContent='';try{const c=await firebaseFunctions.signInWithEmailAndPassword(firebaseAuth,email.value.trim(),pass.value);if(c.user.uid!==UID){await firebaseFunctions.signOut(firebaseAuth);throw 0}pass.value=''}catch(e){err.textContent='Sign in failed. Check your admin account.'}});pass?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('admin-login-btn').click()});document.getElementById('admin-logout-btn')?.addEventListener('click',()=>firebaseFunctions.signOut(firebaseAuth));const t=document.getElementById('guest-messages-title');let n=0,tm;t?.addEventListener('click',()=>{n++;clearTimeout(tm);tm=setTimeout(()=>n=0,1500);if(n>=5){n=0;open()}});firebaseFunctions.onAuthStateChanged(firebaseAuth,auth);function dt(x){return x?.toDate?x.toDate():new Date(x||0)}function esc(x){const d=document.createElement('div');d.textContent=String(x??'');return d.innerHTML}function load(){const mq=firebaseFunctions.query(firebaseFunctions.collection(firebaseDB,'messages'),firebaseFunctions.orderBy('timestamp','desc'));firebaseFunctions.onSnapshot(mq,s=>{messages=s.docs.map(d=>({id:d.id,...d.data()}));renderM();renderS()});const rq=firebaseFunctions.query(firebaseFunctions.collection(firebaseDB,'rsvps'),firebaseFunctions.orderBy('timestamp','desc'));firebaseFunctions.onSnapshot(rq,s=>{rsvps=s.docs.map(d=>({id:d.id,...d.data()}));renderR();renderS()},()=>{rsvps=[];renderR()})}function renderS(){const d=new Date();d.setHours(0,0,0,0);const today=messages.filter(m=>dt(m.timestamp)>=d).length,confirmed=rsvps.filter(r=>r.status==='attending').length,declined=rsvps.filter(r=>r.status==='declined').length,guests=rsvps.filter(r=>r.status==='attending').reduce((a,r)=>a+(+r.guests||0),0);stats.innerHTML=`<div><b>${messages.length}</b><span>Total messages</span></div><div><b>${today}</b><span>Today's messages</span></div><div><b>${rsvps.length}</b><span>Total RSVPs</span></div><div><b>${confirmed}</b><span>Confirmed</span></div><div><b>${declined}</b><span>Declined</span></div><div><b>${guests}</b><span>Guests</span></div>`; let ctl=document.getElementById('admin-invited-control'); if(!ctl){ctl=document.createElement('div');ctl.id='admin-invited-control';ctl.className='admin-invited-control';stats.after(ctl)} const invited=Number(localStorage.getItem('nizam_total_invited')||0); const pending=invited?Math.max(0,invited-confirmed-declined):'—'; ctl.innerHTML=`<label>Total invited <input id=admin-total-invited type=number min=0 value="${invited||''}" placeholder="Enter total invited"></label><span>Pending: <b>${pending}</b></span>`;document.getElementById('admin-total-invited')?.addEventListener('change',e=>{localStorage.setItem('nizam_total_invited',String(Math.max(0,Number(e.target.value)||0)));renderS()})}function renderM(){let q=(document.getElementById('admin-message-search')?.value||'').toLowerCase();let a=messages.filter(m=>(`${m.name||''} ${m.message||''}`).toLowerCase().includes(q));if(document.getElementById('admin-message-sort')?.value==='oldest')a.reverse();ml.innerHTML=a.map(m=>`<article class="admin-record ${m.hidden?'is-hidden':''}"><div><strong>${esc(m.name||'Guest')}</strong><small>${dt(m.timestamp).toLocaleString()}</small><p>${esc(m.message||'')}</p></div><div class="admin-record-actions"><button class="admin-small-btn" data-h="${m.id}">${m.hidden?'Restore':'Hide'}</button><button class="admin-danger-btn" data-d="${m.id}">Delete</button></div></article>`).join('')||'<p class="admin-muted">No messages found.</p>';ml.querySelectorAll('[data-h]').forEach(b=>b.onclick=async()=>{const m=messages.find(x=>x.id===b.dataset.h);if(m)await firebaseFunctions.updateDoc(firebaseFunctions.doc(firebaseDB,'messages',m.id),{hidden:!m.hidden})});ml.querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{if(confirm('Permanently delete this message?'))await firebaseFunctions.deleteDoc(firebaseFunctions.doc(firebaseDB,'messages',b.dataset.d))})}function renderR(){let q=(document.getElementById('admin-rsvp-search')?.value||'').toLowerCase(),f=document.getElementById('admin-rsvp-filter')?.value||'all';let a=rsvps.filter(r=>(f==='all'||r.status===f)&&(`${r.name||''} ${r.attendance||''}`).toLowerCase().includes(q));rl.innerHTML=a.map(r=>`<article class="admin-record"><div><strong>${esc(r.name||'Guest')}</strong><small>${dt(r.timestamp).toLocaleString()}</small><p>${esc(r.status||'pending')} • ${+r.guests||0} guest(s) • ${esc(r.attendance||'')}</p>${r.message?`<p>“${esc(r.message)}”</p>`:''}</div><button class="admin-danger-btn" data-rd="${r.id}">Delete</button></article>`).join('')||'<p class="admin-muted">No RSVPs found.</p>';rl.querySelectorAll('[data-rd]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this RSVP?'))await firebaseFunctions.deleteDoc(firebaseFunctions.doc(firebaseDB,'rsvps',b.dataset.rd))})}document.getElementById('admin-message-search')?.addEventListener('input',renderM);document.getElementById('admin-message-sort')?.addEventListener('change',renderM);document.getElementById('admin-rsvp-search')?.addEventListener('input',renderR);document.getElementById('admin-rsvp-filter')?.addEventListener('change',renderR);document.querySelectorAll('[data-admin-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-admin-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');const r=b.dataset.adminTab==='rsvps';document.getElementById('admin-messages-view').hidden=r;document.getElementById('admin-rsvps-view').hidden=!r});document.getElementById('admin-export-rsvps')?.addEventListener('click',()=>{const cols=['name','guests','status','attendance','message','timestamp'],csv=[cols.join(','),...rsvps.map(r=>cols.map(c=>`"${String(c==='timestamp'?dt(r[c]).toISOString():r[c]??'').replace(/"/g,'""')}"`).join(','))].join('\n'),blob=new Blob([csv],{type:'text/csv'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='nizams-rsvps.csv';a.click();URL.revokeObjectURL(u)});})();



// ═══════════ FAMILY GALLERY LIGHTBOX — ZOOM / PAN / NAVIGATION ═══════════
(function(){
 const box=document.getElementById('gallery-lightbox');
 const im=document.getElementById('gallery-lightbox-image');
 const cap=document.getElementById('gallery-lightbox-caption');
 const gallery=document.getElementById('family-gallery-section');
 if(!box||!im||!gallery)return;
 const stage=box.querySelector('.lightbox-image-stage');
 const items=Array.from(gallery.querySelectorAll('.gallery-grid img')).filter(img=>img.closest('.gallery-item'));
 const closeBtn=document.getElementById('gallery-close');
 const prevBtn=document.getElementById('gallery-prev');
 const nextBtn=document.getElementById('gallery-next');
 const zoomIn=document.getElementById('gallery-zoom-in');
 const zoomOut=document.getElementById('gallery-zoom-out');
 const zoomReset=document.getElementById('gallery-zoom-reset');
 let index=0,scale=1,tx=0,ty=0,points=new Map(),pinch=null,drag=null,swipe=null,lastTap=0;
 const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
 const isOpen=()=>box.classList.contains('open');
 function paint(){im.style.transform=`translate3d(${tx}px,${ty}px,0) scale(${scale})`;box.classList.toggle('zoomed',scale>1.01);if(stage)stage.style.cursor=scale>1?'grab':'default'}
 function reset(){scale=1;tx=0;ty=0;paint()}
 function boundPan(){
   const r=im.getBoundingClientRect(), br=box.getBoundingClientRect();
   const maxX=Math.max(0,(r.width-im.offsetWidth)/2),maxY=Math.max(0,(r.height-im.offsetHeight)/2);
   tx=clamp(tx,-maxX,maxX);ty=clamp(ty,-maxY,maxY);
 }
 function setScale(next,anchorX,anchorY){
   const old=scale,ns=clamp(next,1,5);
   if(ns===old)return;
   if(anchorX!=null&&anchorY!=null&&old>0){
     const rect=im.getBoundingClientRect(),cx=anchorX-(rect.left+rect.width/2),cy=anchorY-(rect.top+rect.height/2);
     tx-=(cx/old)*(ns-old);ty-=(cy/old)*(ns-old);
   }
   scale=ns;if(scale===1){tx=0;ty=0}else boundPan();paint();
 }
 function show(n){
   if(!items.length)return;
   index=(n+items.length)%items.length;
   const item=items[index];im.src=item.currentSrc||item.src;im.alt=item.alt||'Family gallery photo';
   if(cap)cap.textContent=item.alt||`Photo ${index+1} of ${items.length}`;
   reset();box.classList.add('open');box.setAttribute('aria-hidden','false');
   document.body.style.overflow='hidden';
 }
 function close(){
   box.classList.remove('open');box.setAttribute('aria-hidden','true');
   document.body.style.overflow='';reset();points.clear();pinch=null;drag=null;swipe=null;
 }
 items.forEach((img,n)=>{
   const target=img.closest('.gallery-item')||img.parentElement;
   target.style.cursor='zoom-in';
   target.addEventListener('click',e=>{if(e.target.closest('a'))e.preventDefault();show(n)});
 });
 // Explicit, independent handlers ensure all controls remain clickable above the image stage.
 if(closeBtn)closeBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();close()});
 if(prevBtn)prevBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(index-1)});
 if(nextBtn)nextBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(index+1)});
 if(zoomIn)zoomIn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setScale(scale+.5)});
 if(zoomOut)zoomOut.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setScale(scale-.5)});
 if(zoomReset)zoomReset.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();reset()});
 box.addEventListener('click',e=>{if(e.target===box)close()});
 document.addEventListener('keydown',e=>{
   if(!isOpen())return;
   if(e.key==='Escape')close();
   else if(e.key==='ArrowLeft')show(index-1);
   else if(e.key==='ArrowRight')show(index+1);
   else if(e.key==='+'||e.key==='=')setScale(scale+.5);
   else if(e.key==='-')setScale(scale-.5);
   else if(e.key==='0')reset();
 });
 // Mouse wheel zoom (desktop), zooming around the pointer.
 box.addEventListener('wheel',e=>{
   if(!isOpen())return;
   e.preventDefault();setScale(scale+(e.deltaY<0?.18:-.18),e.clientX,e.clientY);
 },{passive:false});
 if(stage){
   stage.style.touchAction='none';
   stage.addEventListener('pointerdown',e=>{
     if(e.target.closest('button'))return;
     e.preventDefault();stage.setPointerCapture?.(e.pointerId);
     points.set(e.pointerId,{x:e.clientX,y:e.clientY});
     if(points.size===1){drag={x:e.clientX,y:e.clientY,tx,ty,moved:false};swipe={x:e.clientX,y:e.clientY};}
     else if(points.size===2){
       const a=Array.from(points.values());pinch={distance:Math.max(1,Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)),scale};
       drag=null;swipe=null;
     }
   });
   stage.addEventListener('pointermove',e=>{
     if(!points.has(e.pointerId))return;
     e.preventDefault();points.set(e.pointerId,{x:e.clientX,y:e.clientY});
     if(points.size>=2&&pinch){
       const a=Array.from(points.values()),d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
       setScale(pinch.scale*d/pinch.distance);return;
     }
     if(drag){
       const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
       if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;
       if(scale>1){tx=drag.tx+dx;ty=drag.ty+dy;boundPan();paint();}
     }
   });
   function finish(e){
     const start=swipe;points.delete(e.pointerId);
     if(points.size<2)pinch=null;
     if(points.size===0){
       if(start&&scale===1){
         const dx=e.clientX-start.x,dy=e.clientY-start.y;
         if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25)show(index+(dx<0?1:-1));
         else if(Math.abs(dx)<10&&Math.abs(dy)<10){
           const now=Date.now();if(now-lastTap<300){setScale(scale===1?2.5:1,e.clientX,e.clientY);lastTap=0}else lastTap=now;
         }
       }
       drag=null;swipe=null;
     }
   }
   stage.addEventListener('pointerup',finish);stage.addEventListener('pointercancel',finish);
   stage.addEventListener('lostpointercapture',e=>{points.delete(e.pointerId);if(points.size<2)pinch=null;if(!points.size){drag=null;swipe=null}});
   stage.addEventListener('dblclick',e=>{e.preventDefault();setScale(scale===1?2.5:1,e.clientX,e.clientY)});
 }
})();


// ═══════════ EVENT INTERACTIONS / PERFORMANCE ═══════════
(function(){document.querySelectorAll('.ceremony-deck').forEach(c=>{c.tabIndex=0;c.classList.add('event-interactive');c.addEventListener('click',e=>{if(!e.target.closest('a,button'))c.classList.toggle('expanded')});c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();c.classList.toggle('expanded')}})});document.querySelectorAll('img:not([loading])').forEach(i=>i.loading='lazy')})();

// ═══════════ OFFLINE / ONLINE STATUS ═══════════
(function(){
 const b=document.getElementById('network-status-banner'); if(!b)return;
 function set(){if(navigator.onLine){b.textContent='Back online';b.classList.add('show');setTimeout(()=>b.classList.remove('show'),2200)}else{b.textContent='You are offline — submissions will not be sent until connection returns.';b.classList.add('show')}}
 window.addEventListener('offline',set);window.addEventListener('online',set);
})();

// ═══════════ ADD-TO-CALENDAR BUTTONS ═══════════
(function(){
 const events=[
  {title:'Nikah Ceremony — Lakshma Reddy Gardens',start:'20251218T173000',end:'20251218T203000',location:'Lakshma Reddy Gardens, Hyderabad'},
  {title:'Nikah Ceremony — Minarva Gardens',start:'20251221T180000',end:'20251221T210000',location:'Minarva Gardens, Hyderabad'},
  {title:'Valima Reception — MNR Gardens',start:'20251223T193000',end:'20251223T230000',location:'MNR Gardens, Champapet, Hyderabad'}
 ];
 document.querySelectorAll('.ceremony-deck').forEach((card,i)=>{const ev=events[i];if(!ev||card.querySelector('.calendar-btn'))return;const b=document.createElement('button');b.type='button';b.className='calendar-btn';b.textContent='ADD TO CALENDAR';b.addEventListener('click',()=>{const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nizams Wedding//EN','BEGIN:VEVENT',`DTSTART:${ev.start}`,`DTEND:${ev.end}`,`SUMMARY:${ev.title}`,`LOCATION:${ev.location}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=ev.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.ics';a.click();URL.revokeObjectURL(u)});const footer=card.querySelector('.ceremony-footer')||card.querySelector('div:last-child');footer?.appendChild(b)});
})();
