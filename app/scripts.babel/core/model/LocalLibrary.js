'use strict';

const Library = require('./Library');
const FileManager = require('../../io/FileManager');
const Logger = require('../../io/Logger');
const LanguageUtils = require('../../utils/LanguageUtils');
const DataUtils = require('../../utils/DataUtils');
const SongFile = require('./SongFile');

class LocalLibrary extends Library{

  constructor(absolutePath){
    super(absolutePath, absolutePath);
    this.absolutePath = absolutePath;
  }

  init(callback){
    // Read library
    this.readLibrary(()=>{
      // Print songs in library panel
      callback();
    });
  }

  readLibrary(callback){
    // Read local library
    FileManager.readFolder(this.source, {fileExtension: '.mp3'}, (files)=>{
      let songs = [];
      let promises = [];
      for(let i=0;i<files.length;i++){
        // The id of the song is: libraryId+'#'+fullPath (of the song)
        let songId = this.id+'#'+files[i].fullPath;
        // TODO Check if song is already added (and not changed)
        let filteredSavedSongs = DataUtils.queryByExample(this.songs, {id: songId});
        let savedSong = {};
        if(filteredSavedSongs.length>0){
          savedSong = filteredSavedSongs[0];
        }
        // If song is not saved (or changed), retrieve its info
        if(LanguageUtils.isEmptyObject(savedSong)){
          promises.push(new Promise((resolve, reject) =>{
            SongFile.readSongFileMetadata(files[i], (error, songMetadata)=>{
              if(error){
                Logger.log(error);
                resolve();
              }
              else{
                songs.push(new SongFile(songId, files[i], songMetadata));
                resolve();
              }
            });
          }));
        }
        // If song doesn't change, just cast to SongFile
        else{
          songs.push(new SongFile(songId, files[i], savedSong));
        }
      }
      Promise.all(promises).then(()=>{
        this.songs = songs;
        if(LanguageUtils.isFunction(callback)){
          callback();
        }
      });
    });
  }

  loadLibrary(callback){
    // Read library from file system
    this.readLibrary(()=>{
      Logger.log(this.songs);
      // Print library in interface
      this.printLibrary(callback);
    });

  }

  printLibrary(callback){
    super.printLibrary(callback);
  }

}

module.exports = LocalLibrary;