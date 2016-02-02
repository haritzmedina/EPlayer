/**
 * Created by Haritz Medina on 14/01/2016.
 */

var GCPlayerModel = function (){};

GCPlayerModel.prototype.init = function (view) {
    "use strict";
    // Load library from storage
    this.getParams('library.directory', function(folderLink){
        // Retrieve folder
        if(folderLink['library.directory']!==null){
            chrome.fileSystem.restoreEntry(folderLink['library.directory'], function(entryDir){
                // Read restored folder
                window.GCPlayer.model.readFolder(entryDir);
            });
        }
        else{
            // TODO Set view as empty library
            debugger;
        }

    });

    // TODO Start view
    window.GCPlayer.view.init();
};

GCPlayerModel.prototype.readFolder = function(entry_folder){
    "use strict";
    var dirReader = entry_folder.createReader();
    var songs = this.songs;
    var readEntries = function(){
        dirReader.readEntries(function(results){
            debugger;
            if(results.length){
                for(var i=0; i<results.length;i++){
                    songs.push(new Song(results[i]));
                }
                readEntries();
            }
            else{
                window.GCPlayer.model.saveSongs(songs);
                // TODO print songs
                window.GCPlayer.view.displaySongs(songs);
            }
        });
    };
    readEntries();
};

GCPlayerModel.prototype.saveFolderPointer = function(folderPointer){
    "use strict";
    chrome.storage.sync.set({'musicFolderPointer': folderPointer}, function(){ console.log('Folder saved.');});
};

GCPlayerModel.prototype.getSongs = function(){
    "use strict";
    if(this.songs !== null){
        return this.songs;
    }
    else{
        var songs = this.songs;
        chrome.storage.sync.get('songs', function(data){
            songs = data.songs;
        });
        return this.songs;
    }
};

GCPlayerModel.prototype.songs = [];

GCPlayerModel.prototype.saveSongs = function(songs){
    "use strict";
    // TODO Check storage is enabled
    if (typeof(Storage) !== "undefined") {
        // Store
        this.setParams({'songs': songs});
    }
};

GCPlayerModel.prototype.playSong = function(fileRef){
    "use strict";
    fileRef.file(function(file){
        console.log(file);
        var reader = new FileReader();
        reader.onload = function(){
                var dataURL = reader.result;
                window.GCPlayer.view.playSong(dataURL);
            };
        reader.readAsDataURL(file);
    });
};

// Chrome storage functions
GCPlayerModel.prototype.setParams = function (x, wantSync) {
    var storageArea = wantSync ? chrome.storage.sync : chrome.storage.local;
    storageArea.set(x,
        function () {
            if (chrome.runtime.lastError)
                console.log(chrome.runtime.lastError);
        }
    );
};

GCPlayerModel.prototype.getParams = function (x, callback, wantSync) {
    var storageArea = wantSync ? chrome.storage.sync : chrome.storage.local;
    storageArea.get(x,
        function (items) {
            if (chrome.runtime.lastError)
                console.log(chrome.runtime.lastError);
            else
                callback(items);
        }
    );
};


var Song = function(file){
    "use strict";
    this.file = file;
};