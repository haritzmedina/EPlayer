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
            if (chrome.runtime.lastError){
                console.log(chrome.runtime.lastError);
            }
        }
    );
};

GCPlayerModel.prototype.getParams = function (x, callback, wantSync) {
    var storageArea = wantSync ? chrome.storage.sync : chrome.storage.local;
    storageArea.get(x,
        function (items) {
            if (chrome.runtime.lastError){
                console.log(chrome.runtime.lastError);
            }
            else{
                callback(items);
            }
        }
    );
};


/* Playlist manager */
GCPlayerModel.prototype.playlist = {};

GCPlayerModel.prototype.playlist.songs = [];
GCPlayerModel.prototype.playlist.current = -1;

GCPlayerModel.prototype.playlist.nextSong = function(){
    "use strict";
    var nextSongIndex = this.current+1;
    if(typeof this.songs[nextSongIndex] === 'undefined'){
        // Song not exists
        console.log("Playlist not started");
        return null;
    }
    else{
        // Play song
        var song = this.songs[nextSongIndex];
        window.GCPlayer.model.playSong(song.file);
        // Update the index
        this.current = this.current+1;
    }
};

GCPlayerModel.prototype.playlist.createRandom = function(songs, autoplay){
    "use strict";
    autoplay = autoplay || false;

    // Create a shuffle songs array
    var shuffleSongs = Array.apply(undefined,songs);
    var i, j, temp;
    for (i = shuffleSongs.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = shuffleSongs[i];
        shuffleSongs[i] = shuffleSongs[j];
        shuffleSongs[j] = temp;
    }
    // Create a new playlist
    if(autoplay === null){
        autoplay = false;
    }
    this.create(shuffleSongs, autoplay);
};

/**
 * Create a new playlist with the given songs
 * @param songs Given songs of the new
 * @param autoplay
 */
GCPlayerModel.prototype.playlist.create = function(songs, autoplay){
    "use strict";
    autoplay = autoplay || false;
    if(songs instanceof Array){
        if(songs.length>0){
            this.songs = songs;
            this.current = 0;
            if(autoplay){
                window.GCPlayer.model.playSong(this.songs[this.current].file);
            }
        }
    }
};


var Song = function(file){
    "use strict";
    this.file = file;
};