class Game {
    constructor(bot, gain, questionContainer, elements) {

        console.log("Instance of game");
        this.gain = gain;
        this.point = 0;
        this.leaderBoard = elements.leaderBoard;
        this.elements = elements;
        this.isInit = false;
        this.canVote = false;
        this.bot = bot;
        this.questionContainer = questionContainer;
        this.lib = [];
        this.votes = [];
        this.cptVote = 0;
        this.players = [];
        this.timerValue = 0;
        this.timer_counter = 0;
    }
    shuffle(array) {
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
    loadLib = async function () {
        try {
            // Charger l'index des thèmes
            const indexResponse = await fetch("Library/index.json", {
                headers: { "Content-Type": "application/json" },
            });
            const indexData = await indexResponse.json();

            let questions = [];

            // Fonction utilitaire pour piocher n éléments aléatoires
            const getRandomItems = (array, n) => {
                const shuffled = array.slice().sort(() => 0.5 - Math.random());
                return shuffled.slice(0, n);
            };

            // Boucle sur chaque thème
            for (const [theme, files] of Object.entries(indexData)) {
                console.log(theme);
                for (const file of files) {
                    // Attention à await ici !
                    const response = await fetch(`Library/${file}`);
                    const data = await response.json();
                    const picked = getRandomItems(data, Math.min(2, data.length));
                    picked.map((q) => q["theme"] = theme);
                    questions = questions.concat(picked);
                }
            }

            // Mélanger toutes les questions sélectionnées
            questions = getRandomItems(questions, questions.length);

            // Initialiser le jeu avec le questionnaire final
            this.lib = this.shuffle(questions).slice(0, 10);
            this.init();

        } catch (err) {
            console.error("Erreur lors du chargement du thème :", err);
        }
    }


    init = function () {
         initSounds();
        registerCommands(this.bot);
        this.isInit = true;
        this.timerValue = 0;
        this.players = [];
        this.canVote = false;
        this.cptVote = 0;
        this.bot.openBot();
        this.index = -1;
        this.votes = [];
        this.next();
        this.elements.voteBtn?.addEventListener("click", () => {
            this.elements.voteBtn.style.display = "none";
            this.elements.checkBtn.style.display = "inline-block";
            this.bot.message("/me viewer can now vote !");
            this.canVote = true;
            this.setTimer();
        });
        this.elements.checkBtn?.addEventListener("click", () => {
            if (!this.canVote)
                return;
            this.clearTimer();
            this.checkAnswer();
            this.elements.checkBtn.style.display = "none";
           /* setTimeout(() => {
                this.elements.nextBtn.style.display = "inline-block";
            }, 5000);*/
        });
        this.elements.nextBtn?.addEventListener("click", () => {
            if (this.index + 1 < this.lib.length) {
                this.elements.nextBtn.style.display = "none";
                this.elements.checkBtn.style.display = "none";
                this.elements.voteBtn.style.display = "inline-block";
                this.next();
            }
            else
                this.end();
        })
    }
    displayLeaderBoard = function (timer = 5) {
        this.leaderBoard.innerHTML = "<h2>LeaderBoard</h2>";
        let list = document.createElement("ol");
        this.players.sort((a, b) => b.score - a.score);
        this.players.forEach((p, i) => {
            if (p.score > 0) {
                let item = document.createElement("li");
                item.innerHTML = `${p.name} - ${p.score} pts`;
                list.appendChild(item);
            }
        });
        this.leaderBoard.appendChild(list);
        this.leaderBoard.classList.add("show");
        setTimeout(() => {
            this.leaderBoard.classList.remove("show");
        }, timer * 1000);
    }
    clearTimer = function () {
        clearTimeout(this.timer_counter);
    }
    setTimer = function () {
        const progressBarEl = document.querySelector(".timer");
        let d = 80;
        // debugger
        let remainingTime = d; // seconds

        const totalTime = remainingTime;
        var timerValue = remainingTime
        progressBarEl.style.background = `linear-gradient(#333, #111) content-box no-repeat,conic-gradient(#2A36EE 100%, 0, #666 ) border-box`;
        function countdown(instance) {
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
                instance.timer_counter = setTimeout(() => { countdown(instance) }, 1000);
            } else {
                // countdown finished
                progressBarEl.style.background = `linear-gradient(#333, #111) content-box no-repeat,conic-gradient(#2A36EE 100%, 0, #666 ) border-box`;
                clearTimeout(instance.timer_counter);
                instance.elements.checkBtn.style.display = "none";
                instance.checkAnswer();
              /*  setTimeout(() => {
                    instance.elements.nextBtn.style.display = "inline-block";
                }, 5000);*/
                /* _alert("Time's Up", function () {
                     document.location.reload();
                 });*/
                //       countdownEl.textContent = "Time's up!";
            }
        }
        countdown(this);

    }
    end = function () {
        this.questionContainer.innerHTML = "le jeu est fini";
        this.displayLeaderBoard(15);
        /*  console.log("Classement final :");
          this.players.sort((a, b) => b.score - a.score);
          this.players.forEach((p, i) => {
              console.log(`${i + 1}. ${p.name} - ${p.score} pts`);
          });
     
          if (this.players.length > 0) {
              const boss = this.players[0];
              console.log(`Boss du chat : ${boss.name} avec ${boss.score} points !`);
          }*/
    }

