/**
 * Created by Haritz Medina on 14/01/2016.
 */

var GCPlayerModel = function (){};

GCPlayerModel.prototype.storage = {};

GCPlayerModel.prototype.storage.libraryFolder = "library.folders";
GCPlayerModel.prototype.storage.librarySongs = "library.songs";

/**
 * Initialization of model class (load configuration and prepare model environment)
 * @param view
 */
GCPlayerModel.prototype.init = function (view) {
    "use strict";
    // Create user configs if not exists
    this.setInitialModel();

    // Load user configs (library, etc.)
    this.loadSavedModel();

    // Start view
    window.GCPlayer.view.init();
};

GCPlayerModel.prototype.setInitialModel = function(){
    "use strict";
    // Library folders
    this.getParams(window.GCPlayer.model.storage.libraryFolder, function(result){
        if(jQuery.isEmptyObject(result)){
            window.GCPlayer.model.setParams({"library.folders" : []});
        }
    });

    // Library songs
    this.getParams(window.GCPlayer.model.storage.librarySongs, function(result){
        if(jQuery.isEmptyObject(result)){
            window.GCPlayer.model.setParams({"library.songs" : {}});
        }
    });
};

/**
 * Load in javascript the configuration saved by user in last session.
 */
GCPlayerModel.prototype.loadSavedModel = function(){
    "use strict";
    // Load library folders with its songs
    this.getParams(window.GCPlayer.model.storage.libraryFolder, function(result){
        var folders = result[window.GCPlayer.model.storage.libraryFolder];
        for(var i=0;i<folders.length;i++){
            var folder = folders[i];
            window.GCPlayer.model.library.loadFolder(folder);
        }
    });
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

GCPlayerModel.prototype.playSong = function(song){
    "use strict";
    // TODO current song view update
    this.playSongFile(song.file);
};


GCPlayerModel.prototype.library = {};

GCPlayerModel.prototype.library.songs = {};

/**
 * Library data smodel
 * @type {{Library}}
 */
GCPlayerModel.prototype.library.loadFolder = function(libraryFolder){
    "use strict";
    var folder = libraryFolder;
    chrome.fileSystem.restoreEntry(libraryFolder.folderPoint, function(entryFolder){
        var dirReader = entryFolder.createReader();
        var songs = [];
        var readEntries = function(){
            dirReader.readEntries(function(results){
                if(results.length){
                    var fileExtensionRegEx = /(?:\.([^.]+))?$/;
                    for(var i=0; i<results.length;i++){
                        var extension = fileExtensionRegEx.exec(results[i].name);
                        if(extension[0]===".mp3"){
                            songs.push(results[i]);
                        }
                    }
                    readEntries();
                }
                else{
                    window.GCPlayer.model.library.updateSongs(songs, folder);
                    // TODO Display songs in library container
                }
            });
        };
        readEntries();
    });

};

GCPlayerModel.prototype.library.addFolder = function(libraryFolder, libraryPath){
    "use strict";
    var folderPoint = libraryFolder, folderPath = libraryPath;
    window.GCPlayer.model.getParams("library.folders", function(result){
        // Check if folder already is added
        var storedFolders = result["library.folders"];
        for(var i=0;i<storedFolders.length;i++){
            var folder = storedFolders[i];
            if(folder.absolutePath===folderPath){
                return;
            }
        }
        // If folder is not added, add and save it to chrome storage
        storedFolders.push(new Folder(folderPoint, folderPath));
        window.GCPlayer.model.setParams({"library.folders" : storedFolders}, false);
    }, false);
};

GCPlayerModel.prototype.library.updateSongs = function(songs, libraryFolder){
    "use strict";
    var songList = songs, folder = libraryFolder;
    window.GCPlayer.model.getParams(window.GCPlayer.model.storage.librarySongs, function(result){
        var storedSongs = result[window.GCPlayer.model.storage.librarySongs];
        // Check if a song is updated
        for(var i=0; i<songList.length;i++){
            var songEntry = songList[i];
            var songId = folder.absolutePath+"#"+songEntry.name;
            // Exist song id
            if(storedSongs[songId]===undefined){
                storedSongs[songId] = new Song(songEntry.name, folder.absolutePath, songEntry, "Unknown", "Unknown");
            }
            else{
                // Add pointer to file
                storedSongs[songId].file = songEntry;
                // TODO Check if file changed since last update
                /*var storedSongDate = storedSongs[songId].lastUpdatedDate;
                songEntry.file.getMetadata(function(result){
                    debugger;
                });*/
            }
            // Retrieve ID3 tags
            /*songEntry.file(function(file){
                var reader = new FileReader();
                reader.onload = function(){
                    var dataURL = reader.result;
                    jsmediatags.read(dataURL, {
                        onSuccess: function(tag) {
                        },
                        onError: function(error) {
                            console.log(error);
                        }
                    }, function(err){console.log(err);debugger;});
                };
                reader.readAsDataURL(file);

            });*/
            songEntry.file(function(file) {
                id3(file, function (err, tags) {
                    console.log(file.name, err, tags);
                });
            });
        }
        // TODO Check if a song is missing in every library folder

        // Save songs in local storage and make it accesible
        window.GCPlayer.model.setParams({"library.songs": storedSongs}, false);
        window.GCPlayer.model.library.songs = storedSongs;
    });
};

GCPlayerModel.prototype.library.getSongArray = function() {
    "use strict";
    var arr = [];
    for (var key in this.songs) {
        arr.push(this.songs[key]);
    }
    return arr;
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


var Song = function(filename, folder, file, track, artist, updatedDate){
    "use strict";
    this.file = file;
    this.filename = filename;
    this.folder = folder;
    this.artist = artist;
    this.track = track;
    this.lastUpdatedDate = updatedDate;
};

var Folder = function(folderPoint, absolutePath){
    "use strict";
    this.folderPoint = folderPoint;
    this.absolutePath = absolutePath;
};