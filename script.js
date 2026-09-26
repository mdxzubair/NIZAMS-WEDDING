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
async function saveRSVP(data){ return firebaseFunctions.addDoc(firebaseFunctions.collection(firebaseDB,'rsvps'),{name:data.name,phone:data.phone,guests:data.guests,attendance:data.attendance,status:data.status,message:data.message,timestamp:firebaseFunctions.serverTimestamp()}); }
function showRSVPSuccess(){const c=document.getElementById('fireworks-container');if(c){c.style.display='flex';launchFireworks();}}
window.submitRSVP=async function(){
 const form=document.getElementById('rsvp-form'); if(!form)return;
 const name=document.getElementById('rsvp-name')?.value.trim(), phone=document.getElementById('rsvp-phone')?.value.trim(), guests=Number(document.getElementById('rsvp-guests')?.value||1), status=document.getElementById('rsvp-status')?.value||'attending', attendance=document.getElementById('rsvp-attendance')?.value||'Attending All Events', message=document.getElementById('rsvp-message')?.value.trim()||'', button=document.getElementById('rsvp-submit');
 const honeypot=document.getElementById('rsvp-website')?.value.trim(); const last=Number(localStorage.getItem('nizam_rsvp_last_submit')||0); if(honeypot)return; if(Date.now()-last<15000)return setRSVPStatus('Please wait a few seconds before submitting again.','error'); if(!navigator.onLine)return setRSVPStatus('You appear to be offline. Please reconnect and try again.','error');
 if(!name||name.length<2)return setRSVPStatus('Please enter your full name.','error'); if(!phone||phone.length<5)return setRSVPStatus('Please enter a valid phone number.','error'); if(!Number.isInteger(guests)||guests<1||guests>10)return setRSVPStatus('Please select a valid guest count.','error'); if(message.length>300)return setRSVPStatus('Your message is too long.','error');
 if(button){button.disabled=true;button.textContent='SENDING…';} setRSVPStatus('Saving your RSVP securely…','loading');
 const payload={name,phone,guests,status,attendance,message};
 try{ await saveRSVP(payload); localStorage.setItem('nizam_rsvp_last_submit',String(Date.now())); let emailResult={skipped:true}; try{emailResult=await sendRSVPEmail(payload);}catch(e){console.warn('RSVP email notification failed:',e);} form.reset();document.getElementById('rsvp-guests').value='1';document.getElementById('rsvp-status').value='attending';document.getElementById('rsvp-attendance').value='Attending All Events';setRSVPStatus(emailResult.sent?'RSVP received. Notification sent.':'RSVP received successfully.','success');showRSVPSuccess(); }
 catch(e){console.error('RSVP submission failed:',e);setRSVPStatus('We could not save your RSVP. Please check your connection and try again.','error');}
 finally{if(button){button.disabled=false;button.textContent='ACCEPT WITH BLESSINGS';}}
};
(function(){const f=document.getElementById('rsvp-form');if(f)f.addEventListener('submit',e=>{e.preventDefault();window.submitRSVP();});})();
function closeFireworks(){document.getElementById('fireworks-container').style.display='none';if(window._fwInt)clearInterval(window._fwInt);} window.closeFireworks=closeFireworks;
function launchFireworks(){const canvas=document.getElementById('fireworks-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');canvas.width=innerWidth;canvas.height=innerHeight;let sparks=[];const colors=['#C9A84C','#E8C97A','#FAF3E0','#8B6914','#FFFFFF','#1A5C45'];function burst(x,y){for(let i=0;i<80;i++){const a=Math.random()*Math.PI*2,sp=Math.random()*6+1.5;sparks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:Math.random()*60+50,color:colors[Math.floor(Math.random()*colors.length)],size:Math.random()*3+1.5});}}for(let i=0;i<5;i++)setTimeout(()=>burst(canvas.width*.15+Math.random()*canvas.width*.7,canvas.height*.15+Math.random()*canvas.height*.45),i*350);if(window._fwInt)clearInterval(window._fwInt);window._fwInt=setInterval(()=>{ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(0,0,canvas.width,canvas.height);sparks=sparks.filter(s=>s.life>0);sparks.forEach(s=>{s.x+=s.vx;s.y+=s.vy;s.vy+=.04;s.vx*=.99;s.life--;ctx.globalAlpha=Math.max(0,s.life/100);ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(s.x,s.y,s.size,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;if(!sparks.length){clearInterval(window._fwInt);ctx.clearRect(0,0,canvas.width,canvas.height);}},16);}

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
                    hidden: false,
                    approved: true,
                    timestamp: firebaseFunctions.serverTimestamp()
                }
            );

            form.reset();
            charCount.textContent =
                '0 / 300 characters';

        } catch (err) {

            console.error(err);

            const notice = document.createElement('p');
            notice.textContent = 'We could not send your message. Please check your connection and try again.';
            notice.style.cssText = 'margin-top:12px;color:#f2a2a2;font-size:13px;';
            form.appendChild(notice);
            setTimeout(() => notice.remove(), 3500);
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


// ═══════════ PREMIUM ADMIN CONSOLE ═══════════
(function(){const el=document.getElementById('admin-console');if(!el)return;const login=document.getElementById('admin-login-view'),dash=document.getElementById('admin-dashboard-view'),email=document.getElementById('admin-email'),pass=document.getElementById('admin-password'),err=document.getElementById('admin-login-error'),stats=document.getElementById('admin-stats'),ml=document.getElementById('admin-messages-list'),rl=document.getElementById('admin-rsvps-list');const UID='TyGIV4xQbESrne5q0FGWO7nqf022';let messages=[],rsvps=[];function open(){el.classList.add('open');el.setAttribute('aria-hidden','false');setTimeout(()=>email?.focus(),50)}function close(){el.classList.remove('open');el.setAttribute('aria-hidden','true')}document.querySelectorAll('[data-admin-close]').forEach(x=>x.onclick=close);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});function auth(user){const ok=user?.uid===UID;login.hidden=ok;dash.hidden=!ok;document.getElementById('admin-auth-state').textContent=ok?'Authenticated admin':'Signed out';if(ok)load()}document.getElementById('admin-login-btn')?.addEventListener('click',async()=>{err.textContent='';try{const c=await firebaseFunctions.signInWithEmailAndPassword(firebaseAuth,email.value.trim(),pass.value);if(c.user.uid!==UID){await firebaseFunctions.signOut(firebaseAuth);throw 0}pass.value=''}catch(e){err.textContent='Sign in failed. Check your admin account.'}});pass?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('admin-login-btn').click()});document.getElementById('admin-logout-btn')?.addEventListener('click',()=>firebaseFunctions.signOut(firebaseAuth));const t=document.getElementById('guest-messages-title');let n=0,tm;t?.addEventListener('click',()=>{n++;clearTimeout(tm);tm=setTimeout(()=>n=0,1500);if(n>=5){n=0;open()}});firebaseFunctions.onAuthStateChanged(firebaseAuth,auth);function dt(x){return x?.toDate?x.toDate():new Date(x||0)}function esc(x){const d=document.createElement('div');d.textContent=String(x??'');return d.innerHTML}function load(){const mq=firebaseFunctions.query(firebaseFunctions.collection(firebaseDB,'messages'),firebaseFunctions.orderBy('timestamp','desc'));firebaseFunctions.onSnapshot(mq,s=>{messages=s.docs.map(d=>({id:d.id,...d.data()}));renderM();renderS()});const rq=firebaseFunctions.query(firebaseFunctions.collection(firebaseDB,'rsvps'),firebaseFunctions.orderBy('timestamp','desc'));firebaseFunctions.onSnapshot(rq,s=>{rsvps=s.docs.map(d=>({id:d.id,...d.data()}));renderR();renderS()},()=>{rsvps=[];renderR()})}function renderS(){const d=new Date();d.setHours(0,0,0,0);const today=messages.filter(m=>dt(m.timestamp)>=d).length,confirmed=rsvps.filter(r=>r.status==='attending').length,declined=rsvps.filter(r=>r.status==='declined').length,guests=rsvps.filter(r=>r.status==='attending').reduce((a,r)=>a+(+r.guests||0),0);stats.innerHTML=`<div><b>${messages.length}</b><span>Total messages</span></div><div><b>${today}</b><span>Today's messages</span></div><div><b>${rsvps.length}</b><span>Total RSVPs</span></div><div><b>${confirmed}</b><span>Confirmed</span></div><div><b>${declined}</b><span>Declined</span></div><div><b>${guests}</b><span>Guests</span></div>`; let ctl=document.getElementById('admin-invited-control'); if(!ctl){ctl=document.createElement('div');ctl.id='admin-invited-control';ctl.className='admin-invited-control';stats.after(ctl)} const invited=Number(localStorage.getItem('nizam_total_invited')||0); const pending=invited?Math.max(0,invited-confirmed-declined):'—'; ctl.innerHTML=`<label>Total invited <input id=admin-total-invited type=number min=0 value="${invited||''}" placeholder="Enter total invited"></label><span>Pending: <b>${pending}</b></span>`;document.getElementById('admin-total-invited')?.addEventListener('change',e=>{localStorage.setItem('nizam_total_invited',String(Math.max(0,Number(e.target.value)||0)));renderS()})}function renderM(){let q=(document.getElementById('admin-message-search')?.value||'').toLowerCase();let a=messages.filter(m=>(`${m.name||''} ${m.message||''}`).toLowerCase().includes(q));if(document.getElementById('admin-message-sort')?.value==='oldest')a.reverse();ml.innerHTML=a.map(m=>`<article class="admin-record ${m.hidden?'is-hidden':''}"><div><strong>${esc(m.name||'Guest')}</strong><small>${dt(m.timestamp).toLocaleString()}</small><p>${esc(m.message||'')}</p></div><div class="admin-record-actions"><button class="admin-small-btn" data-h="${m.id}">${m.hidden?'Restore':'Hide'}</button><button class="admin-danger-btn" data-d="${m.id}">Delete</button></div></article>`).join('')||'<p class="admin-muted">No messages found.</p>';ml.querySelectorAll('[data-h]').forEach(b=>b.onclick=async()=>{const m=messages.find(x=>x.id===b.dataset.h);if(m)await firebaseFunctions.updateDoc(firebaseFunctions.doc(firebaseDB,'messages',m.id),{hidden:!m.hidden})});ml.querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{if(confirm('Permanently delete this message?'))await firebaseFunctions.deleteDoc(firebaseFunctions.doc(firebaseDB,'messages',b.dataset.d))})}function renderR(){let q=(document.getElementById('admin-rsvp-search')?.value||'').toLowerCase(),f=document.getElementById('admin-rsvp-filter')?.value||'all';let a=rsvps.filter(r=>(f==='all'||r.status===f)&&(`${r.name||''} ${r.phone||''} ${r.attendance||''}`).toLowerCase().includes(q));rl.innerHTML=a.map(r=>`<article class="admin-record"><div><strong>${esc(r.name||'Guest')}</strong><small>${dt(r.timestamp).toLocaleString()}</small><p>${esc(r.status||'pending')} • ${+r.guests||0} guest(s) • ${esc(r.attendance||'')}</p><p>${esc(r.phone||'')}</p>${r.message?`<p>“${esc(r.message)}”</p>`:''}</div><button class="admin-danger-btn" data-rd="${r.id}">Delete</button></article>`).join('')||'<p class="admin-muted">No RSVPs found.</p>';rl.querySelectorAll('[data-rd]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this RSVP?'))await firebaseFunctions.deleteDoc(firebaseFunctions.doc(firebaseDB,'rsvps',b.dataset.rd))})}document.getElementById('admin-message-search')?.addEventListener('input',renderM);document.getElementById('admin-message-sort')?.addEventListener('change',renderM);document.getElementById('admin-rsvp-search')?.addEventListener('input',renderR);document.getElementById('admin-rsvp-filter')?.addEventListener('change',renderR);document.querySelectorAll('[data-admin-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-admin-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');const r=b.dataset.adminTab==='rsvps';document.getElementById('admin-messages-view').hidden=r;document.getElementById('admin-rsvps-view').hidden=!r});document.getElementById('admin-export-rsvps')?.addEventListener('click',()=>{const cols=['name','phone','guests','status','attendance','message','timestamp'],csv=[cols.join(','),...rsvps.map(r=>cols.map(c=>`"${String(c==='timestamp'?dt(r[c]).toISOString():r[c]??'').replace(/"/g,'""')}"`).join(','))].join('\n'),blob=new Blob([csv],{type:'text/csv'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='nizams-rsvps.csv';a.click();URL.revokeObjectURL(u)});})();

