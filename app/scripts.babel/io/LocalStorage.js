'use strict';

const LanguageUtils = require('../utils/LanguageUtils');
const FileManager = require('./FileManager');

const LocalStorageFilePath = FileManager.getUserStorageFolderPath()+'data.json';

class LocalStorage{

  static init(){
    // Create folder if not exists
    FileManager.createFolder(FileManager.getUserStorageFolderPath());
    FileManager.createJSONFile(LocalStorageFilePath, {}, false);
    LocalStorage.loadData();
  }

  /**
   * Stores data on local storage (json file) given a namespace or ID
   * @param namespace A String which identify the space to store the data
   * @param data The data to save
   * @param callback The function to execute after saving the data
   * @throws Error if it was unable to storage data
   */
  static setData(namespace, data, callback){
    if(LanguageUtils.isFunction(callback)){
      LocalStorage.loadData();
      Storage[namespace] = data;
      // Update json file
      FileManager.createJSONFile(LocalStorageFilePath, Storage, true);
      callback(true);
    }
  }

  /**
   * Retrieve data from chrome storage given a namespace or ID
   * @param namespace A String which identify the space to store the data
   * @param callback The function to execute after saving the data
   */
  static getData(namespace, callback){
    LocalStorage.loadData(()=>{
      // Return the value of the namespace to the function if exists
      callback({}, Storage[namespace]);
    });
  }

  static loadData(callback){
    if(LanguageUtils.isEmptyObject(Storage)){
      // Read local json file
      try{
        Storage = FileManager.readJSONFile(LocalStorageFilePath);
      }
      catch(error){
        Storage = {};
      }
    }
    if(LanguageUtils.isFunction(callback)) {
      callback();
    }
  }
}

Storage = {};

module.exports = LocalStorage;