/**
 * General utils
 * @author Haritz Medina <me@haritzmedina.com>
 */
'use strict';

var jQuery = require('jquery');

class LanguageUtils {

  /**
   * Check if a given object is a function
   * @param func An object
   * @returns {*|boolean}
   */
  static isFunction(func){
    return func && typeof func==='function';
  }

  /**
   * Returns true if the object is empty, null, etc.
   * @param obj
   * @returns {*|boolean}
   */
  static isEmptyObject(obj){
    return jQuery.isEmptyObject(obj);
  }

  static isInstanceOf(obj, classReference){
    return obj instanceof classReference;
  }

  static fillObject(object, properties){
    return Object.assign(object, properties);
  }

}

module.exports = LanguageUtils;