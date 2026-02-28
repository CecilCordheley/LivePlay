<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LivePlay</title>
    <script src="_js/tmi.min.js"></script>
    <script src="_js/soundManager.js"></script>
    <script src="V2/js/ChatBot.js"></script>
    <script src="V2/js/botCommand.js"></script>
    <script src="V2/js/main.js"></script>
    <script src="V2/js/game.js"></script>
    <link rel="stylesheet" href="V2/css/main.css">
    <link rel="stylesheet" href="V2/css/timer.css">
    <link rel="stylesheet" href="V2/css/question.css">
</head>

<body>
    <audio id="win">
        <source src="./Sound/Win.wav" type="audio/wav">
    </audio>
    <audio id="loose">
        <source src="./Sound/Lose.wav" type="audio/wav">
    </audio>
    <!--Get Streamer Channel-->
    <div class="channelMdl">
        <h2> LivePlay</h2>
        <div class="component">
            <label for="channelName">Nom de la chaîne : </label>
            <input type="text" id="channelName" placeholder="Votre Chaine">
            <button>Commencer</button>
        </div>
    </div>
    <div class="container">

        <div g_area="header">
            <h1>LivePlay</h1>
            <div id="gain">
                <!-- <div id="joker">
                    <a class="btn" name="jkr" href="#">Joker</a>
                    <a class="btn" name="switch" href="#">Switch</a>
                </div>-->
                <div class="timer"
                    style="background: linear-gradient(rgb(51, 51, 51), rgb(17, 17, 17)) no-repeat content-box, conic-gradient(rgb(42, 54, 238) 0%, 0deg, rgb(102, 102, 102)) border-box;">
                    <span></span>
                </div>
                <ul>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
                <span id="indexQuestion">Question 1/10</span>
                <!--<div id="prgs_container">
                <div id="prgs_current"></div>
            </div>-->

                <div class="soundController" id="extractCtrl" style="display: none;">
                    <input type="range" class="soundCtrl" _target="#Extract" min="0" max="100">
                </div>
                <button title="couper le son du timer" id="soundSwitch">
                    <i class="fa-solid fa-volume-high"></i>
                </button>
                <div class="soundController">
                    <input title="Changer le volume du chronomètre" type="range" class="soundCtrl"
                        _target="[name=chrono].playing" min="0" max="100">
                </div>
                <button id="ExecExtract" style="display: none;">
                    Ecouter l'extrait
                    <i class="fa-solid fa-volume-high"></i>
                </button>

            </div>
        </div>
        <div g_area="question">
            <div class="leaderBoard"></div>
            <div id="question">
                <div class="questionElement">
                    <!--      <p>Lequel de ces jeux n'a pas eu d'adaptation cinéma avant 1996</p>
                    <ol>
                        <li style="opacity: 1;">Double Dragon <span>0%</span></li>
                        <li style="opacity: 1;">Tomb raider <span>0%</span></li>
                        <li style="opacity: 1;">Super Mario Bross <span>0%</span></li>
                        <li style="opacity: 1;">Mortal Kombat <span>0%</span></li>
                    </ol>-->
                </div>
                <div class="command">
                    <button id="canVote" style="display: block;">Commencer les votes</button>
                    <button id="check" style="display: block;">Vérifier</button>
                </div>
                <div class="query">
                    <button name="next">Continuer</button>
                </div>
            </div>
        </div>
        <div g_area="chat">
            <div id="chat"></div>
        </div>
    </div>
    <script>
        const elements = {
            indexQuestion: document.getElementById("indexQuestion"),
            startBtn: document.querySelector(".channelMdl button"),
            mainContainer: document.querySelector(".container"),
            voteBtn: document.getElementById("canVote"),
            checkBtn: document.getElementById("check"),
            nextBtn: document.querySelector("[name=next]"),
            leaderBoard: document.querySelector(".leaderBoard")
        }
        var compoments = document.querySelectorAll(".compoment");
        var channel = "NoChaine";
        elements.mainContainer.style.display = "none";
        var game = new Game(bot, document.querySelectorAll("#gain ul li"), document.getElementById("question"), elements);
        var bot = null;
        elements.startBtn?.addEventListener("click", function () {
            channel = document.getElementById("channelName").value;
            if (channel == "") {
                return;
            }
            let broadCast = (channel == "NoChaine") ? "d4rkh0und" : channel;
            bot = new GameBot("myGameBot", [broadCast]);
            game = new Game(bot, document.querySelectorAll("#gain ul li"), document.getElementById("question"), elements);

            document.querySelector(".channelMdl").style.display = "none";
            elements.mainContainer.style.display = "grid";
            game.loadLib();
        })



        /*  var LiveInfo = getLiveInformation(broadCast, (channel == "NoChaine"));
          LiveInfo.then((data) => {
              let t = data.title
              let nbV = (data.viewer_count != undefined) ? data.viewer_count : 0;
              document.getElementById("infoStreamer").innerHTML = "<span>" + t + "</span><span><i class=\"fa-solid fa-eye\"></i>" + nbV + "</span>";
          });
          setInterval(() => {
              var LiveInfo = getLiveInformation(broadCast);
              LiveInfo.then((data) => {
                  let t = data.title
                  let nbV = (data.viewer_count != undefined) ? data.viewer_count : 0;
                  document.getElementById("infoStreamer").innerHTML = "<span>" + t + "</span><span><i class=\"fa-solid fa-eye\"></i>" + nbV + "</span>";
              });
          }, 30 * 1000);*/
    </script>
</body>

</html>