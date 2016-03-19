/**
 * Created by Haritz Medina on 14/01/2016.
 */

var GCPlayerController = function (){
    "use strict";
};

GCPlayerController.prototype.init = function(){
    "use strict";
    this.initHandlers();
    window.GCPlayer.model.init();
};

GCPlayerController.prototype.setMusicDirectory = function(){
    "use strict";
    chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(dirEntry){
        // Save new folder reference on model
        var folderPointer = chrome.fileSystem.retainEntry(dirEntry);
        // TODO retrieve and save localpath and entrypoint
        chrome.fileSystem.getDisplayPath(dirEntry, function(absolutePath){
            window.GCPlayer.model.library.addFolder(folderPointer, absolutePath);
        });
        window.GCPlayer.model.library.loadFolder(folderPointer);
    });
};

GCPlayerController.prototype.play = function(song){
    "use strict";
    window.GCPlayer.model.playSong(song);
};

GCPlayerController.prototype.initHandlers = function(){
    "use strict";

    // Progress bar handlers
    var player = document.getElementById('player');
    var playerProgressbar = document.getElementById('playerProgressBar');
    // Update progress bar on timeupdate
    player.addEventListener('timeupdate', function(event){
        window.GCPlayer.view.player.updatePlayingSeconds(Math.floor(player.currentTime));
    });
    // Set max progress bar value when song loaded
    player.addEventListener('loadedmetadata', function(){
        window.GCPlayer.view.player.setMaxPlayingSeconds(Math.floor(player.duration));
    });
    playerProgressbar.addEventListener('click', function(event){
        // Get value on progress bar
        var x = event.pageX - this.offsetLeft,
            y = event.pageY - this.offsetTop,
            clickedValue = x * this.max / this.offsetWidth;
        // Move the playing song
        window.GCPlayer.view.player.setCurrentTime(clickedValue);
    });


    // Music player handlers
    player.addEventListener('ended', function(event){
        window.GCPlayer.controller.player.playNextSong();
    });

    // Multimedia keys
    chrome.commands.onCommand.addListener(function(command){
        if(command==="playPause"){
            window.GCPlayer.controller.player.playPause();
        }
        if(command==="nextSong"){
            window.GCPlayer.controller.player.playNextSong();
        }
        if(command==="previousSong"){
            window.GCPlayer.controller.player.playPreviousSong();
        }
    });
};

GCPlayerController.prototype.player = {};

GCPlayerController.prototype.player.playPause = function(){
    "use strict";
    window.GCPlayer.view.player.playPause();
};

GCPlayerController.prototype.player.playNextSong = function(){
    "use strict";
    if(window.GCPlayer.model.playlist.hasNextSong()){
        window.GCPlayer.model.playlist.playNextSong();
    }
};

GCPlayerController.prototype.player.playPreviousSong = function(){
    "use strict";
    if(window.GCPlayer.model.playlist.hasPreviousSong()){
        window.GCPlayer.model.playlist.playPreviousSong();
    }
};