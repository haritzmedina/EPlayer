'use strict';

var ChromeStorage = require('../io/ChromeStorage');
var ChromeStorageNamespaces = require('../io/ChromeStorageNamespaces');
var LanguageUtils = require('../utils/LanguageUtils');
var Logger = require('../io/Logger');
var LocalLibrary = require('./model/LocalLibrary');
var DataUtils = require('../utils/DataUtils');
var Library = require('./model/Library');

/**
 * Library interface. A library is a song list source.
 * @author Haritz Medina <me@haritzmedina.com>
 */
class LibraryContainer{
  constructor(){
    this.localLibraries = [];
    this.syncLibraries = [];
  }

  /**
   * Initialize the library container (retrieves saved data from Chrome Storage)
   * @param callback The callback function to execute after library container is initialized
   */
  init(callback) {
    // Prepare async promises
    var promises = [];
    // Load local saved libraries data from chrome storage
    promises.push(new Promise((resolve, reject) => {
      ChromeStorage.getData(ChromeStorageNamespaces.library.container, ChromeStorage.local, (error, result)=> {
        if(error){
          Logger.log(error);
        }
        this.localLibraries = [];
        if (!LanguageUtils.isEmptyObject(result)) {
          for(let i=0;i<result.length;i++){
            this.localLibraries.push(LanguageUtils.fillObject(new LocalLibrary(), result[i]));
          }
        }
        resolve();
      });
    }));
    // Load sync saved libraries data from chrome storage
    promises.push(new Promise((resolve, reject) => {
      ChromeStorage.getData(ChromeStorageNamespaces.library.container, ChromeStorage.sync, (error, result)=>{
        if(error){
          Logger.log(error);
        }
        this.syncLibraries = [];
        if (!LanguageUtils.isEmptyObject(result)) {
          for(let i=0;i<result.length;i++){
            // TODO Depending on Library is needed to create an object instead of "new Library()"
            this.syncLibraries.push(LanguageUtils.fillObject(new Library(), result[i]));
          }
        }
        resolve();
      });
    }));
    Promise.all(promises).then(()=>{
      Logger.log(this.localLibraries);
      Logger.log(this.syncLibraries);
      callback();
    });
  }

  /**
   * Initialize libraries in the library container
   */
  loadLibraries(callback){
    let promises = [];
    for(let i=0;i<this.localLibraries.length;i++){
      promises.push(new Promise((resolve, reject)=>{
        let localLibrary = this.localLibraries[i];
        localLibrary.loadLibrary(()=>{
          resolve();
        });
      }));
    }
    Promise.all(promises).then(()=>{
      callback();
    });
  }

  /**
   * Add a new local library to the library container
   * @param library
   * @param callback
   */
  addLocalLibrary(library, callback){
    // Check if library is already added
    if(DataUtils.queryByExample(this.localLibraries, {absolutePath: library.absolutePath}).length===0){
      this.localLibraries.push(library);
      // Update local library
      this.updateChromeStorage(callback);
    }
    else{
      Logger.log('Already Added');
    }
  }

  updateChromeStorage(callback){
    ChromeStorage.setData(ChromeStorageNamespaces.library.container, this.localLibraries, ChromeStorage.local, ()=>{
      if(LanguageUtils.isFunction(callback)){
        callback();
      }
    });
  }

  removeLocalLibrary(library, callback){
    DataUtils.removeByExample(this.localLibraries, library);
    this.updateChromeStorage(()=>{
      if(LanguageUtils.isFunction(callback)){
        callback();
      }
    });
  }

  promptNewLocalLibraryForm(callback){
    chrome.fileSystem.chooseEntry({ type: 'openDirectory' }, (dirEntry)=>{
      // Save new folder reference on model
      if(dirEntry){
        var folderPointer = chrome.fileSystem.retainEntry(dirEntry);
        // TODO retrieve and save localpath and entrypoint
        chrome.fileSystem.getDisplayPath(dirEntry, (absolutePath) => {
          var localLibrary = new LocalLibrary(folderPointer, absolutePath);
          this.addLocalLibrary(localLibrary, ()=>{
            if(LanguageUtils.isFunction(callback)){
              callback();
            }
          });
        });
      }
      else{
        if(LanguageUtils.isFunction(callback)){
          callback();
        }
      }
    });
  }

  areLibrariesDefined(){
    return this.localLibraries.length+this.syncLibraries.length>0;
  }

}

module.exports = LibraryContainer;