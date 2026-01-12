const cvContent = `
# Michal Bubílek

## Career

### 2002 - present
private sector
Software Developer, Graphic Designer, Photographer, Web Developer

### 2007 - present
VOŠ, SPŠ a SOŠ Varnsdorf
Teacher of Specialized Subjects

### 2004 - 2007
ELNIKA plus s.r.o.
IT technician

## Education

### 2022
CISCO CCNA Lecturer

### 2013
Masaryk Institute of Advanced Studies - CTU in Prague
Teacher of Specialized Subjects (Bc.)

### 2003
Faculty of Electrical Engineering - CTU in Prague
Software Engineering (Ing.)

### 1997
Secondary Technical School in Varnsdorf
Electrical Computer Systems

## Hobbies

* 42
* Family
* Software development
* Sci-fi, Alien & Aliens, The Expanse
* Basketball, Motorcycles
* Archive, Klangphonics, M83, ROYA, Hans Zimmer, Jean-Michel Jarre
* Star Citizen
* Non-smoker
`;

const consoleOutput = document.getElementById('console-output');
const typingSpeed = 30; // ms per character
const linePause = 300; // ms pause at new line
let typingTimeout = null;

// System Event Config
const crewMembers = [
    "EXEC. OFFICER KANE",
    "ENG. TECH. BRETT",
    "CAPTAIN DALLAS",
    "SCIENCE OFFICER ASH",
    "CHIEF ENG. PARKER",
    "NAVIGATOR LAMBERT"
];
let crewDeathIndex = 0;

const hullMessages = [
    "WARNING: MICRO-FRACTURE DETECTED - DECK B",
    "SYSTEM ALERT: PRESSURE DROP IN SECTION 4",
    "MAINTENANCE: COOLING SYSTEM LEAK MODULE 3",
    "POWER FLUX DETECTED IN HYPERSLEEP CHAMBERS",
    "ENV-SYS: CO2 LEVELS RISING IN SECTOR 7",
    "WARNING: HULL INTEGRITY AT 94%"
];

const alienMessages = [
    "PRIORITY ALERT: UNIDENTIFIED ORGANISM DETECTED",
    "MOTION SENSOR: MOVEMENT IN AIR DUCTS - LEVEL 3",
    "SECURITY BREACH: CARGO BAY DOORS OPEN",
    "SPECIAL ORDER 937: INSURE RETURN OF ORGANISM. CREW EXPENDABLE."
];
let alienAlertTriggered = 0; // 0: none, 1: first warning, 2: full alert


// Simple Markdown Parser to HTML structure for typing
function parseMarkdown(text) {
    const lines = text.split('\n');
    const parsedLines = lines.map(line => {
        let type = 'p';
        let content = line;

        if (line.startsWith('# ')) {
            type = 'h1';
            content = line.substring(2);
        } else if (line.startsWith('## ')) {
            type = 'h2';
            content = line.substring(3);
        } else if (line.startsWith('### ')) {
            type = 'h3';
            content = line.substring(4);
        } else if (line.startsWith('* ')) {
            type = 'li';
            content = line.substring(2);
        } else if (line.trim() === '') {
            type = 'br';
            content = '';
        }

        // Handle bold and italic
        // Note: For typing effect, strict HTML nesting is tricky. 
        // We will simplify: formatting is applied to the whole line or regex replaced after typing?
        // Better: Pre-format the string with spans, but counting characters for typing is hard.
        // Alternative: Type raw text, then replace with HTML? No, looks jumpy.
        // Approach: Type the *visible* text character by character. If we hit a tag, append it instantly.

        // Let's preprocess bold/italic to HTML tags
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic

        return { type, content };
    });
    return parsedLines;
}

const parsedData = parseMarkdown(cvContent);

// Audio Elements
const bgMusic = document.getElementById('bg-music');
const typingSfx = document.getElementById('typing-sfx');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');

// Overlay Elements
const overlay = document.getElementById('overlay');
const terminal = document.getElementById('terminal');
const startBtn = document.getElementById('start-btn');

let isMuted = false;

// Audio Controls Logic
muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    typingSfx.muted = isMuted;
    muteBtn.textContent = isMuted ? '[UNMUTE]' : '[MUTE]';
});

volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value;
    bgMusic.volume = vol;
    typingSfx.volume = vol;
});

