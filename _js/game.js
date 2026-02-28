var query = [];
var nextBtn, voteBtn;
var queryBlock;
var pallier = 3;
var checkBtn;
var param = {
    timer_counter: 0,
    intervalReponse: 1500
}
var state = {
    badge: [],
    index: -1,
    score: 0,
    _index: -1,
    lastQuestion: -1,
    canVote: false,
    indexChrono: 0,
    cptVote: 0,
    cptinfo: 0,
    maxQuestion: 10,
    query: [],
    theme: ""
}
var Sound = {
    soundVolume: 100,
    sndSlash: null,
    sndGlasses: null,
    sndWin: null,
    sndLoose: null,
    sndExtract: null,
    sndChrono: null
}
var BotClient = null;
var chat = null;
var votes = []; // Recueille les vote

var equal = false;
var winner = [];
var config = {
    canPlay: false,
    soundEnable: true,
    getWinner: true,
    byVote: true,
    boss: true,
    filename: ""
};
function createModule(title = "") {
    let d = document.createElement("div");
    d.classList.add("module");
    let h = document.createElement("div");
    h.classList.add("header");
    if (title != "") {
        let t = document.createElement("h3");
        t.innerHTML = title;
        h.appendChild(t);
    }
    let close = document.createElement("button");
    close.innerHTML = "X";
    close.style.float = "right";
    close.onclick = function () {
        d.remove();
    }
    h.appendChild(close);
    d.appendChild(h);
    return d;
}
function SelectFile() {
    let d = createModule();
    let select = document.createElement("select");
    select.setAttribute("size", 9);

    library.forEach(el => {
        el.files.forEach(f => {
            let opt = document.createElement("option");
            opt.value = `Library/${f}`;
            opt.innerHTML = f;
            opt.addEventListener("dblclick", function () {
                selectLibrary = this.value;
                d.remove();
            })
            select.appendChild(opt);
        })
    })
    d.appendChild(select);
    document.body.prepend(d);
}

var selectLibrary = "";
var timerValue = 0;
var rep = { "A": 0, "B": 0, "C": 0, "D": 0 }
var bannedChannel = [
    "DamDamLive"
];
library = [
    {
        files: ["question.json", "question2.json", "question3.json", "question4.json"],
        theme: "JeuxVideo"
    }
    ,
    { files: ["HarryPotter1.json", "harrypotter2.json"], maxQuestion: 13, theme: "harryPotter" },
    { files: ["serie.json", "serie2.json"], theme: "serie" },
    { files: ["test.json"] },
    { files: ["cinema.json", "cinema2.json"], theme: "cinema" },
    { files: ["musique.json", "musique2.json"], theme: "musique" },
    { files: ["buffy.json"], maxQuestion: 13, theme: "buffy" },
    { files: ["finalFantasy.json"], maxQuestion: 13, theme: "FinalFantasy" },
    { files: ["dessinAnime.json"], maxQuestion: 10, theme: "DessinAnime" },
    { files: ["manga.json"], maxQuestion: 10, theme: "Manga" }
];
/** Récupère le questionnaire en AJAX */
function getLibrary() {
    //debugger
    let select = document.getElementById("getTheme");
    let a = library[select.value * 1].files;
    state.theme = library[select.value * 1].theme;
    state.maxQuestion = (library[select.value * 1].maxQuestion != undefined) ? library[select.value * 1].maxQuestion : 10;
    if (a.length > 1)
        return a[getRandomInt(a.length - 1)];
    else
        return a[0];
}
function fetchQuizz(file) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        config.filename = (selectLibrary != "") ? selectLibrary : file;
        xhr.open("GET", config.filename, true); // 'true' pour rendre la requête asynchrone
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    let query = JSON.parse(xhr.responseText);

                    query = shuffle(query);
                    state.query = query.slice(0, state.maxQuestion);
                    query = query.slice(0, state.maxQuestion).reduce(function (cary, el) {
                        cary.push(shuffleQuestion(el));
                        return cary;
                    }, []);
                    console.dir(query);
                    const pallier = parseInt(query.length / 3);
                    resolve({ query, pallier }); // Résoudre la promesse avec les données
                } catch (error) {
                    console.log(error);
                    _alert("Mince, une erreur est survenue lors du traitement des données", function () {
                        window.location.href = "index.php";
                    });
                    reject(error); // Rejeter la promesse en cas d'erreur dans le traitement
                }
            } else {
                _alert("Mince, le fichier ne peut pas être chargé, la page va se recharger", function () {
                    window.location.href = "index.php";
                });
                reject(new Error(`Erreur de chargement : ${xhr.status}`)); // Rejeter en cas de mauvais statut HTTP
            }
        };

        xhr.onerror = function () {
            _alert("Mince, une erreur de réseau s'est produite, la page va se recharger", function () {
                window.location.href = "index.php";
            });
            reject(new Error("Erreur réseau"));
        };

        xhr.send();
    });
}


