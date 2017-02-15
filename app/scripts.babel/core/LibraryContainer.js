'use strict';

const LocalStorage = require('../io/LocalStorage');
const StorageNamespaces = require('../io/StorageNamespaces');
const LanguageUtils = require('../utils/LanguageUtils');
const Logger = require('../io/Logger');
const LocalLibrary = require('./model/LocalLibrary');
const DataUtils = require('../utils/DataUtils');
const Library = require('./model/Library');

const {dialog} = window.require('electron').remote;

/**
 * Library container. A container and manager for libraries defined by the user.
 * @author Haritz Medina <me@haritzmedina.com>
 */
class LibraryContainer{
  constructor(){
    this.localLibraries = [];
    this.syncLibraries = [];
    this.librarySearchInput = document.querySelector('#librarySearch');
    this.addLibraryButton = document.querySelector('#addLibraryButton');
  }

  /**
   * Initialize the library container (retrieves saved data from Local Storage) and initialize components behaviour
   * @param callback The callback function to execute after library container is initialized
   */
  init(callback) {
    // Load local saved libraries data from local storage
    (new Promise((resolve, reject) => {
      LocalStorage.init();
      LocalStorage.getData(StorageNamespaces.library.container, (error, result)=> {
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
    })).then(()=>{
      Logger.log(this.localLibraries);
      callback();
    });


    // Handler of search input
    let searchEvent = (event)=>{
      let filterText = this.librarySearchInput.value;
      this.searchSongsByTextFilter(filterText, (songs)=>{
        if(songs.length===0){
          if(filterText.length===0){
            this.printLibraries();
          }
          else{
            this.printSearchEmpty();
          }
        }
        else{
          this.printSearchedSongs(songs);
        }
      });
    };
    this.librarySearchInput.addEventListener('search', searchEvent); // When clear button is clicked
    this.librarySearchInput.addEventListener('keyup', searchEvent); // When any text input is entered
    // Handler for add library button
    this.addLibraryButton.addEventListener('click', (event)=>{
      this.promptNewLocalLibraryForm();
    });
  }

  /**
   * Initialize libraries in the library container
   */
  loadLibraries(callback){
    // Clean libraries wrapper
    let container = document.getElementById('librarySearchResults');
    container.innerText = '';

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
      this.updateLocalStorage(callback);
    });
  }

  printLibraries(callback){
    // TODO Check if it is better to hide and show a container or reprint everything
    let container = document.getElementById('librarySearchResults');
    container.innerText = '';

    for(let i=0;i<this.localLibraries.length;i++){
      this.localLibraries[i].printLibrary();
    }
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
      library.loadLibrary(()=>{
        // Update local library
        this.updateLocalStorage(callback);
      });
    }
    else{
      Logger.log('Already Added');
    }
  }

  updateLocalStorage(callback){
    LocalStorage.setData(StorageNamespaces.library.container, this.localLibraries, ()=>{
      if(LanguageUtils.isFunction(callback)){
        callback();
      }
    });
  }

  removeLibrary(library, callback){
    // Remove library from local or sync (depending on where it is
    DataUtils.removeByExample(this.localLibraries, library);
    DataUtils.removeByExample(this.syncLibraries, library);
    // Reload libraries
    this.loadLibraries(()=>{
      // Update local storage
      this.updateLocalStorage(()=>{
        if(LanguageUtils.isFunction(callback)){
          callback();
        }
      });
    });
  }

  promptNewLocalLibraryForm(callback){
    dialog.showOpenDialog({properties: ['openDirectory']}, (folderpath)=>{
      // TODO Folder class source instead of string
      let localLibrary = new LocalLibrary(folderpath[0]);
      this.addLocalLibrary(localLibrary, ()=>{
        if(LanguageUtils.isFunction(callback)){
          callback();
        }
      });
    });
  }

  areLibrariesDefined(){
    return this.localLibraries.length+this.syncLibraries.length>0;
  }

  retrieveAllSongs(){
    let songs = [];
    for(let i=0;i<this.localLibraries.length;i++){
      songs = songs.concat(this.localLibraries[i].retrieveSongs());
    }
    return songs;
  }

  searchSongsByTextFilter(textFilter, callback){
    if(textFilter.length>0){
      let results = [];
      let promises = [];
      for(let i=0;i<this.localLibraries.length;i++){
        promises.push(new Promise((resolve, reject)=>{
          results = results.concat(this.localLibraries[i].getSongsByTextFilter(textFilter));
          resolve();
        }));
      }
      Promise.all(promises).then(()=>{
        if(LanguageUtils.isFunction(callback)){
          callback(results);
        }
      });
    }
    else{
      if(LanguageUtils.isFunction(callback)){
        callback([]);
      }
    }
  }


  printSearchedSongs(songs){
    let container = document.getElementById('librarySearchResults');
    container.innerText = '';

    for(let i=0;i<songs.length;i++){
      songs[i].printLibrarySong(container);
    }
  }

  printSearchEmpty() {
    let container = document.getElementById('librarySearchResults');
    container.innerText = 'No songs found';
  }
}

module.exports = LibraryContainer;