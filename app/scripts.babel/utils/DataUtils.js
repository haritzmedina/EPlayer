'use strict';

/**
 *
 */
class DataUtils{

  static shuffle(array){

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