/** Initialise les éléments DOM de la page */
function initializeElement() {
    getBadgeList();
    openBot();
    let ctrl = document.querySelectorAll(".soundCtrl");
    ctrl.forEach(el => {
        el.addEventListener("change", function (e) {
            //   debugger
            //    console.log(this.value)
            let target = this.getAttribute("_target");
            let el = document.querySelector(target);
            if (el != null)
                el.volume = parseFloat(this.value / 100)
        })
    })
    client.say(channel, "/me  Nous ne collectons ni ne stockons vos informations personnelles. Vos scores sont traités de manière anonyme et ne sont pas conservés après la fin de la partie");
    voteBtn = document.querySelector("#canVote");
    voteBtn.style.display = "none";
    let extractAudio = document.getElementById("Extract");
    extractAudio.onpause = function () {
        let _btn = document.getElementById("ExecExtract");
        _btn.innerHTML = "Ecouter l'extrait <i class=\"fa-solid fa-volume-high\"></i>"
    }
    voteBtn.onclick = function () {
        if (config.soundEnable)
            playChrono();
        this.style.display = "none";
        state.canVote = true;
        client.say(channel, "/me vous pouvez commencer à voter utilisez la commande <!vote> ou <!rep> suivi de la réponse [A,B,C ou D] à tout moment vous pouvez connaître votre rang avec <!myranck>");
        setTimer();
    }
    queryBlock = document.querySelector(".query");
    nextBtn = document.querySelector("[name=next]");
    checkBtn = document.querySelector("#check");
    checkBtn.onclick = function () { check(); };
    nextBtn.onclick = next;
}
/** Génére un Tableau HighScore */
function HighScore() {
    // 1. Compter les occurrences de chaque joueur dans 'winner'
    const nomLePlusFrequent = winner.reduce((acc, nom) => {
        acc[nom] = (acc[nom] || 0) + 1;  // Compte les occurrences de chaque nom
        return acc;
    }, {});

    // 2. Trier les noms par le nombre d'occurrences, du plus grand au plus petit
    let sortedPlayers = Object.keys(nomLePlusFrequent).sort((a, b) => {
        return nomLePlusFrequent[b] - nomLePlusFrequent[a]; // Trier du plus grand au plus petit
    });

    // 3. Créer une div pour afficher le tableau des scores
    let div = document.createElement("div");
    div.classList.add("HighScore");

    // 4. Limiter l'affichage à un maximum de 3 joueurs
    const max = sortedPlayers.length > 3 ? 3 : sortedPlayers.length;

    // 5. Récupérer les informations des joueurs de manière asynchrone et afficher le classement
    let promises = sortedPlayers.slice(0, max).map((player, index) => {
        return new Promise((resolve) => {
            getViewerInformation(player, function (data) {
                resolve({
                    player: player,
                    score: nomLePlusFrequent[player],
                    profile_image_url: data.profile_image_url,
                    rank: index + 1  // Classement en fonction de l'index
                });
            });
        });
    });

    // 6. Gérer les promesses une fois que toutes les informations sont récupérées
    Promise.all(promises).then(results => {
        results.forEach(result => {
            // Création de l'image et de la ligne pour chaque joueur
            let img = document.createElement("img");
            img.src = result.profile_image_url;
            img.alt = `${result.player}'s profile picture`;  // Meilleure pratique : ajouter un alt

            let line = document.createElement("div");

            // Ajout du texte : classement et score
            let span = document.createElement("span");
            span.textContent = `#${result.rank} ${result.player} - ${result.score} points`;

            // Ajout de l'image et du texte à la ligne
            line.appendChild(img);
            line.appendChild(span);

            // Ajout de la ligne à la div principale
            div.appendChild(line);
        });

        // Ajoute la div au corps du document
        document.body.appendChild(div);
    });
}



