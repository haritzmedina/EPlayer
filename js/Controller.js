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
        window.GCPlayer.model.setParams({'library.directory': folderPointer});
        // Read folder
        window.GCPlayer.model.readFolder(dirEntry);
    });
};

GCPlayerController.prototype.play = function(song){
    "use strict";
    window.GCPlayer.model.playSong(song);
};

GCPlayerController.prototype.initHandlers = function(){
    "use strict";
    // Progress bar handlers
    var playerProgressBar = document.getElementById('playerProgressBar');
    var player = document.getElementById('player');
    // Update progress bar on timeupdate
    player.addEventListener('timeupdate', function(event){
        console.log();
        playerProgressBar.value = Math.floor(player.currentTime);
    });
    // Set max progress bar value when song loaded
    player.addEventListener('loadedmetadata', function(){
        playerProgressBar.max = player.duration;
    });
};