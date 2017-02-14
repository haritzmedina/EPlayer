'use strict';

const Logger = require('./Logger');
const LanguageUtils = require('./../utils/LanguageUtils');
const fs = require('fs');

/**
 *
 */
class FileManager{

  /**
   * Read a filesystem folderEntry and return (through callback) the files
   * @param folderEntry
   * @param opts An options object. Eg.: {fileExtension: '.mp3', recursiveFolder: true}
   * @param callback
   */
  static readFolder(folderEntry, opts, callback){
    // Create directory reader
    let dirReader = folderEntry.createReader();
    let files = [];
    // Recursively read entries til finished
    let readEntries = function() {
      dirReader.readEntries((results) => {
        if (results.length) {
          let fileExtensionRegEx = /(?:\.([^.]+))?$/;
          for (let i = 0; i < results.length; i++) {
            // If is set a file extension filter, only add files which has this extension
            if(opts && opts.fileExtension){
              let extension = fileExtensionRegEx.exec(results[i].name);
              if (extension[0] === opts.fileExtension) {
                files.push(results[i]);
              }
            }
            else{
              files.push(results[i]);
            }
          }
          readEntries();
        } else {
          console.log('Folder contains ' + files.length + ' files.');
          callback(files);
        }
      });
    };
    readEntries();
  }

  static restoreEntry(entry, callback){
    chrome.fileSystem.restoreEntry(entry, function (entryPoint) {
      if(LanguageUtils.isFunction(callback)){
        callback(entryPoint);
      }
    });
  }

  static getAppDataFolderPath(){
    return process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local');
  }

  static getUserStorageFolderPath(){
    return FileManager.getAppDataFolderPath()+'/GCPlayer/';
  }

  static readJSONFile(filepath){
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  }

  /**
   * Create a json file from jsonContent and storages in the filepath
   * @param filepath
   * @param jsonContent
   */
  static createJSONFile(filepath, jsonContent, overwrite){
    if(overwrite){
      fs.writeFile(filepath, JSON.stringify(jsonContent, null, 4));
    }
    else{
      if (!fs.existsSync(filepath)){
        fs.writeFile(filepath, JSON.stringify(jsonContent, null, 4));
      }
    }
  }

  static createFolder(dir){
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
  }
}

module.exports = FileManager;