function replaceQuestion() {
    clearTimeout(param.timer_counter) //reset le timeout
    const progressBarEl = document.querySelector(".timer");
    progressBarEl.style.background = "linear-gradient(white, white) content-box no-repeat,conic-gradient(#2A36EE 0%, 0, #666 ) border-box;"

    state.lastQuestion = query[query.length - 1];
    query[state.index] = state.lastQuestion;
    document.querySelector(".current p").innerHTML = state.lastQuestion.question;
    var choice = document.querySelectorAll(".current ol li");
    state.lastQuestion.choix.forEach(function (el, i) {
        choice[i].innerHTML = el;
    })

    /* if (hasTimer()) {
         
     }*/

}
function setNotification(msg) {
    let n = document.getElementById("notif");
    n.innerHTML = msg;
    n.classList.add("show");
    setTimeout(() => {
        n.classList.remove("show");
    }, 3000)
}
/** Retourne le composant de la question */
function generateQuestion(question) {

    var _div = document.createElement("div");
    _div.classList.add("questionElement");

    var p = document.createElement("p");
    p.innerHTML = question.question;
    _div.append(p);

    var ol = document.createElement("ol");

    question.choix.forEach((element, index) => {
        var li = document.createElement("li");
        li.innerHTML = element + " <span>0%</span>";
        //  console.log(config.canPlay && !config.byVote);
        if (config.canPlay && equal == false && !config.byVote) {

            li.onclick = function () {
                if (votes[channel] == undefined) {
                    if (state.canVote) {
                        let alpha = "ABCD";
                        votes[channel] = alpha[index];
                        let cpt = document.querySelector('[data-val=' + alpha[index] + ']').innerHTML * 1;
                        cpt++;
                        // console.dir(votes);
                        state.cptVote++;
                        document.querySelector('[data-val=' + alpha[index] + ']').innerHTML = cpt;
                        setPercent(alpha[index]);
                        checkEqual();
                        let span = document.createElement("span");
                        span.innerHTML = `<b>${channel}</b> a répondu<span>`
                        chat.appendChild(span);
                        chat.scroll(1, 500);
                    }
                } else {
                    setNotification("Tu as déjà voté ");
                }
            }
        }
        ol.append(li);


    });
    _div.append(ol);
    // debugger;
    var _displayInfo = question.info ?? false;

    if (_displayInfo != false) {
        state.cptinfo++;
        var _info = document.createElement("section");
        _info.style.display = "none";
        _info.innerHTML = setInfoDisplay(question.info)
        _div.append(_info);
    }

    return _div;
}
function setInfoDisplay(infos) {
    var re = /list\:((.*?)*)/g;
    var array = [...infos.matchAll(re)]
    if (array.length != 0) {
        var _r = array[0][1].split("|").reduce(function (carry, el) {
            carry += "<li>" + el + "</li>";
            return carry;
        }, "");
        return "<ul>" + _r + "</ul>";
    } else
        return infos;

}

function getQuizz(file = "Library/harrypotter2.json") {
    // Initialiser les éléments nécessaires au jeu
    initSounds();
    initializeElement();

    // Appeler fetchQuizz qui renvoie une promesse
    fetchQuizz(file).then(({ query: localquery, pallier }) => {
        // Mettre à jour la variable globale `query`
        query = localquery;
        state.pallier = pallier;

        // Créer les éléments nécessaires pour afficher les questions et les gains
        var gainList = document.querySelector("#gain ul");
        var containerQuestion = document.querySelector("#question");

        query.reduce(function (carry, item) {
            carry.append(generateQuestion(item)); // Générer les questions
            let li = document.createElement("li");
            gainList.appendChild(li); // Ajouter les éléments de gains à la liste
            return carry;
        }, containerQuestion);

        // Démarrer le jeu avec la première question
        next();
    })
        .catch(error => {
            console.log(error);
            // Afficher un message d'erreur et gérer le problème
            _alert("Erreur lors du chargement du questionnaire. La page va se recharger.", function () {
                window.location.href = "index.php";
            });
        });
}