    next = function () {
        this.index++;
        this.elements.indexQuestion.innerHTML = `${this.index + 1}/${this.lib.length}`;
        this.displayQuestion();
        this.elements.nextBtn.style.display = "none";
        this.elements.voteBtn.style.display = "inline-block";

    }
    displayQuestion = async function () {
        function wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        let question = this.lib[this.index];
        //    console.dir(question);
        //Question Element
        let qEl = this.questionContainer.querySelector(".questionElement");
        qEl.innerHTML = "";
        let theme = document.createElement("span");
        theme.classList.add("theme");
        theme.innerText = "question de " + question.theme;
        qEl.appendChild(theme);
        let contentQuestion = document.createElement("p");
        contentQuestion.innerHTML = question.question;
        let loader = document.createElement("div");
        loader.classList.add("loader");
        qEl.appendChild(loader);
        await wait(3000);
        loader.remove();
        qEl.appendChild(contentQuestion);


        let contentChoix = document.createElement("ol");
        let rep = ["A", "B", "C", "D"];
        question.choix.forEach((element, index) => {
            contentChoix.innerHTML += `<li style="opacity:0" data-val=${rep[index]}>${element} <span>0%</span></li>`;
        });
        var i = 0;
        var t = setInterval(function () {
            if (i <= 4) {
                if (i < 4) {
                    contentChoix.querySelectorAll("li")[i].classList.remove("good");
                    contentChoix.querySelectorAll("li")[i].classList.remove("bad");
                    contentChoix.querySelectorAll("li")[i].classList.remove("neutral");
                    contentChoix.querySelectorAll("li")[i].style.opacity = 1;
                    i++;
                }
            } else {
                clearInterval(t);
            }
        }, 2000);
        qEl.appendChild(contentChoix);

        qEl.classList.add("fade-in");
        if (question.info) {
            let infoSection = document.createElement("section");
            infoSection.classList.add("infoSection");
            infoSection.innerHTML = question.info;
            qEl.appendChild(infoSection);
        }
    }
    receiveVote(username, choice) {
        if (!this.canVote) return;

        // Empêcher plusieurs votes par question
        if (this.votes.some(v => v.user === username)) return;

        this.votes.push({ user: username, choice });
        if (!this.players.some(p => p.name === username)) {
            this.players.push({ name: username, score: 0 });
        }
        this.cptVote++;
        console.dir(this.votes);
        // Mettre à jour l'affichage
        this.updateVoteDisplay();
    }
    checkAnswer = function () {
        // this.gain[this.index].classList.add("bad");
        const bonneReponse = this.lib[this.index].reponse; // index (0-3)
        const lettreBonne = ["A", "B", "C", "D"][bonneReponse];

        // Réponse la plus votée par le chat
        const indexMaxVote = this.getReponse(); // renvoie un index (0-3)
        const lettreMaxVote = ["A", "B", "C", "D"][indexMaxVote];
        if (bonneReponse == indexMaxVote) {
            playWin();
            this.gain[this.index].classList.add("good");
            this.point++;
        } else {
            playLose();
            this.gain[this.index].classList.add("bad");
        }
        // Met en vert la bonne réponse
        this.questionContainer
            .querySelector(`.questionElement ol li[data-val=${lettreBonne}]`)
            .classList.add("good");

        // Si la réponse la plus votée n’est PAS la bonne → en rouge
        if (lettreMaxVote !== lettreBonne) {
            this.questionContainer
                .querySelector(`.questionElement ol li[data-val=${lettreMaxVote}]`)
                .classList.add("bad");
        }
        this.questionContainer
            .querySelectorAll(".questionElement ol li:not(.bad):not(.good)")
            .forEach(li => li.classList.add("neutral"));
        // Donner les points aux bons joueurs
        this.votes.forEach(v => {
            if (v.choice === lettreBonne) {
                let player = this.players.find(p => p.name === v.user);
                if (player) player.score++;
            }
        });
        if (this.lib[this.index].info) {
            this.questionContainer.querySelector(".questionElement .infoSection").classList.add("show");
        }
        // Réinitialiser votes et verrouiller
        this.votes = [];
        this.canVote = false;
        this.displayLeaderBoard();
        setTimeout(() => {
            this.elements.nextBtn.style.display = "inline-block";
        }, 5000);
    }

    getReponse = function () {
        let alpha = "ABCD";

        let dataVal = Array.from(this.questionContainer.querySelectorAll(".questionElement ol li"));
        dataVal.sort((a, b) => {
            let numA = parseFloat(a.querySelector("span").textContent.replace("%", "").trim()) || 0;
            let numB = parseFloat(b.querySelector("span").textContent.replace("%", "").trim()) || 0;
            return numB - numA;
        });
        console.dir(dataVal);
        // Vérifie si égalité
        let topScore = parseFloat(dataVal[0].querySelector("span").textContent.replace("%", "").trim()) || 0;
        let secondScore = parseFloat(dataVal[1].querySelector("span").textContent.replace("%", "").trim()) || 0;
        equal = (topScore === secondScore);

        let rep = dataVal[0].getAttribute("data-val");
        return alpha.indexOf(rep); // renvoie 0 à 3
    }
    updateVoteDisplay() {
        const total = this.votes.length;
        const counts = { "A": 0, "B": 0, "C": 0, "D": 0 };

        this.votes.forEach(v => {
            if (counts.hasOwnProperty(v.choice)) {
                counts[v.choice]++;
            }
        });

        ["A", "B", "C", "D"].forEach(letter => {
            let span = this.questionContainer.querySelector(`.questionElement ol li[data-val=${letter}]>span`);
            const percent = total > 0 ? Math.round((counts[letter] / total) * 100) : 0;
            span.textContent = `${percent}%`;
        });
    }

}