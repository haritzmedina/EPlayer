'use strict';

var SongSource = require('./SongSource');
var LanguageUtils = require('../../utils/LanguageUtils');

/**
 * Song resource for local files
 * @author Haritz Medina <me@haritzmedina.com>
 */

class SongFileSource extends SongSource{

  constructor(fileEntry){
    super();
    this.fileEntry = fileEntry;
  }

  retrievePlayableSource(callback){
    this.fileEntry.file(function (file) {
      let reader = new FileReader();
      reader.onload = function () {
        if(LanguageUtils.isFunction(callback)){
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

module.exports = SongFileSource;