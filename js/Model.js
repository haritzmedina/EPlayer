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
            if(results.length){
                var fileExtensionRegEx = /(?:\.([^.]+))?$/;
                for(var i=0; i<results.length;i++){
                    var extension = fileExtensionRegEx.exec(results[i].name);
                    if(extension[0]===".mp3"){
                        songs.push(new Song(results[i]));
                    }
                }
                readEntries();
            }
            else{
                window.GCPlayer.model.saveSongs(songs);
                // TODO print songs
                window.GCPlayer.view.displaySearchSongs(songs);
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

GCPlayerModel.prototype.playSong = function(song){
    "use strict";
    // TODO current song view update
    this.playSongFile(song.file);
};

GCPlayerModel.prototype.playSongFile = function(fileRef){
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
GCPlayerModel.prototype.playlist.current = -1; // Playing song index
GCPlayerModel.prototype.playlist.repeatMode = 0; // 0: none, 1: playlist


GCPlayerModel.prototype.playlist.playNextSong = function(){
    "use strict";
    var song = this.nextSong(); // Retrieve the next song
    window.GCPlayer.model.playSong(song); // Play the song
    this.nextSongIndex(); // Update the index
};

GCPlayerModel.prototype.playlist.nextSongIndex = function(){
    "use strict";
    if(this.songs.length===0){
        this.current = -1;
    }
    else{
        if(this.current<this.songs.length-1){
            this.current += 1;
        }
        else{
            if(this.repeatMode===0){
                this.current = -1;
            }
            else{
                this.current = 0;
            }
        }
    }
};

GCPlayerModel.prototype.playlist.nextSong = function(){
    "use strict";
    var nextSongIndex = this.current+1;
    if(typeof this.songs[nextSongIndex] === 'undefined') { // Is the last song or empty playlist
        if(this.repeatMode===0) {
            return null;
        }
        else {
            if (this.songs.length === 0) {
                return null;
            }
            else {
                return this.songs[0];
            }
        }
    }
    else {
        return this.songs[nextSongIndex];
    }
};

GCPlayerModel.prototype.playlist.hasNextSong = function(){
    "use strict";
    var nextSongIndex = this.current+1;
    if(this.repeatMode===0){
        return typeof this.songs[nextSongIndex] !== 'undefined';
    }
    else{
        return true;
    }
};

GCPlayerModel.prototype.playlist.playPreviousSong = function(){
    "use strict";
    var song = this.previousSong(); // Retrieve the previous song
    window.GCPlayer.model.playSong(song); // Play the song
    this.previousSongIndex(); // Update the index
};

GCPlayerModel.prototype.playlist.hasPreviousSong = function(){
    "use strict";
    var previousSongIndex = this.current-1;
    if(this.repeatMode===0){
        return typeof this.songs[previousSongIndex] !== 'undefined';
    }
    else{
        return true;
    }
};

GCPlayerModel.prototype.playlist.previousSong = function(){
    "use strict";
    var previousSongIndex = this.current-1;
    if(typeof this.songs[previousSongIndex] === 'undefined') { // Is the last song or empty playlist
        if(this.repeatMode===0) {
            return null;
        }
        else {
            if (this.songs.length === 0) {
                return null;
            }
            else {
                return this.songs[this.songs.length-1];
            }
        }
    }
    else {
        return this.songs[previousSongIndex];
    }
};

GCPlayerModel.prototype.playlist.previousSongIndex = function(){
    "use strict";
    if(this.songs.length===0){
        this.current = -1;
    }
    else{
        if(this.current>0){
            this.current -= 1;
        }
        else{
            if(this.repeatMode===0){
                this.current = -1;
            }
            else{
                this.current = this.songs.length-1;
            }
        }
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
                window.GCPlayer.model.playSong(this.songs[this.current]);
            }
        }
    }
};


var Song = function(file){
    "use strict";
    this.file = file;
};