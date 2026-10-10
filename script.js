// --- YOUTUBE PLAYER & UNMUTE LOGIC ---
let ytPlayer = null;
let isVideoMuted = true;

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('crt-iframe', {
        events: {
            'onReady': onPlayerReady
        }
    });
};

function onPlayerReady(event) {
    try {
        event.target.mute();
        event.target.playVideo();
    } catch (e) {
        console.warn("YouTube autoplay error:", e);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // --- PROCESAR EMBED DE INSTAGRAM ---
    if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
    }

    const tipBtn = document.getElementById("tip-btn");
    const toast = document.getElementById("cyber-toast");

    // --- FUNCIÓN COPIAR AL PORTAPAPELES (GORRA VIRTUAL) ---
    const copyAlias = "volandosiempre";

    if (tipBtn) {
        tipBtn.addEventListener("click", () => {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(copyAlias)
                    .then(() => showToast())
                    .catch(err => fallbackCopy(copyAlias));
            } else {
                fallbackCopy(copyAlias);
            }
        });
    }

    function fallbackCopy(text) {
        const tempInput = document.createElement("input");
        tempInput.value = text;
        tempInput.style.position = "fixed";
        tempInput.style.top = "0";
        tempInput.style.left = "0";

        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();

        try {
            document.execCommand("copy");
            showToast();
        } catch (err) {
            console.error("Fallback: El navegador no soporta copiado.", err);
        }
        document.body.removeChild(tempInput);
    }

    // --- MANEJO DEL TOAST ---
    let toastTimer;
    function showToast() {
        if (!toast) return;
        toast.classList.remove("toast-hidden");
        
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { 
            toast.classList.add("toast-hidden"); 
        }, 3500);
    }

    // --- CONTROL DE AUDIO Y BOTÓN DESMUTEAR ---
    const unmuteBtn = document.getElementById("unmute-btn");
    const unmuteIcon = document.getElementById("unmute-icon");
    const unmuteText = document.getElementById("unmute-text");
    const iframe = document.getElementById("crt-iframe");

    function sendIframeCommand(command, args = []) {
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: command,
                args: args
            }), '*');
        }
    }

    // Intento inicial para asegurar autoplay
    setTimeout(() => {
        sendIframeCommand('mute');
        sendIframeCommand('playVideo');
    }, 600);

    if (unmuteBtn) {
        unmuteBtn.addEventListener("click", () => {
            if (isVideoMuted) {
                // DESMUTEAR
                if (ytPlayer && typeof ytPlayer.unMute === 'function') {
                    ytPlayer.unMute();
                    ytPlayer.setVolume(100);
                    ytPlayer.playVideo();
                }
                sendIframeCommand('unMute');
                sendIframeCommand('setVolume', [100]);
                sendIframeCommand('playVideo');

                isVideoMuted = false;
                unmuteBtn.classList.add("is-unmuted");
                if (unmuteIcon) unmuteIcon.className = "fa-solid fa-volume-high";
                if (unmuteText) unmuteText.innerText = "MUTEAR";
            } else {
                // MUTEAR
                if (ytPlayer && typeof ytPlayer.mute === 'function') {
                    ytPlayer.mute();
                }
                sendIframeCommand('mute');

                isVideoMuted = true;
                unmuteBtn.classList.remove("is-unmuted");
                if (unmuteIcon) unmuteIcon.className = "fa-solid fa-volume-xmark";
                if (unmuteText) unmuteText.innerText = "DESMUTEAR";
            }
        });
    }
});
