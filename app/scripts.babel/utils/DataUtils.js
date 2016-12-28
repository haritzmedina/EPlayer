'use strict';

/**
 *
 */
class DataUtils{

  static shuffle(originalArray){
    var array = originalArray.slice();
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;

  }

  static getRandomElement(array){
    return array[Math.floor(Math.random() * array.length)];
  }

  static removeByExample(array, props){
    let removableObjects = DataUtils.filterArray(array, props, {index:true});
    for(let i=0; i<removableObjects.length;i++){
      array.splice(removableObjects[i].index, 1);
    }
  }

  static queryByExample(array, props){
    return DataUtils.filterArray(array, props);
  }

  static queryIndexByExample(array, props){
    return DataUtils.filterArray(array, props, {index: true})[0].index;
  }

  static filterArray(array, props, opts){
    let filteredArray = [];
    for(let i=0;i<array.length;i++){
      let elem = array[i];
      if(DataUtils.arePropertiesIncluded(elem, props)){
        if(opts && opts.index){
          filteredArray.push({index: i, obj: elem});
        }
        else{
          filteredArray.push(elem);
        }
      }
    }
    return filteredArray;
  }

  static arePropertiesIncluded(objectSource, properties){
    let keys = Object.keys(properties);
    for(let i=0;i<keys.length;i++){
      let key = keys[i];
      if(objectSource[key]!==properties[key]){
        return false;
      }
    }
    return true;
  }

}

module.exports = DataUtils;