function getReponse() {
    let alpha = "ABCD";
    //  debugger;
    let dataVal = Array.from(document.querySelectorAll("[data-val]"));
    dataVal.sort((a, b) => {
        let numA = parseFloat(a.innerHTML.trim());
        let numB = parseFloat(b.innerHTML.trim());

        // Comparer les nombres
        return numB - numA;
    });
    if (dataVal.reduce((car, item) => {

        return car + parseFloat(item.innerHTML.trim())
    }, 0) == 0)
        return -1;
    equal = (dataVal[0] == dataVal[1]);
    let rep = dataVal[0].getAttribute("data-val");
    return alpha.indexOf(rep);

}
function checkEqual() {
    //  debugger;
    let dataVal = Array.from(document.querySelectorAll("[data-val]"));
    dataVal.sort((a, b) => {
        let numA = parseFloat(a.innerHTML.trim());
        let numB = parseFloat(b.innerHTML.trim());

        // Comparer les nombres
        return numB - numA;
    });
    equal = (dataVal[0].innerHTML == dataVal[1].innerHTML);
    //  console.log(equal);
}
/** détermine si des viewers/Joueurs ont donné la bonne réponse */
function getWinner(rep) {
    // 1. Les réponses possibles
    const msgs = ['/me #user# a mérité son point', `/me #user# a donné la bonne réponse`, `/me Bravo #user#`, `/me Bien joué #user#`];
    const choice = "ABCD";

    // Stoker les winners locaux
    let win = [];

    // 2. Vérifier les utilisateurs qui ont voté
    for (let user in votes) {
        let vote = votes[user];
        if (vote == choice[rep]) {
            win.push(user);
            if (config.boss)
                winner.push(user); // Ajouter le gagnant globalement
            if (config.getWinner) {
                // Choisir un message aléatoire pour annoncer le gagnant
                let i = getRandomInt(msgs.length - 1);
                let m = msgs[i];
                msgs.splice(i, 1);  // Retire le message utilisé pour éviter les doublons
                m = m.replace("#user#", user);
                client.say(channel, m); // Annonce le message dans le chat
            }
        }
    }
    // Montre la section du gagnant
    if (config.getWinner)
        document.getElementById("winner").classList.add("show");

    // Fonction récursive pour afficher les gagnants un par un
    let indexWiner = 0;

    function displayNextWinner() {
        if (indexWiner < win.length) {
            getViewerInformation(win[indexWiner], function (data) {
                document.querySelector("#winner img").src = data.profile_image_url;
                document.querySelector("#winner span").innerHTML = "Bravo " + win[indexWiner];

                // Après 5 secondes, afficher le gagnant suivant
                setTimeout(() => {
                    indexWiner++;
                    displayNextWinner(); // Appel récursif pour afficher le gagnant suivant
                }, 5000);
            });
        } else {
            // Réinitialiser l'affichage une fois que tous les gagnants ont été affichés
            document.getElementById("winner").classList.remove("show");
            document.querySelector("#winner img").src = "Ressource/default.jpg";
            document.querySelector("#winner span").innerHTML = "";
        }
    }
    if (config.boss && winner.length > 0) {
        // Lance la récursion pour afficher le premier gagnant
        displayNextWinner();

        // Met à jour le tableau des HighScores
        HighScore();
    }
}

