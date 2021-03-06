/**
 * This module contains google map markers helpers functions
 */

/*global google */

(function() {
  var infoWindow = null,
      self = this,
      yelp_api = require('./yelp_api'),
      lockr = require('lockr');

  /**
   * Insert here your personal Yelp API keys
   * @type {Object}
   */
  var Yelp_API_Keys = {
    consumer_key: 'ToMhQZd2nE7tYRiB4Mkw2g',
    token: 'xPT57FxYaZDoIV-G8ohJFK6MPFBinwpf',
    consumer_key_secret: 'V_-tUVCfgIfQkZbDgOd0VHZKqrQ',
    token_secret: 'SR6pYkAfo3aw8-db26IcvMtE1lE'
  };

/**
 * Creates google map
 * @param  {[type]} element   DOM element
 * @param  {[type]} centerLat map center latitude
 * @param  {[type]} centerLon map center longitude
 * @return {[type]}           google map instance
 */
  var createMap = function createMap(element, centerLat, centerLon) {
    var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(centerLat, centerLon),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      },
      map = new google.maps.Map(element, mapOptions);
    applyCustomMapStyles(map);

    google.maps.event.addDomListener(window, 'resize', function() {
      var center = map.getCenter();
      google.maps.event.trigger(map, 'resize');
      map.setCenter(center);
    });
    google.maps.event.trigger(map, 'resize');
    self.map = map;
    return map;
  };

  var applyCustomMapStyles = function applyCustomMapStyles(map) {
    // Create an array of styles.
    var styles = [
      {
        featureType: 'road',
        stylers: [
          { visibility: 'on' },
          { color: '#e2c1b9' }
        ]
      },{
        featureType: 'water',
        stylers: [
          { hue: '#00ccff' }
        ]
      }
    ];
    
    var styledMap = new google.maps.StyledMapType(styles, {name: 'Styled Map'});
    map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');
  }

  /**
   * Animates marker
   * @param  {[type]} marker marker object
   */
  var animateMarker = function animateMarker(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      window.setTimeout(function() {
        marker.setAnimation(null);
      }, 1400);
    }
  };

  /**
   * Shows info window for selected marker, formatted with appropriate search result
   * @param  {[type]} selectedMarker marker object
   * @param  {[type]} searchResult   Yelp responce object
   */
  var showInfoWindow = function showInfoWindow(selectedMarker, searchResult) {
    if (infoWindow) {
      infoWindow.close();
    }
    selectedMarker.markerActive = true;
    infoWindow = new google.maps.InfoWindow({content: contentString(searchResult)});
    infoWindow.open(self.map, selectedMarker);

    google.maps.event.addListener(infoWindow, 'closeclick', function() {
      selectedMarker.markerActive = false;
    });
  };

  /**
   * Searches Yelp information for location
   * @param  {[type]} selectedMarker object
   */
  var searchLocationInfo = function searchLocationInfo(selectedMarker) {
    if (selectedMarker.markerActive) {
      infoWindow.close();
      selectedMarker.markerActive = false;
      return;
    }

    animateMarker(selectedMarker);

    var callback = function(searchResult) {
      lockr.set(selectedMarker.title, searchResult);
      showInfoWindow(selectedMarker, searchResult);
    };

    var localYelpResults = lockr.get(selectedMarker.title);
    if (localYelpResults == null) {
      yelp_api.callSearchReviews(Yelp_API_Keys, selectedMarker.title, selectedMarker.location, callback);
    } else {
      showInfoWindow(selectedMarker, localYelpResults);
    }
  };

  /**
   * Returns formatted html for marker info window
   * @param  {[type]} obj Yelp search response object
   */
  var contentString = function contentString(obj) {
    if (!obj || !obj.businesses || !obj.businesses.length) {
      return '<div id="container"><div class="raw"><div class="col-md-2">' +
      '<div class="raw"><img class="request-error-image" src="' + require('../img/request_error.png') +'"/></div></div>' +
      '<div class="col-md-10"><p><h5>' + obj+ '</h5></p></div></div></div>'; }

    var business = obj.businesses[0];

    return '<div id="container"><div class="raw"><div class="col-md-4">' +
    '<div class="raw"><img class="location-image" src="' + business.image_url + '" alt="location"/></div>' +
    '<div class="raw"><img src="' + business.rating_img_url_large + '" alt="rating"/></div>' +
    '<div class="raw"><p><strong>Reviews:</strong> ' + business.review_count + '</p></div>' +
    '</div><div class="col-md-8">' +
    '<a target="_blank" href="' + business.url + '"><h1>' + business.name + '</h1></a>' +
    '<p>' + business.snippet_text + '</p>' +
    '<p>' + business.display_phone + '</p>' +
    '</div>' + '</div>' + '</div>';
  };

  /**
   * markerHelpers object with default exports
   * @type {Object}
   */
  var markerHelpers = {
    createMap: createMap,
    searchLocationInfo: searchLocationInfo,
    animateMarker: animateMarker
  };

  /**
   * Register as a named AMD module
   * @return {[type]}        module object
   */
  if (typeof define === 'function' && define.amd) {
    define('markerHelpers', [], function() {
      return markerHelpers;
    });
  }
})();