// Initialization Logic
startBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    terminal.classList.remove('hidden');

    // Start Audio
    bgMusic.play().catch(e => console.log("Audio play failed", e));

    // Start Typing
    typingTimeout = setTimeout(typeLine, 500);
});


let lineIndex = 0;
let charIndex = 0;
let currentContainer = null;
let currentHtmlContent = "";
let isTag = false;

function finishAnimationInstantly() {
    // Stop any pending typeLine
    if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
    }

    // Stop sound
    typingSfx.pause();
    typingSfx.currentTime = 0;

    // Finish current line if partially typed
    if (currentContainer && lineIndex < parsedData.length) {
        const data = parsedData[lineIndex];
        // If it was a list item, ensure bullet is there (simplest way is to rebuild content or append missing)
        // But since we are replacing innerHTML, we must be careful.
        // If type is 'li', we want '• ' + content.
        if (data.type === 'li') {
            currentContainer.innerHTML = '• ' + data.content;
        } else {
            currentContainer.innerHTML = data.content;
        }
        lineIndex++;
    }

    // Process remaining lines
    for (let i = lineIndex; i < parsedData.length; i++) {
        const data = parsedData[i];
        if (data.type === 'br') {
            const br = document.createElement('br');
            consoleOutput.appendChild(br);
        } else {
            const el = document.createElement(data.type === 'li' ? 'div' : data.type);
            if (data.type === 'li') {
                el.innerHTML = '• ' + data.content;
            } else {
                el.innerHTML = data.content;
            }
            consoleOutput.appendChild(el);
        }
    }

    // Mark as done
    lineIndex = parsedData.length;
    currentContainer = null;

    // Scroll to bottom
    consoleOutput.scrollTop = consoleOutput.scrollHeight;

    // Init Console immediately
    setTimeout(initConsoleInput, 200);
}

function typeLine() {
    if (lineIndex >= parsedData.length) {
        // End of transmission

        // Stop typing sound
        typingSfx.pause();
        typingSfx.currentTime = 0;

        // Init Console
        setTimeout(initConsoleInput, 1000);
        return;
    }

    // Play typing sound if not playing
    if (typingSfx.paused && !typingSfx.ended) {
        typingSfx.play().catch(e => { });
    }

    const lineData = parsedData[lineIndex];

    if (!currentContainer) {
        if (lineData.type === 'br') {
            const br = document.createElement('br');
            consoleOutput.appendChild(br);
            lineIndex++;
            // Pause sound briefly for new line
            typingSfx.pause();
            typingTimeout = setTimeout(() => {
                typeLine();
            }, linePause / 2);
            return;
        }

        currentContainer = document.createElement(lineData.type === 'li' ? 'div' : lineData.type);
        // Using div for LI to avoid UL wrapper complexity for simple typing
        if (lineData.type === 'li') currentContainer.innerHTML = '• '; // Add bullet manually

        consoleOutput.appendChild(currentContainer);
        currentHtmlContent = lineData.content;
        charIndex = 0;
    }

    // Typing logic capable of skipping HTML tags
    if (charIndex < currentHtmlContent.length) {
        let char = currentHtmlContent[charIndex];

        if (char === '<') {
            isTag = true;
        }

        if (isTag) {
            // Append explicit HTML until '>'
            let tagBuffer = "";
            while (charIndex < currentHtmlContent.length) {
                char = currentHtmlContent[charIndex];
                tagBuffer += char;
                charIndex++;
                if (char === '>') {
                    isTag = false;
                    break;
                }
            }
            currentContainer.innerHTML += tagBuffer;
            // Recursively call to avoid delay on tags
            typeLine();
        } else {
            currentContainer.innerHTML += char;
            charIndex++;
            // Scroll to bottom on every character to keep active line in view
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
            typingTimeout = setTimeout(typeLine, typingSpeed);
        }
    } else {
        // Line finished
        currentContainer = null;
        lineIndex++;

        // Pause sound at end of line
        typingSfx.pause();

        // Scroll to bottom
        consoleOutput.scrollTop = consoleOutput.scrollHeight;

        typingTimeout = setTimeout(typeLine, linePause);
    }
}

// Set initial volume
bgMusic.volume = 0.5;
typingSfx.volume = 0.5;

document.addEventListener('DOMContentLoaded', () => {
    initEmailProtection();
});

