
const commands = {
    "#vote": (args, tag, channel) => {
        if (game.canVote) {
            const vote = args[0].toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(vote)) {
                console.log(tag.username + " is voting " + vote);
                game.receiveVote(tag.username, vote)
                checkEqual();

            }
        }
    },
    "#rep": (args, tag, channel) => {
        if (game.canVote) {
            const vote = args[0].toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(vote)) {
                console.log(tag.username + " is voting " + vote);
                game.receiveVote(tag.username, vote)
                checkEqual();

            }
        }
    }
};
function executeCharacterCommand(type, tag, action) {
    let char = getCharacterByType(type);
    if (char && char[0].name === tag.username) {
        action(char[0]);
    } else {
        bot.message(`/me ${tag.username}, n'a pas accès à cette commande`);
    }
}

function registerCommands(bot) {
    Object.keys(commands).forEach(command => {
        bot.setCommand(command, commands[command]);
    });
}
window.addEventListener("load", function () {
    /*bot.getBot().on('raided', (channel, username, viewers) => {
        playerStats.raids.push(username);
        console.log("Raid détecté !");
        onRaid(channel, username, viewers)
    });*/
})
//Ici les events gérer par le bot

function emulateRaid() {
    username = 'Jaqui';
    viewers = getRandomInt(2, 20);
    channel = "";
    onRaid(channel, username, viewers)
}
function emulateCmd(cmd) {
    emulateCommand(cmd);
}
function freeCharacter(index, rejoined = false) {
    if (index == 0) {
        console.error("can't release main character");
        return false;
    }
    if (index > 3) {
        console.error("Invalid index");
        return false;
    }
    let p = getCharacter(index);
    p.name = p.default;
    if (rejoined) {
        indexRole = index - 1;
        bot.message(`/me le rôle de ${role[indexRole].name} est disponnible faite #joined`);
    }
    return (`${p.type} is now free`);

}
function emulateCommand(cmd) {
    let command = cmd.split(' ')
    switch (command[0]) {
        case "Vote": {
            debugger;
            let currentVote = VoteManager.CURRENTVOTE;
            if (currentVote == null) {
                console.error("No vote system initiate");
            }
            currentVote.setVote("Anonymous", command[1]);
            break;
        }
        case "Echo": {
            let c = getCharacterByType("voleur");
            if (c.length == 1) {
                findPlayer(c[0]);
            }
            break;
        }
    }
}
async function onRaid(channel, username, viewers) {
    bot.message("/me Bienvenue @" + username + " ainsi que ses " + viewers + " viewers, installez-vous et profitez bien du show");
    if (enemyFront == null) {
        e = getEnemy('raider');
        e.name = username
        e.exp = viewers;
        const { dir, frontX, frontY } = getCurrentDirection(player);
        showTemporaryMessage(`${username} a débarqué dans le donjon !!`, 3000).then(() => {
            e.x = frontX;
            e.y = frontY;
        })
    } else {
        dammage = 10;
        if (viewers > 10) {
            dammage += (viewers - 10);
        } else {
            dammage += viewers;
        }
        enemyFront.exp += viewers;
        const containerMessage = document.querySelector(".container");
        const displayMessage = (text, duration, onDisplay) => {
            return new Promise((resolve) => {
                const messageBox = new MessageBox(text, containerMessage);
                if (onDisplay) messageBox.setDisplay(onDisplay);
                messageBox.display(duration).then(resolve);
            });
        };
        await displayMessage(`Soudain, alors que la situation semblait despérée, tels des feux follets amicaux, ${username} et ses viewers debarquèrent de derière nos héros`, 10000);
        await displayMessage(`Au loin leur voix résonnaient &laquo;Tenez bon les amis&raquo; s'écria t-ils et sur ses mots, ils se ruèrent alors vers ${enemyFront.name}`, 10000);
        await displayMessage(`&laquo; Quoi !!!, Non !!! Comment osez-vous vous en prendre après moi !!! allez vous en !!! &raquo; hurla ${enemyFront.name}`, 5000, () => {
            enemyFront.health -= dammage;
            sndManager.playSound("MagicWave3");
            showTemporaryMessage(`${enemyFront.name} perd ${dammage} PV`);
        });

    }

}