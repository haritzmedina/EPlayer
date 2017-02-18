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
      let readFileCallbacks = [];
      for(let i=0;i<files.length;i++){
        let file = files[i];
        let songId = this.id+'#'+file;
        // TODO Check if song is already added (and not changed)
        let filteredSavedSongs = DataUtils.queryByExample(this.songs, {id: songId});
        let savedSong = {};
        if(filteredSavedSongs.length>0){
          savedSong = filteredSavedSongs[0];
        }
        // If song is not saved (or changed), retrieve its info
        if(LanguageUtils.isEmptyObject(savedSong)){
          if(readFileCallbacks.length<=0){
            readFileCallbacks.push(this.retrieveReadLocalFileHandler(file, songs, ()=>{
              this.songs = songs;
              if(LanguageUtils.isFunction(callback)){
                callback();
              }
            }));
          }
          else{
            readFileCallbacks.push(
              this.retrieveReadLocalFileHandler(file, songs, readFileCallbacks[readFileCallbacks.length-1])
            );
          }
        }
        // If song doesn't change, just cast to SongFile
        else{
          songs.push(new SongFile(songId, files[i], savedSong));
        }
      }
      if(readFileCallbacks.length>0){
        readFileCallbacks[readFileCallbacks.length-1]();
      }
      else{
        this.songs = songs;
        if(LanguageUtils.isFunction(callback)){
          callback();
        }
      }
    });
  }

  retrieveReadLocalFileHandler(file, songsArray, callback){
    // TODO Dispatch event with the progression of reading files
    let songId = this.id+'#'+file;
    return ()=>{
      SongFile.readSongFileMetadata(file, (error, songMetadata)=>{
        if(error){
          Logger.log(error);
        }
        else{
          console.log('Readed '+file);
          songsArray.unshift(new SongFile(songId, file, songMetadata));
        }
        if(LanguageUtils.isFunction(callback)){
          callback();
        }
      });
    }
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