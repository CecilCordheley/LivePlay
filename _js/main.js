
function initParam() {
    votes = [];
    state.cptVote = 0;
    chat = document.querySelector("#chat>section");
    Array.from(document.querySelectorAll('[data-val]')).forEach(el => {
        el.innerHTML = 0;
    });
}
function logoAnimate() {
    const { matches } = window.matchMedia("prefers-reduced-motion: reduce");

    if (!matches) {
        document.querySelector(".logo").style.opacity = 1;
        const text = document.querySelector("svg text");
        const textLength = text.getAttribute("textLength");
        text.innerHTML = text.textContent
            .split("")
            .map((letter) => `<tspan textLength="${textLength}">${letter}</tspan>`)
            .join("");

        return new Promise((resolve) => {
            const animation = anime.timeline({
                complete: () => resolve() // Appeler resolve une fois l'animation terminée
            });

            animation.add({
                targets: "text tspan",
                opacity: [0, 1],
                duration: 425,
                loop: true, // Si l'animation boucle, la promesse ne sera pas résolue
                direction: 'reverse',
                easing: "easeInOutQuad",
                delay: (d, i) => 150 * i + 500
            });

            animation.add(
                {
                    targets: "mask circle",
                    scale: [1, 0],
                    duration: 2000,
                    loop: true, // Idem ici : si "loop" est activé, la promesse ne se résout jamais
                    direction: 'reverse',
                    easing: "easeInOutSine"
                },
                750
            );
        });
    }
}

