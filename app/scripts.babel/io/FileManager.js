'use strict';

const Logger = require('./Logger');
const LanguageUtils = require('./../utils/LanguageUtils');
const fs = require('fs');

/**
 *
 */
class FileManager{

  /**
   * Read a filesystem folderpath and return (through callback) the files
   * @param folderpath
   * @param opts An options object. Eg.: {fileExtension: '.mp3', recursiveFolder: true}
   * @param callback
   */
  static readFolder(folderpath, opts, callback){
    let files = [];
    fs.exists(folderpath, (exists)=>{
      if(exists){
        fs.readdir(folderpath, {}, (err, retrievedFiles)=>{
          let fileExtensionRegEx = /(?:\.([^.]+))?$/;
          for(let index in retrievedFiles){
            let file = retrievedFiles[index];
            if(opts && opts.fileExtension){
              let extension = fileExtensionRegEx.exec(file);
              if (extension[0] === opts.fileExtension) {
                files.push(folderpath+'\\'+file);
              }
            }
            else{
              files.push(folderpath+'\\'+file);
            }
          }
          console.log('Folder contains ' + files.length + ' files.');
          callback(files);
        });
      }
      else{
        callback('Folder not found');
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
   * @param overwrite
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

  static getFileFromFilePath(filepath){
    debugger;
  }
}

module.exports = FileManager;