
function initSounds()
{
   /* Sound.sndSlash = document.getElementById("slash");
    Sound.sndChrono = document.querySelectorAll("[name=chrono]");*/
    Sound.sndWin = document.getElementById("win");
    Sound.sndLoose = document.getElementById("loose");
//    Sound.sndExtact = document.getElementById("Extract");
    setSoundsVolume(Sound.soundVolume);
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function playExtract(){
  Sound.sndExtact.currentTime=0;
  Sound.sndExtact.play();
}
function stopExtract(){
  if(Sound.sndExtract!=undefined)
    Sound.sndExtract.pause();
}
function playSlash(){
  Sound.sndSlash.currentTime = 0;
  Sound.sndSlash.play();
}
function playGlasses(){
  sndGlasses.currentTime = 0;
    sndGlasses.play();
}
function playChrono(){
  Sound.sndChrono.forEach(el=>{el.classList.remove("playing")})
  state.indexChrono= getRandomInt(4)
  Sound.sndChrono[state.indexChrono].currentTime=0;
  Sound.sndChrono[state.indexChrono].play();
  Sound.sndChrono[state.indexChrono].classList.add("playing");
}
function playWin(){
  Sound.sndWin.currentTime = 0;
    Sound.sndWin.play();
}
function playLoose(){
  Sound.sndLoose.currentTime = 0;
    Sound.sndLoose.play();
}
function setSoundsVolume()
{
 /*   sndSlash.volume = parseFloat(soundVolume / 100);
    sndGlasses.volume = parseFloat(soundVolume / 100);*/
    Sound.sndWin.volume = parseFloat(Sound.soundVolume / 100);
    Sound.sndLoose.volume = parseFloat(Sound.soundVolume / 100);
}