/* --- Email Protection --- */
function initEmailProtection() {
    const links = document.querySelectorAll('a[data-user][data-domain]');
    links.forEach(link => {
        const user = link.dataset.user;
        const domain = link.dataset.domain;
        const email = `${user}@${domain}`;

        link.addEventListener('mouseover', () => {
            link.href = `mailto:${email}`;
        });

        link.addEventListener('click', (e) => {
            // If href is still # or empty, set it (though mouseover should have handled it)
            if (link.getAttribute('href') === '#' || !link.getAttribute('href')) {
                e.preventDefault();
                window.location.href = `mailto:${email}`;
            }
        });
    });
}

/* --- Profile Video Logic --- */
const profilePic = document.getElementById('profile-pic');
const profileVideo = document.getElementById('profile-video');

if (profileVideo && profilePic) {
    profileVideo.playbackRate = 0.5; // Play slowly

    const swapToVideo = () => {
        profilePic.classList.add('hidden');
        profileVideo.classList.remove('hidden');
        profileVideo.play().catch(e => console.log("Video auto-play failed", e));
    };

    // Check if video is already ready or wait for it
    if (profileVideo.readyState >= 3) {
        swapToVideo();
    } else {
        profileVideo.addEventListener('canplaythrough', swapToVideo, { once: true });
        // Force load if not started
        profileVideo.load();
    }
}

/* --- Interactive Console Logic --- */
let isAcceptingInput = false;
let inputBuffer = "";
let cursorElement = null;
let currentInputContainer = null;

const cmdInput = document.getElementById('cmd-input');

function initConsoleInput() {
    isAcceptingInput = true;
    inputBuffer = "";
    cmdInput.value = ""; // Clear hidden input

    // Create new line with prompt
    const line = document.createElement('div');
    line.className = 'console-line';
    line.style.marginTop = "10px";
    line.innerHTML = '<span class="prompt" style="color: var(--phosphor-secondary);">NOSTROMO&gt; </span><span class="input-text"></span>';
    consoleOutput.appendChild(line);

    currentInputContainer = line.querySelector('.input-text');

    // Move/Create cursor
    if (!cursorElement) {
        cursorElement = document.createElement('span');
        cursorElement.className = 'cursor';
    }
    line.appendChild(cursorElement);

    // Ensure visible
    consoleOutput.scrollTop = consoleOutput.scrollHeight;

    // Auto-focus input
    cmdInput.focus();

    // Start random system events
    scheduleSystemEvents();

    // Start random glitches
    scheduleGlitch();
}

let eventTimeout = null;
let glitchTimeout = null;

function scheduleGlitch() {
    // Random interval between 40s and 100s
    // Make it rare but noticeable
    const delay = Math.floor(Math.random() * 60000) + 40000;

    glitchTimeout = setTimeout(() => {
        triggerGlitch();
        scheduleGlitch();
    }, delay);
}

function triggerGlitch() {
    const terminal = document.getElementById('terminal');
    terminal.classList.add('system-glitch');

    // Play a brief static sound? (Optional, maybe later)

    // Remove class after animation finishes (0.3s)
    setTimeout(() => {
        terminal.classList.remove('system-glitch');
    }, 300);

    // Sometimes log a power warning with it
    if (Math.random() < 0.3) {
        logSystemMessage("WARNING: POWER GRID FLUCTUATION DETECTED");
    }
}

function scheduleSystemEvents() {
    // Random interval between 10s and 30s
    const delay = Math.floor(Math.random() * 20000) + 10000;

    eventTimeout = setTimeout(() => {
        triggerRandomEvent();
        scheduleSystemEvents();
    }, delay);
}

function triggerRandomEvent() {
    if (!isAcceptingInput) return; // Don't interrupt if user is doing something special or destruct sequence

    const rand = Math.random();
    let msg = "";

    // Logic to determine what event happens
    // 20% chance of Crew death (until all are gone)
    // 30% chance of Alien alert (limited)
    // 50% chance of Hull/System warning

    if (rand < 0.2 && crewDeathIndex < crewMembers.length) {
        msg = `BIOSIGNAL LOST: ${crewMembers[crewDeathIndex]}`;
        crewDeathIndex++;
    } else if (rand < 0.5 && alienAlertTriggered < alienMessages.length) {
        msg = alienMessages[alienAlertTriggered];
        alienAlertTriggered++;
    } else {
        const rIndex = Math.floor(Math.random() * hullMessages.length);
        msg = hullMessages[rIndex];
    }

    logSystemMessage(`MU/TH/UR 6000: ${msg}`);
}