function shuffleQuestion(questionObj) {
    // Copie les choix et la réponse pour éviter de modifier directement l'objet original
    const choices = [...questionObj.choix];
    const correctAnswer = questionObj.reponse;
    const infoEl = questionObj.info;
    // Mélanger les choix en utilisant l'algorithme de Fisher-Yates
    for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    // Mettre à jour l'index de la réponse correcte après le mélange
    const newCorrectAnswer = choices.indexOf(questionObj.choix[correctAnswer]);

    // Retourne l'objet mis à jour
    return {
        question: questionObj.question,
        choix: choices,
        reponse: newCorrectAnswer,
        info: infoEl
    };
}
async function updateLibrary() {
    console.info(config.filename);
    console.info(query);
    data = {
        "file": config.filename,
        "questions": state.query,
        "theme": state.theme
    }
    let response = await fetch("async.php?act=updateLib", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    });
    let result = await response.json();
    console.dir(result);
}
function check() {
    if (!state.canVote) {
        _alert("Votre chat doit d'abort voter pour une réponse");
        return;
    }
    clearTimeout(param.timer_counter) //reset le timeout
    debugger
    if (getReponse() == -1) {
        Sound.sndChrono[state.indexChrono].pause();
        Sound.sndChrono[state.indexChrono].classList.remove("playing");
        _alert("Personne n'a voté c'est dommage ", function () {
            playLoose();
            setLoose();
            next();
        });
        return;
    }
    state._index = getReponse();
    Sound.sndChrono[state.indexChrono].pause();
    Sound.sndChrono[state.indexChrono].classList.remove("playing");
    if (state._index == -1)
        return;
    else
        checkBtn.style.display = "none";
    var _displayInfo = query[state.index].info ?? false;
    var _media = query[state.index].media ?? false;
    if (_displayInfo != false) {
        document.querySelector(".questionElement.current>section").style.display = "block";
        document.querySelector(".questionElement.current>section").onclick = function () {
            this.style.display = "none";
        }
    } if (_media != false) {
        console.log(query[state.index].media);
        let s = document.querySelector("#Extract");
        s.setAttribute("src", "Sound/" + query[state.index].media);
        document.getElementById("ExecExtract").style.display = "block";
        document.getElementById("extractCtrl").style.display = "block";
    }
    clearTimeout(param.timer_counter)
    const progressBarEl = document.querySelector(".timer");
    progressBarEl.style.background = `linear-gradient(white, white) content-box no-repeat,conic-gradient(#2A36EE 0%, 0, #666 ) border-box;`

    if (query[state.index].reponse == state._index) {
        playWin();
        setWin();

    } else {
        playLoose();
        setLoose();
    }
    queryBlock.style.display = "flex";
    getWinner(query[state.index].reponse);
    initParam();

}
function setWin() {
    document.querySelectorAll('#gain ul li')[state.index].classList.add("good");

    document.querySelectorAll(".questionElement.current ol li")[query[state.index].reponse].classList.add("good");
    document.querySelectorAll(".questionElement.current ol li:not(.good)").forEach(el => {
        el.style.background = "#888";
        el.style.color = "#666";
    })
    state.score++;
}
function setLoose() {
    document.querySelectorAll('#gain ul li')[state.index].classList.add("bad");
    document.querySelectorAll(".questionElement.current ol li")[query[state.index].reponse].classList.add("bad");
    document.querySelectorAll(".questionElement.current ol li:not(.bad)").forEach(el => {
        el.style.background = "#888";
        el.style.color = "#666";
    })
}
function getRanck(name) {
    const nomLePlusFrequent = winner.reduce((acc, nom) => {
        acc[nom] = (acc[nom] || 0) + 1;  // Compte les occurrences de chaque nom
        return acc;
    }, {});
    let arr = Object.keys(nomLePlusFrequent).sort((a, b) => {
        return nomLePlusFrequent[b] - nomLePlusFrequent[a]
    });
    let r = arr.indexOf(name);
    // console.log(nomLePlusFrequent);
    return { "ranck": (r + 1), "nbRep": nomLePlusFrequent[name] };
}
function getBoss() {
    const nomLePlusFrequent = winner.reduce((acc, nom) => {
        acc[nom] = (acc[nom] || 0) + 1;  // Compte les occurrences de chaque nom
        return acc;
    }, {});
    console.log(nomLePlusFrequent);
    // Trouver le nom qui a la plus grande occurrence
    const result = Object.keys(nomLePlusFrequent).reduce((a, b) =>
        nomLePlusFrequent[a] > nomLePlusFrequent[b] ? a : b
    );
  //  FireWorks();
    _alert(`${result} nommé Boss du Chat avec ${nomLePlusFrequent[result]} bonnes réponses`, function () {
        window.location.reload()
    });
}
function hasTimer() {
    return (getUrlVariable()?.["timer"] ?? "off") == "on";
}
function getDuring() {
    return 180;

}
function setTimer() {
    const progressBarEl = document.querySelector(".timer");
    let d = 80;
    // debugger
    let remainingTime = d; // seconds

    const totalTime = remainingTime;
    timerValue = remainingTime
    progressBarEl.style.background = `linear-gradient(#333, #111) content-box no-repeat,conic-gradient(#2A36EE 100%, 0, #666 ) border-box`;
    function countdown() {
        if (remainingTime > 0) {
            // update countdown timer
            // countdownEl.textContent = remainingTime;

            // update progress bar
            const progress = ((totalTime - remainingTime) / totalTime) * 100;
            progressBarEl.style.background = `linear-gradient(#333, #111) content-box no-repeat,conic-gradient(#2A36EE ${progress}%, 0, #666 ) border-box`;
            //  checkEqual();
            //     console.log(remainingTime);
            remainingTime--;
            progressBarEl.children[0].innerHTML = remainingTime;
            if (remainingTime < 20) {
                progressBarEl.children[0].classList.add("warning")
            }
            timerValue = remainingTime
            param.timer_counter = setTimeout(countdown, 1000);
        } else {
            // countdown finished
            progressBarEl.style.background = `linear-gradient(#333, #111) content-box no-repeat,conic-gradient(#2A36EE 100%, 0, #666 ) border-box`;
            clearTimeout(param.timer_counter);

            if (state.cptVote > 0) {
                check();
            } else
                setLoose();

            /* _alert("Time's Up", function () {
                 document.location.reload();
             });*/
            //       countdownEl.textContent = "Time's up!";
        }
    }
    countdown();

}
function updateLabel(checkboxId, configProperty, trueText, falseText) {
    const checkbox = document.getElementById(checkboxId);
    const label = document.querySelector(`[for=${checkboxId}]`);

    checkbox.addEventListener("change", function () {
        config[configProperty] = this.checked;
        label.innerHTML = this.checked ? trueText : falseText;
    });
}
function next() {
    //reload Chrono Span
    state._index = -1;
    state.canVote = false;
    let Hs = document.querySelector(".HighScore");
    if (Hs != null)
        Hs.remove();
    document.getElementById("ExecExtract").style.display = "none";
    document.getElementById("extractCtrl").style.display = "none";
    document.getElementById("winner").classList.remove("show");
    document.querySelector(".timer span").innerHTML = "";
    const progressBarEl = document.querySelector(".timer");
    progressBarEl.style.background = `linear-gradient(#333, #111) content-box no-repeat,conic-gradient(#2A36EE 0%, 0, #666 ) border-box`;
    progressBarEl.children[0].classList.remove("warning");
    document.getElementById("Extract").pause();
    voteBtn.style.display = "none";
    equal = false;

    checkBtn.style.display = "block";
    var questions = document.querySelectorAll(".questionElement");

    if (state.index + 1 > questions.length - 1) {
        updateLibrary();
        var correct = document.querySelectorAll("#gain ul li.good").length;
        var tot = document.querySelectorAll("#gain ul li").length;
        _alert(`${correct} sur ${tot}`, function () {
            if (config.boss) {
                getBoss();
            } else
                window.location.reload();
        });
        document.querySelector("#reload").style.display = "block";
    }
    else {

        let l = query.length;
        document.querySelector('#indexQuestion').innerHTML = "Question " + (state.index + 2) + "/" + l;
        queryBlock.style.display = "none";
        questions.forEach(element => {
            element.classList.remove("current");
            element.style.display = "none";
        });
        state.index++;
        questions[state.index].style.display = "block";
        questions[state.index].classList.add("current");

        var _currentQuestion = document.querySelectorAll(".current ol li");
        _currentQuestion.forEach(function (item) {
            item.style.opacity = 0;
        });



        setTimeout(function () {
            var i = 0;
            var t = setInterval(function () {
                if (i <= 4) {
                    if (i < 4)
                        _currentQuestion[i].style.opacity = 1;
                    i++;
                } else {
                    clearInterval(t);
                    voteBtn.style.display = "block";
                }
            }, param.intervalReponse);
        }, 2000);

    }
}