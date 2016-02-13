/**
 * Created by Haritz Medina on 14/01/2016.
 */

var GCPlayerView = function (){};

GCPlayerView.prototype.init = function () {
    "use strict";

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