function FireWorks() {
    window.human = false;

    var canvasEl = document.querySelector('.fireworks');
    var ctx = canvasEl.getContext('2d');
    var numberOfParticules = 30;
    var pointerX = 0;
    var pointerY = 0;
    var tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
    var colors = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C'];

    function setCanvasSize() {
        canvasEl.width = window.innerWidth * 2;
        canvasEl.height = window.innerHeight * 2;
        canvasEl.style.width = window.innerWidth + 'px';
        canvasEl.style.height = window.innerHeight + 'px';
        canvasEl.getContext('2d').scale(2, 2);
    }

    function updateCoords(e) {
        pointerX = e.clientX || e.touches[0].clientX;
        pointerY = e.clientY || e.touches[0].clientY;
    }

    function setParticuleDirection(p) {
        var angle = anime.random(0, 360) * Math.PI / 180;
        var value = anime.random(50, 180);
        var radius = [-1, 1][anime.random(0, 1)] * value;
        return {
            x: p.x + radius * Math.cos(angle),
            y: p.y + radius * Math.sin(angle)
        }
    }

    function createParticule(x, y) {
        var p = {};
        p.x = x;
        p.y = y;
        p.color = colors[anime.random(0, colors.length - 1)];
        p.radius = anime.random(16, 32);
        p.endPos = setParticuleDirection(p);
        p.draw = function () {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
        return p;
    }

    function createCircle(x, y) {
        var p = {};
        p.x = x;
        p.y = y;
        p.color = '#FFF';
        p.radius = 0.1;
        p.alpha = .5;
        p.lineWidth = 6;
        p.draw = function () {
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
            ctx.lineWidth = p.lineWidth;
            ctx.strokeStyle = p.color;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        return p;
    }

    function renderParticule(anim) {
        for (var i = 0; i < anim.animatables.length; i++) {
            anim.animatables[i].target.draw();
        }
    }

    function animateParticules(x, y) {
        var circle = createCircle(x, y);
        var particules = [];
        for (var i = 0; i < numberOfParticules; i++) {
            particules.push(createParticule(x, y));
        }
        anime.timeline().add({
            targets: particules,
            x: function (p) { return p.endPos.x; },
            y: function (p) { return p.endPos.y; },
            radius: 0.1,
            duration: anime.random(1200, 1800),
            easing: 'easeOutExpo',
            update: renderParticule
        })
            .add({
                targets: circle,
                radius: anime.random(80, 160),
                lineWidth: 0,
                alpha: {
                    value: 0,
                    easing: 'linear',
                    duration: anime.random(600, 800),
                },
                duration: anime.random(1200, 1800),
                easing: 'easeOutExpo',
                update: renderParticule,
                offset: 0
            });
    }

    var render = anime({
        duration: Infinity,
        update: function () {
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        }
    });

    document.addEventListener(tap, function (e) {
        window.human = true;
        render.play();
        updateCoords(e);
        animateParticules(pointerX, pointerY);
    }, false);

    var centerX = window.innerWidth / 2;
    var centerY = window.innerHeight / 2;

    function autoClick() {
        if (window.human) return;
        animateParticules(
            anime.random(centerX - 50, centerX + 50),
            anime.random(centerY - 50, centerY + 50)
        );
        anime({ duration: 200 }).finished.then(autoClick);
    }
    animateParticules(
        anime.random(centerX - 50, centerX + 50),
        anime.random(centerY - 50, centerY + 50)
    );
    anime({ duration: 200 }).finished.then(autoClick);
    autoClick();
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize, false);
}
function openBot() {
    chat = document.querySelector("#chat");
    initParam();
    channel = (channel != "NoChaine") ? channel : "d4rkh0und";
    client = new tmi.Client({
        options: { debug: true },
        identity: {
            username: 'GAMEBOT',
            password: 'oauth:je637klvvxqnfhjoomumuh6eygcr8c'
        },
        channels: [channel]
    });
    client.connect();
    /*  client.on('part', (channel, username, self) => {
          if (!self) {
              let span=document.createElement("span");
              span.innerHTML=`<b>${username}</b> a quitté le chat`
              span.classList.add(".rotate");
              chat.appendChild(span);
              setTimeout(()=>{
                  span.classList.remove(".rotate");
              },3000);
          }
        });*/
    client.on('join', (channel, username, self) => {
        let msgs = ["/me on souhaite la bienvenue à #user#", "/me Un grand coucou à #user#", "/me Ouha #user# quelle joie de te voir bienvenue installe toi profite"]
        if (!self) {

            let span = document.createElement("span");
            span.innerHTML = `<b>${username}</b> a rejoint le chat`
            span.classList.add(".rotate");
            chat.appendChild(span);
            chat.scroll(1, 500);
            setTimeout(() => {
                span.classList.remove(".rotate");
            }, 3000);
        }

    });
    client.on('cheer', (channel, userstate, message) => {
        chat.innerHTML += `<span><b>${userstate['display-name']}</b> soutien avec ${userstate.bits} bits: ${message}</span>`;
        chat.scroll(1, 500);
    });
    client.on('raided', (channel, username, viewers) => {
        let span = document.createElement("span");
        span.innerHTML = `<b>${username}</b> vous raid avec ${viewers} spectateurs`
        chat.appendChild(span);
        let nbSpan = document.querySelectorAll("#chat section span").length;
        chat.scroll(1, nbSpan * 100);
        setTimeout(() => {
            span.classList.remove(".rotate");
        }, 3000);
        client.say(channel, `/me Bienvenue au viewers de ${username} vous avez la possibilité de jouer`);
    });
    client.on('message', (channel, tags, message, self) => {
        //  console.clear();
        if (self) return; // Ignore les messages du bot
        // console.dir(tags);
        let badges = tags.badges;
        let badgeHTML = '';

        if (badges) {
            // Boucle sur les badges (ex: broadcaster, moderator, subscriber)
            for (const badge in badges) {
                // Générer l'URL des images des badges (par exemple depuis Twitch)

                const badgeURL = state.badge[badge];
                console.log(state.badge)
                // Créer un élément HTML pour afficher le badge
                badgeHTML += `<img src="${badgeURL}" alt="${badge}" /> `;
            }
        }

        const args = message.split(' ');
        const command = args.shift().toLowerCase();
        if (command == "!myranck") {
            let ranck = getRanck(tags.username);
            client.say(channel, `/me ${tags.username} vous êtes #${ranck.ranck} avec ${ranck.nbRep} bonne réponse`);
        }
        if (command == "!rep" || command == "!vote") {
            if (state.canVote) {
                if (config.canPlay == false && equal == false && `#${tags.username}` == `${channel}`) {

                    client.say(channel, `/me ${tags.username} ne peut voter qu'en cas d'égalité`);
                    return;
                }
                const vote = args[0].toUpperCase();
                if (['A', 'B', 'C', 'D'].includes(vote)) {
                    if (votes[tags.username] == undefined) {
                        votes[tags.username] = vote;
                        state.cptVote++;
                        let cpt = document.querySelector('[data-val=' + vote + ']').innerHTML * 1;
                        cpt++;
                        let span = document.createElement("span");
                        span.innerHTML = `${badgeHTML}<b>${tags.username}</b> a répondu`
                        chat.appendChild(span);
                        //Nombre de span
                        let nbSpan = document.querySelectorAll("#chat section span").length;
                        chat.scroll(1, nbSpan * 100);
                        setTimeout(() => {
                            span.classList.remove(".rotate");
                        }, 3000);
                        document.querySelector('[data-val=' + vote + ']').innerHTML = cpt;
                        setPercent(vote);
                        checkEqual();
                        return
                    } else {
                        setNotification(`${tags.username}, tu as déjà voté `);
                        client.say(channel, `/me ${tags.username} Vous avez déjà voté`);
                        return;
                    }
                } else {
                    let message = [
                        `/me ${tags.username} t'es un petit malin ?LUL`,
                        `/me ${tags.username} tu devrais essayer d'autres lettres on sait jamais LUL`,
                        `/me ${tags.username} amusant ${vote} LUL c'est ni A ni B ni C ni D`
                    ];
                    let _i = getRandomInt(2);
                    client.say(channel, message[_i]);
                    return;
                }
            } else {
                setNotification(`<b>${tags.username}</b> Vous ne pouvez pas encore voter !`)
                client.say(channel, `/me ${tags.username} Vous ne pouvez pas encore voter`);
                return;
            }

        }
    });
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function setPercent(val) {
    let alpha = "ABCD";
    var el = document.querySelectorAll(".questionElement.current ol li span");
    el.forEach((item, index) => {
        //  debugger;
        let v = document.querySelector('[data-val=' + alpha[index] + ']').innerHTML * 1;
        prct = Math.floor((v / state.cptVote) * 100);
        item.innerHTML = `${prct} %`;
    })
}
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}
function getUrlVariable() {
    var _url = document.location.href;
    var _arr = _url.split("?")[1];
    if (_arr != undefined)
        return _arr.split('&').reduce(function (prev, current) {
            let _item = current.split("=");
            prev[_item[0]] = _item[1];
            return prev;
        }, [])
    else
        return false;
}
function modal(idEl) {
    document.getElementById(idEl).style.display = "flex";
}
function _alert(msg, onclose, css) {
    var _overlay = document.createElement("div");
    _overlay.classList.add("overlay");
    var _m = document.createElement("div");
    if (css != undefined) {
        for (let _v in css) {
            _m.style[Object.keys(_v)] = _v;
        }
    }
    _m.innerHTML = msg;
    _overlay.appendChild(_m);
    _overlay.onclick = function () {
        this.remove();
        if (onclose != undefined)
            onclose();
    }
    document.body.prepend(_overlay);

}