// ═══════════ GALLERY LIGHTBOX ═══════════
(function(){const box=document.getElementById('gallery-lightbox'),im=document.getElementById('gallery-lightbox-image'),cap=document.getElementById('gallery-lightbox-caption');if(!box)return;const items=[...document.querySelectorAll('.gallery-item img')];let i=0,x=0;function show(n){i=(n+items.length)%items.length;const e=items[i];im.src=e.currentSrc||e.src;im.alt=e.alt||'';cap.textContent=e.alt||'';box.classList.add('open');box.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}function close(){box.classList.remove('open');box.setAttribute('aria-hidden','true');document.body.style.overflow=''}items.forEach((e,n)=>e.parentElement.addEventListener('click',()=>show(n)));document.getElementById('gallery-close')?.addEventListener('click',close);document.getElementById('gallery-prev')?.addEventListener('click',()=>show(i-1));document.getElementById('gallery-next')?.addEventListener('click',()=>show(i+1));document.addEventListener('keydown',e=>{if(!box.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)});box.addEventListener('click',e=>{if(e.target===box)close()});im.addEventListener('touchstart',e=>x=e.changedTouches[0].clientX,{passive:true});im.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-x;if(Math.abs(d)>45)show(i+(d<0?1:-1))},{passive:true})})();

