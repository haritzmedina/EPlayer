'use strict';

var Library = require('./Library');
var FileManager = require('../../io/FileManager');
var Logger = require('../../io/Logger');
var LanguageUtils = require('../../utils/LanguageUtils');
var SongFile = require('./SongFile');

class LocalLibrary extends Library{

  constructor(libraryFolder, absolutePath){
    super();
    this.source = libraryFolder;
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
    FileManager.restoreEntry(this.source, (entryFolder)=>{
      Logger.log('Restored: '+this.source);
      FileManager.readFolder(entryFolder, {fileExtension: '.mp3'}, (files)=>{
        var songs = [];
        var promises = [];
        for(let i=0;i<files.length;i++){
          promises.push(new Promise((resolve, reject) =>{
            SongFile.readSongFileMetadata(files[i], (error, songMetadata)=>{
              if(error){
                Logger.log(error);
                resolve();
              }
              else{
                songs.push(new SongFile(files[i], songMetadata));
                resolve();
              }
            });
          }));
        }
        Promise.all(promises).then(()=>{
          this.songs = songs;
          if(LanguageUtils.isFunction(callback)){
            callback();
          }
        });
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