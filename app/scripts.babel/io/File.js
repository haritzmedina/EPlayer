/**
 * Created by Haritz Medina on 02/11/2016.
 */


'use strict';

class File {

  constructor(fileEntry){
    this.fileEntry = fileEntry;
  }

  getEntry(){
    return this.fileEntry;
  }

}

module.exports = File;