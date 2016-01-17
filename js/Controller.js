/**
 * Created by Haritz Medina on 14/01/2016.
 */

var GCPlayerController = function (){
    "use strict";

};

GCPlayerController.prototype.init = function(){
    "use strict";
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