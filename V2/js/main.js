window.addEventListener("load", function () {
  document.querySelectorAll("[g_area]").forEach(el => {
    el.style["grid-area"] = el.getAttribute("g_area");
  });
});
var Sound = {
    soundVolume: 100,
    sndSlash: null,
    sndGlasses: null,
    sndWin: null,
    sndLoose: null,
    sndExtract: null,
    sndChrono: null
}
function initParam() {
    votes = [];
    state.cptVote = 0;
    chat = document.querySelector("#chat>section");
    Array.from(document.querySelectorAll('[data-val]')).forEach(el => {
        el.innerHTML = 0;
    });
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
function setPercent(val) {
    let alpha = "ABCD";
    var el = document.querySelectorAll(".questionElement ol li span");
    el.forEach((item, index) => {
        //  debugger;
        let v = document.querySelector('[data-val=' + alpha[index] + ']').innerHTML * 1;
        prct = Math.floor((v / game.cptVote) * 100);
        item.innerHTML = `${prct} %`;
    })
}