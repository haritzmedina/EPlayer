/**
 * Created by Haritz Medina on 14/01/2016.
 */

var GCPlayerView = function (){};

GCPlayerView.prototype.init = function () {
    "use strict";
    this.player.init();
};

GCPlayerView.prototype.playSong = function(url){
    "use strict";
    // Play song
    var player = document.getElementById('player');
    player.src = url;
    player.play();
};

GCPlayerView.prototype.displaySongs = function(songs){
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
    div.textContent = song.file.name;
    container.appendChild(div);
};

//// Player controls

GCPlayerView.prototype.player = {};
GCPlayerView.prototype.player.progressBar = null;
GCPlayerView.prototype.player.playerTimeValue = null;
GCPlayerView.prototype.player.playerTimeMax = null;

GCPlayerView.prototype.player.init = function(){
    "use strict";
    this.progressBar = document.getElementById('playerProgressBar');
    this.playerTimeValue = document.getElementById('playerTimeValue');
    this.playerTimeMax = document.getElementById('playerTimeMax');
};

GCPlayerView.prototype.player.playPause = function(){
    "use strict";
    var player = document.getElementById("player");
    if(player.paused===true){
        player.play();
    }
    else{
        player.pause();
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
    time += minutes+":"+secs;
    return time;
};