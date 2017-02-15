'use strict';

const SongSource = require('./SongSource');
const LanguageUtils = require('../../utils/LanguageUtils');
const fs = require('fs');

/**
 * Song resource for local files
 * @author Haritz Medina <me@haritzmedina.com>
 */

class SongFileSource extends SongSource{

  constructor(filepath){
    super();
    this.filepath = filepath;
  }

  retrievePlayableSource(callback){
    if(LanguageUtils.isFunction(callback)){
      callback(this.filepath);
    }
  }
}

module.exports = SongFileSource;