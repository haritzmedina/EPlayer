/**
 * Created by Haritz Medina on 14/01/2016.
 */

var GCPlayerView = function (){};

GCPlayerView.prototype.init = function () {
    "use strict";
    this.player.init();
};

GCPlayerView.prototype.playSong = function(song, url){
    "use strict";
    // Play song
    this.player.playerInstance.src = url;
    this.player.play();
    // Display song info
    // Display notification
    // Display song info in playerWrapper
    var infoContainer = document.getElementById("playingSongInfo");
    infoContainer.querySelector("#artist").innerText = song.artist;
    infoContainer.querySelector("#title").innerText = song.title;
    infoContainer.querySelector("#album").innerText = song.album;
};

GCPlayerView.prototype.displaySearchSongs = function(songs){
    "use strict";
    console.log("Displaying songs");
    var resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = ""; // Clean space
    for(var i=0;i<songs.length;i++){
        var song = songs[i];
        this.displaySong(song, resultsDiv);
    }
};

GCPlayerView.prototype.displaySong = function(song, container){
    "use strict";
    var div = document.createElement('div');
    div.classList.add('songElement');
    div.textContent = song.artist+"-"+song.title;
    container.appendChild(div);
};

//// Player controls

GCPlayerView.prototype.player = {};
GCPlayerView.prototype.player.progressBar = null;
GCPlayerView.prototype.player.playerTimeValue = null;
GCPlayerView.prototype.player.playerTimeMax = null;
GCPlayerView.prototype.player.playerInstance = null;

GCPlayerView.prototype.player.init = function(){
    "use strict";
    this.progressBar = document.getElementById('playerProgressBar');
    this.playerTimeValue = document.getElementById('playerTimeValue');
    this.playerTimeMax = document.getElementById('playerTimeMax');
    this.playerInstance = document.getElementById("player");
};

GCPlayerView.prototype.player.playPause = function(){
    "use strict";
    if(this.playerInstance.paused===true){
        this.playerInstance.play();
    }
    else{
        this.playerInstance.pause();
    }
    this.showHidePlayPauseButton();
};

GCPlayerView.prototype.player.play = function(){
    "use strict";
    if(this.playerInstance.paused===true){
        this.playerInstance.play();
    }
    this.showHidePlayPauseButton();
};

GCPlayerView.prototype.player.pause = function(){
    "use strict";
    if(this.playerInstance.paused===false){
        this.playerInstance.pause();
    }
    this.showHidePlayPauseButton();
};

GCPlayerView.prototype.player.setCurrentTime = function(seconds){
    "use strict";
    if(this.playerInstance.duration<seconds && seconds < 0){
        return null;
    }
    else{
        this.playerInstance.currentTime = seconds;
    }
};

GCPlayerView.prototype.player.updatePlayingSeconds = function(seconds){
    "use strict";
    this.progressBar.value = seconds;
    this.playerTimeValue.textContent = this.toMinuteSecondsFormat(seconds);
};

GCPlayerView.prototype.player.setMaxPlayingSeconds = function(seconds){
    "use strict";
    this.progressBar.max = seconds;
    this.playerTimeMax.textContent = this.toMinuteSecondsFormat(seconds);
};

GCPlayerView.prototype.player.toMinuteSecondsFormat = function(seconds){
    "use strict";
    var time = "";
    var hours = Math.floor(seconds / 3600);
    if(hours>0){
        time += hours+":";
    }
    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    var secs = seconds % 60;
    secs = secs >= 10 ? secs : "0"+secs;
    if(minutes < 10){
        time += "0"+minutes+":"+secs;
    }
    else{
        time += minutes+":"+secs;
    }
    return time;
};

GCPlayerView.prototype.player.showHidePlayPauseButton = function(){
    "use strict";
    var playButton = document.getElementById('play');
    var pauseButton = document.getElementById('pause');
    if(this.playerInstance.paused===true){
        playButton.dataset.enabled = true;
        pauseButton.dataset.enabled = false;
    }
    else{
        playButton.dataset.enabled = false;
        pauseButton.dataset.enabled = true;
    }
};