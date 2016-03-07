'use strict';

/*global google */
/*global window */

var ko = require('knockout');
var markerHelpers = require('./marker-helpers');

/* Ressingns map instance to locations lists
 * [setMarkersMap description]
 * @param {[type]} locations [description]
 * @param {[type]} map       [description]
 */
var setMarkersMap = function setMarkersMap(locations, map) {
  for (var l = 0; l < locations.length; l++) {
    locations[l].marker.setMap(map);
  }
};

var iconBase = 'http://maps.google.com/mapfiles/kml/pal2/';
var customMarkerIcons = {
  Sea_Park: {
    icon: iconBase + 'icon4.png' //sea_park.png
  },
  Amusement_Park: {
    icon: iconBase + 'icon49.png' //themepark.png
  },
  Castle: {
    icon: iconBase + 'icon10.png' //castle.png
  },
  Cafe: {
    icon: iconBase + 'icon36.png' //cafe.png
  },
  Museum: {
    icon: iconBase + 'icon3.png' //sight.png
  },
  Ice_Cream: {
    icon: iconBase + 'icon19.png' //icecream.png
  },
  Palace: {
    icon: iconBase + 'icon2.png' //castle.png
  }
}

/**
 * MarkerLocation model
 * @param {[type]} title     marker title
 * @param {[type]} latitude  marker latitude value
 * @param {[type]} longitude marker longitude value
 * @param {[type]} location  location name, usually city name
 * @param {[type]} type      type of location
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
    setMarkersMap(this.locations(), null);
    setMarkersMap(selectedLocations, this.map);
  },
  setTypeFilter: function(parent, data) {
    this.typeFilter = data.type();
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