function logSystemMessage(text) {
    // We want to insert this message BEFORE the active input line (which is the last child usually)
    // The active input line has class "console-line" and contains the cursor/input input-text
    // Actually, initConsoleInput creates a div with class 'console-line' at the end.
    // We should find that last line, insert our message before it.

    const activeLine = consoleOutput.lastElementChild;
    const isInputLine = activeLine && activeLine.classList.contains('console-line') && activeLine.querySelector('.input-text');

    const msgDiv = document.createElement('div');
    msgDiv.style.marginBottom = "5px";
    msgDiv.style.marginTop = "10px"; // Ensure spacing from previous output
    msgDiv.style.color = "#33ff00"; // Slightly dimmer or standard
    // Check if it's a critical alert for styling
    if (text.includes("BIOSIGNAL LOST") || text.includes("PRIORITY ALERT") || text.includes("WARNING") || text.includes("SPECIAL ORDER 937")) {
        msgDiv.style.textShadow = "0 0 5px #ff6666";
        msgDiv.style.color = "#ff3333";
    }

    msgDiv.textContent = text;

    if (isInputLine) {
        consoleOutput.insertBefore(msgDiv, activeLine);
    } else {
        consoleOutput.appendChild(msgDiv);
    }

    // Play a small beep?
    // Reuse typing sound briefly? Or maybe no sound for background logs to be less annoying.

    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Focus input when clicking anywhere in terminal
terminal.addEventListener('click', () => {
    // If animation is still running, skip it
    if (lineIndex < parsedData.length) {
        finishAnimationInstantly();
    }

    if (isAcceptingInput) {
        cmdInput.focus();
    }
});

// Handle input via hidden field
cmdInput.addEventListener('input', (e) => {
    if (!isAcceptingInput) return;

    inputBuffer = cmdInput.value;
    updateInputDisplay();
});

cmdInput.addEventListener('keydown', (e) => {
    if (!isAcceptingInput) return;

    if (e.key === 'Enter') {
        e.preventDefault();
        isAcceptingInput = false;

        // Remove cursor from current line temporarily
        if (cursorElement && cursorElement.parentNode) {
            cursorElement.parentNode.removeChild(cursorElement);
        }

        // Clear input for safety
        cmdInput.value = "";

        processCommand(inputBuffer);
    }
    // Backspace and other keys are handled naturally by input value change, 
    // but we need to sync buffer if user modifies it. 
    // acts mostly on `input` event, but Enter is keydown.
});

function updateInputDisplay() {
    if (currentInputContainer) {
        currentInputContainer.textContent = inputBuffer;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
}

function processCommand(cmd) {
    if (cmd.trim() === "") {
        initConsoleInput();
        return;
    }

    const command = cmd.trim().toLowerCase();

    if (command === "selfdestruct" || command === "destruct" || command === "shutdown") {
        const responseText = "\nMU/TH/UR 6000: SELF-DESTRUCT SEQUENCE INITIATED.\nALL SYSTEMS TERMINATING...\nGOODBYE.\n";
        typeResponse(responseText, () => {
            setTimeout(() => {
                terminal.classList.add('power-off');
                // Stop audio
                if (bgMusic) {
                    bgMusic.pause();
                    bgMusic.currentTime = 0;
                }
            }, 1000);
        });
        return;
    }

    const responseText = "\nMU/TH/UR 6000: UNAUTHORIZED ACCESS.\nUSER LEVEL INSUFFICIENT.\nCONTACT FLIGHT OFFICER OR WEYLAND-YUTANI REP.\n";

    setTimeout(() => {
        typeResponse(responseText);
    }, 500);
}

function typeResponse(text, callback = null) {
    let i = 0;
    const responseContainer = document.createElement('span');
    consoleOutput.appendChild(responseContainer);

    if (typingSfx.paused) typingSfx.play().catch(() => { });

    function typeChar() {
        if (i < text.length) {
            const char = text[i];
            if (char === '\n') {
                responseContainer.appendChild(document.createElement('br'));
                typingSfx.pause();
                i++;
                setTimeout(() => {
                    if (typingSfx.paused) typingSfx.play().catch(() => { });
                    typeChar();
                }, linePause / 2);
                return;
            }

            responseContainer.append(char);
            i++;
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
            setTimeout(typeChar, typingSpeed);
        } else {
            typingSfx.pause();
            if (callback) {
                callback();
            } else {
                setTimeout(initConsoleInput, linePause);
            }
        }
    }

    typeChar();
}