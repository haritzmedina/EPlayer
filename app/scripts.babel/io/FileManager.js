'use strict';

var Logger = require('./Logger');
var LanguageUtils = require('./../utils/LanguageUtils');

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
    var dirReader = folderEntry.createReader();
    var files = [];
    // Recursively read entries til finished
    var readEntries = function() {
      dirReader.readEntries((results) => {
        if (results.length) {
          var fileExtensionRegEx = /(?:\.([^.]+))?$/;
          for (var i = 0; i < results.length; i++) {
            // If is set a file extension filter, only add files which has this extension
            if(opts && opts.fileExtension){
              var extension = fileExtensionRegEx.exec(results[i].name);
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
}

module.exports = FileManager;