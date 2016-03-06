'use strict';
/**
 * Yelp API helpers
 */

window.yelp_api = (function() {
  var oauthSignature = require('oauth-signature');
  var jquery = require('jquery');
  var n = require('nonce')();

  /**
   * Searches for location information using Yelp API
   * @param  {[type]}   keys           Yelp API keys
   * @param  {[type]}   title          Title of the place of interest
   * @param  {[type]}   location_name  Name of the location (city, country, etc.)
   * @param  {Function} callback       Request callback function
   */
  var searchReviews = function(keys, title, location_name, callback) {
    var parameters = {
      'term': title,
      'location': location_name,
      'callback': 'jsonpCallback',
      'oauth_nonce': n(),
      'oauth_timestamp': n().toString().substr(0, 10),
      'oauth_consumer_key': keys.consumer_key,
      'oauth_consumer_secret': keys.consumer_key_secret,
      'oauth_token': keys.token,
      'oauth_signature_method': 'HMAC-SHA1'
    };

    var yelp_search_url = 'http://api.yelp.com/v2/search';
    var signature = oauthSignature.generate('GET', yelp_search_url, parameters, keys.consumer_key_secret, keys.token_secret, {encodeSignature: false});
    parameters.oauth_signature = signature;

    jquery.ajax({
      'url' : yelp_search_url,
      'data' : parameters,
      'cache': true,
      'dataType' : 'jsonp',
      'jsonpCallback' : 'jsonpCallback',
      'success' : function(response){
        callback(response);
      }
    });
  };

  /**
   * yelp_api object with default exports
   * @type {Object}
   */
  var yelp_api = {
    callSearchReviews: function(keys, title, location_name, callback) {
      return searchReviews(keys, title, location_name, callback);
    }
  };

  /**
   * Register as a named AMD module
   * @return {[type]}        yelp_api object
   */
  if (typeof define === 'function' && define.amd) {
    define('yelp_api', [], function() {
      return yelp_api;
    });
  }
})();
