'use strict';

/*global google */
/*global window */

var ko = require('knockout');
var markerHelpers = require('./marker-helpers');

var customMarkerIcons = {
  Sea_Park: {
    icon: require('../img/sea_park.png')
  },
  Amusement_Park: {
    icon: require('../img/themepark.png')
  },
  Castle: {
    icon: require('../img/castle.png')
  },
  Cafe: {
    icon: require('../img/cafe.png')
  },
  Museum: {
    icon: require('../img/sight.png')
  },
  Ice_Cream: {
    icon: require('../img/icecream.png')
  },
  Palace: {
    icon: require('../img/palace.png')
  }
};

/**
 * MarkerLocation model
 * @param {string} title     marker title
 * @param {number} latitude  marker latitude value
 * @param {number} longitude marker longitude value
 * @param {string} location  location name, usually city name
 * @param {string} type      type of location
 */
var MarkerLocation = function MarkerLocation(title, latitude, longitude, location, type) {
  this.title = ko.observable(title);
  this.latitude = ko.observable(latitude);
  this.longitude = ko.observable(longitude);
  this.location = ko.observable(location);
  this.type = ko.observable(type);

  var latLng = new google.maps.LatLng(latitude, longitude);
  this.marker = new google.maps.Marker({
    position: latLng,
    title: title,
    type: type,
    icon: customMarkerIcons[type].icon,
    location: location,
    animation: google.maps.Animation.DROP
  });
};

/**
 * Location types enum
 * @type {Object}
 */
var LocationTypes = {
  Sea_Park: 'Sea_Park',
  Amusement_Park: 'Amusement_Park',
  Castle: 'Castle',
  Cafe: 'Cafe',
  Museum: 'Museum',
  Ice_Cream: 'Ice_Cream',
  Palace: 'Palace'
};

/**
 * ViewModel object.
 * Contains list of hardcoded locations that always will be prerendered on UI.
 * @type {Object}
 */
var viewModel = {
  locations: ko.observableArray([
    new MarkerLocation('Frederiksborg Slot', 55.935014, 12.301254, 'Hillerød', LocationTypes.Castle),
    new MarkerLocation('Dyrehavsbakken', 55.774811, 12.579072, 'Klampenborg', LocationTypes.Amusement_Park),
    new MarkerLocation('Amalienborg Slotsplads', 55.684068, 12.593031, 'Copenhagen', LocationTypes.Palace),
    new MarkerLocation('Vikingeskibsmuseet I Roskilde', 55.650772, 12.081452, 'Roskilde', LocationTypes.Museum),
    new MarkerLocation('Tivoli', 55.674637, 12.565668, 'Copenhagen', LocationTypes.Amusement_Park),
    new MarkerLocation('Carlsberg', 55.664783, 12.529747, 'Copenhagen', LocationTypes.Museum),
    new MarkerLocation('Ismageriet', 55.633627, 12.587814, 'Copenhagen', LocationTypes.Ice_Cream),
    new MarkerLocation('Amager Strandpark', 55.660409, 12.633346, 'Copenhagen', LocationTypes.Sea_Park),
    new MarkerLocation('Charlottenlund Strandpark', 55.744748, 12.584639, 'Copenhagen', LocationTypes.Sea_Park),
    new MarkerLocation('Next Door Café', 55.678803, 12.568591, 'Copenhagen', LocationTypes.Cafe)
  ]),
  types: ko.observableArray(Object.keys(LocationTypes)),
  filter: ko.observable(''),
  typeFilter: ko.observable(''),
  map: null,
  selectLocation: function(parent, data) {
    markerHelpers.animateMarker(data.marker);
  },
  resetMarkers: function(selectedLocations) {
      var locationsToHide = this.locations().filter(function(x) { return selectedLocations.indexOf(x) < 0 });
      setMarkersMap(locationsToHide, null, false);
      setMarkersMap(selectedLocations, this.map, true);
  },
  setTypeFilter: function(parent, data) {
    this.typeFilter = data.type();
  }
};

/** Reassigns map instance to locations lists
 * [setMarkersMap description]
 * @param {[type]} locations [description]
 * @param {[type]} map       [description]
 * @param isVisible
 */
var setMarkersMap = function setMarkersMap(locations, map, isVisible) {
    if ((map != null) && (typeof locations !== 'undefined') && (locations.length > 0) && (locations[0].marker.map == null)) {
        for (var l = 0; l < locations.length; l++) {
            locations[l].marker.setMap(map);
        }
    }
    for (var l = 0; l < locations.length; l++) {
        locations[l].marker.setVisible(isVisible);
    }
};

/**
 * Observable array of filtered locations
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
viewModel.filteredItems = ko.dependentObservable(function() {
  var filter = this.filter().toLowerCase();
  var typeFilter = this.typeFilter();
  if (!filter && !typeFilter) {
    return this.locations();
  } else {
    return ko.utils.arrayFilter(this.locations(), function(location) {
      return location.title().toLowerCase().indexOf(filter) > -1 && (typeFilter
        ? location.type().toLowerCase() === typeFilter.toLowerCase()
        : true);
    });
  }
}, viewModel);

/**
 * Initialization of googlemap
 * @type {Object}
 */
ko.bindingHandlers.googlemap = {
  init: function(element, valueAccessor) {
    var value = valueAccessor();

    viewModel.map = markerHelpers.createMap(element, value.centerLat, value.centerLon);

    for (var l = 0; l < viewModel.locations().length; l++) {
      viewModel.locations()[l].marker.addListener('click', function() {
        markerHelpers.searchLocationInfo(this);
      });
    }
  },

  update: function(element, valueAccessor) {
    var value = valueAccessor();
    viewModel.resetMarkers(value.locations());
  }
};

/**
 * Apply viewModel bindings
 * @param  {[type]} viewModel [description]
 * @return {[type]}           [description]
 */
ko.applyBindings(viewModel);