// ═══════════ EVENT INTERACTIONS / PERFORMANCE ═══════════
(function(){document.querySelectorAll('.ceremony-deck').forEach(c=>{c.tabIndex=0;c.classList.add('event-interactive');c.addEventListener('click',e=>{if(!e.target.closest('a,button'))c.classList.toggle('expanded')});c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();c.classList.toggle('expanded')}})});document.querySelectorAll('img:not([loading])').forEach(i=>i.loading='lazy')})();

// ═══════════ OFFLINE / ONLINE STATUS ═══════════
(function(){
 const b=document.getElementById('network-status-banner'); if(!b)return;
 function set(){if(navigator.onLine){b.textContent='Back online';b.classList.add('show');setTimeout(()=>b.classList.remove('show'),2200)}else{b.textContent='You are offline — submissions will not be sent until connection returns.';b.classList.add('show')}}
 window.addEventListener('offline',set);window.addEventListener('online',set);
})();

// ═══════════ AUDIO PREFERENCE + VOLUME CONTROL ═══════════
(function(){
 const a=document.getElementById('wedding-audio'),wrap=document.querySelector('.floating-audio');if(!a||!wrap)return;
 const saved=Number(localStorage.getItem('nizam_wedding_volume'));if(Number.isFinite(saved)&&saved>=0&&saved<=1)a.volume=saved;else a.volume=.9;
 if(!wrap.querySelector('#audio-volume')){const r=document.createElement('input');r.id='audio-volume';r.type='range';r.min='0';r.max='1';r.step='.01';r.value=a.volume;r.setAttribute('aria-label','Music volume');r.style.cssText='width:72px;accent-color:var(--gold);cursor:pointer;';wrap.appendChild(r);r.addEventListener('input',()=>{a.volume=Number(r.value);localStorage.setItem('nizam_wedding_volume',r.value)});}
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
