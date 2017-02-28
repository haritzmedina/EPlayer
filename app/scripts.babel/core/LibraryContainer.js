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
    this.libraries = [];
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
        this.libraries = [];
        if (!LanguageUtils.isEmptyObject(result)) {
          for(let i=0;i<result.length;i++){
            this.libraries.push(LanguageUtils.fillObject(new LocalLibrary(), result[i]));
          }
        }
        resolve();
      });
    })).then(()=>{
      Logger.log(this.libraries);
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
    for(let i=0;i<this.libraries.length;i++){
      promises.push(new Promise((resolve, reject)=>{
        let localLibrary = this.libraries[i];
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

    for(let i=0;i<this.libraries.length;i++){
      this.libraries[i].printLibrary();
    }
  }

  /**
   * Add a new local library to the library container
   * @param library
   * @param callback
   */
  addLocalLibrary(library, callback){
    // Check if library is already added
    if(DataUtils.queryByExample(this.libraries, {absolutePath: library.absolutePath}).length===0){
      this.libraries.push(library);
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
    LocalStorage.setData(StorageNamespaces.library.container, this.libraries, ()=>{
      if(LanguageUtils.isFunction(callback)){
        callback();
      }
    });
  }

  onClose(callback){
    this.updateLocalStorage(callback);
  }

  removeLibrary(library, callback){
    // Remove library from local or sync (depending on where it is
    DataUtils.removeByExample(this.libraries, library);
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
    return this.libraries.length>0;
  }

  retrieveAllSongs(){
    let songs = [];
    for(let i=0;i<this.libraries.length;i++){
      songs = songs.concat(this.libraries[i].retrieveSongs());
    }
    return songs;
  }

  searchSongsByTextFilter(textFilter, callback){
    if(textFilter.length>0){
      let results = [];
      let promises = [];
      for(let i=0;i<this.libraries.length;i++){
        promises.push(new Promise((resolve, reject)=>{
          results = results.concat(this.libraries[i].getSongsByTextFilter(textFilter));
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

  getLibraryBySongId(songId){
    let splitId = songId.split('?');
    let libraryId = splitId[0];
    return DataUtils.queryByExample(this.libraries, {id: libraryId})[0];
  }

  getSongById(songId){
    let library = this.getLibraryBySongId(songId);
    if(library){
      return library.getSongById(songId);
    }
    return null;
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