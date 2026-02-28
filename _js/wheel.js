//Il faudra récupérer les secteur en async dans weel.json
/*const sectors = [
    { color: '#f82', label: 'Stack' },
    { color: '#0bf', label: '10' },
    { color: '#fb0', label: '200' },
    { color: '#0fb', label: '50' },
    { color: '#b0f', label: '100' },
    { color: '#f0b', label: '5' },
    { color: '#bf0', label: '500' }
];*/
var sectors = [];
var arc = 0;
var spined = false;
async function getSector() {
    let response = await fetch("Ressource/wheels.json", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    let result = await response.json();
    return (result);
}
//Fonction fléché qui génére un chiffre aléatoire entre m et M
const rand = (m, M) => Math.random() * (M - m) + m
var tot = 0
const spinEl = document.querySelector('#spin');
const sectorSelect = document.getElementById("value");
const ctx = document.querySelector('#wheel').getContext('2d')
const dia = ctx.canvas.width
const rad = dia / 2
const PI = Math.PI
const TAU = 2 * PI

var player = "";
const friction = 0.993 // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0 // Angular velocity
let ang = 0 // Angle in radians

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot
function drawSector(sector, i) {
    const ang = arc * i
    ctx.save()
    // COLOR
    ctx.beginPath()
    ctx.fillStyle = sector.color
    ctx.moveTo(rad, rad)
    ctx.arc(rad, rad, rad, ang, ang + arc)
    ctx.lineTo(rad, rad)
    ctx.fill()
    // TEXT
    ctx.translate(rad, rad)
    ctx.rotate(ang + arc / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = (sector.font != undefined) ? sector.font : '#fff'
    ctx.font = sector.fontStyle
    ctx.fillText(sector.label, rad - 10, 10)
    //
    ctx.restore()
}

function rotate() {
    const sector = sectors[getIndex()];
    ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
    spinEl.textContent = !angVel ? 'SPIN' : sector.label;
    sectorSelect.textContent = sector.label;
    spinEl.style.background = sector.color;
    spinEl.style.fontSize = (sector.label.length > 8) ? "15px" : "20px";

    if (!angVel && spined) {
        
        sectorSelect.textContent = sector.label;
        sectorSelect.style.color = (sector.font != undefined) ? sector.font : "#FFF";

        setTimeout(function () {
          //  debugger;
            wheel.style.display = "none";
            let i = sector.index * 1;
            let a = library[i].files;
            state.theme=library[i].theme;
            if (a && a.length > 1)
                lib = a[getRandomInt(a.length-1)];
            else if (a)
                lib = a[0];
            else
                lib = undefined; // Handle case where library[i] is undefined

            if (lib) {
                const path = "Library/" + lib;

                // Check if the file exists before calling getQuizz
                fetch(path, { method: 'HEAD' }) // 'HEAD' request just checks if the file exists without downloading it
                    .then(response => {
                        if (response.ok) {
                            console.log("File exists: " + path);
                            getQuizz(path); // Trigger the quiz if the file exists
                        } else {
                            _alert("Une erreur s'est produite mince ")
                            spinEl.style.display = "flex";
                            console.error("File not found: " + path);
                        }
                    })
                    .catch(error => {
                        _alert("Une erreur s'est produite mince ")
                        spinEl.style.display = "flex";
                        console.error("Error fetching file: ", error);
                    });
            } else {
                console.error("Library is undefined or empty.");
            }

        }, 3000);

        if (player != "")
            bot.message("/me " + player + ", tu gagnes " + sector.label);
    }
}


function frame() {
    if (!angVel) return
    angVel *= friction // Decrement velocity by friction
    if (angVel < 0.002) angVel = 0 // Bring to stop
    ang += angVel // Update angle
    ang %= TAU // Normalize angle
    rotate()
}

function engine() {
    frame()
    requestAnimationFrame(engine)
}


function init() {
    sectors.forEach(drawSector)
    rotate() // Initial rotation
    engine() // Start engine
    spinEl.addEventListener('click', () => {
        spined = true;
        if (!angVel) angVel = rand(0.25, 0.45)
    })
}
getSector().then(data => {
    tot = data.length;
    arc = TAU / data.length
    sectors = data;
    init();
});