class GameBot {
    constructor(username, channels, container, ignore = [], secret = 'je637klvvxqnfhjoomumuh6eygcr8c') {
        this.cmd = {};  // Changement : utilisation d'un objet pour stocker les commandes
        this.ignore = ignore;
        this.init = null;
        this.onMessageHandler = null;
        this.container = container;
        this.channel = channels[0];
        this.created = typeof tmi === 'object';

        if (this.created) {
            this.client = new tmi.Client({
                options: { debug: true },
                identity: {
                    username: username,
                    password: `oauth:${secret}`
                },
                channels: channels
            });
        } else {
            console.error("No tmi library Found");
        }
    }

    setInit(fnc) {
        this.init = fnc;
    }

    message(message, channel = undefined) {
        let c = channel || this.channel;
        if (this.created) {
            this.client.say(c, `${message}`);
        } else {
            console.error("GameBot can't post message : No instance of tmi client");
        }
    }

    isIgnore(username) {
        return this.ignore.includes(username);
    }

    setIgnore(username) {
        this.ignore.push(username);
    }

    setCommand(cmd, callback) {
        if (typeof cmd === "string") {
            cmd = cmd.toLowerCase();
            if (this.cmd[cmd]) {
                console.error(`${cmd} already exists in current commands`);
                return false;
            }
            this.cmd[cmd] = callback;
            console.info(`${cmd} has been added.`);
            return;
        }

        cmd.forEach(element => {
            element = element.toLowerCase();
            if (this.cmd[element]) {
                console.error(`${element} already exists in current commands`);
                return;
            }
            this.cmd[element] = callback;
        });
    }

    getBot() {
        return this.client;
    }

    onMessage(handler) {
        if (typeof handler === "function") {
            this.onMessageHandler = handler;
        } else {
            console.error("onMessage handler must be a function");
        }
    }

    async readFile(file) {
        let response = await fetch('ajax.php?act=readFile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ file })
        });
        return await response.json();
    }

    async writeFile(file, msg) {
        let response = await fetch('ajax.php?act=fileWrite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ file, message: msg })
        });
        let result = await response.json();
        return result.message;
    }

    openBot() {
        if (!this.created) {
            console.error("GameBot can't open, No instance of tmi client");
            return;
        }

        this.client.connect();
        this.client.on('message', (channel, tags, message, self) => {
            if (self || this.isIgnore(tags.username)) return;

            const args = message.split(' ');
            const command = args.shift().toLowerCase();

            // Exécuter le gestionnaire onMessage s'il est défini
            if (typeof this.onMessageHandler === "function") {
      
                this.onMessageHandler(this, args, tags, channel);
            }

            if (this.cmd.hasOwnProperty(command)) {
                this.cmd[command].call(this, args, tags, channel);
            }
        });
    }
}
