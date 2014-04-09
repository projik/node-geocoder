'use strict';
(function () {

    var net = require('net');
    var querystring = require('querystring');

    /**
     * Constructor
     */
    var BingGeocoder = function(httpAdapter, apiKey) {

        if (!httpAdapter || httpAdapter == 'undefinded') {

            throw new Error('Bing Geocoder need an httpAdapter');
        }

        this.httpAdapter = httpAdapter;

        if (!apiKey || apiKey == 'undefinded') {

            throw new Error('Bing Geocoder need an apiKey');
        }

        this.apiKey = apiKey;
    };

    BingGeocoder.prototype._endpoint = 'http://dev.virtualearth.net/REST/v1/Locations';

    /**
    * Geocode
    * @param <string>   value    Value to geocode (Adress)
    * @param <function> callback Callback method
    */
    BingGeocoder.prototype.geocode = function(value, callback) {

        if (net.isIP(value)) {
            throw new Error('Bing Geocoder no suport geocoding ip');
        }

        var _this = this;
        this.httpAdapter.get(this._endpoint + '/address' , { 'location' : value, 'key' : querystring.unescape(this.apiKey)}, function(err, result) {
            if (err) {
                return callback(err);
            } else {
                if (result.info.statuscode !== 0) {
                    return callback(new Error('Status is ' + result.info.statuscode + ' ' + result.info.messages[0]));
                }

                var results = [];

                var locations = result.results[0].locations;

                for(var i = 0; i < locations.length; i++) {
                    results.push(_this._formatResult(locations[i]));
                }

                callback(false, results);
            }
        });
    };

    BingGeocoder.prototype._formatResult = function(result) {

        return {
            'latitude' : result.point.coordinates[0],
            'longitude' : result.point.coordinates[1],
            'country' : result.address.countryRegion,
            'city' : result.address.locality,
            'zipcode' : result.address.postalCode,
            'streetName': result.address.addressLine,
            'streetNumber' : null,
            'countryCode' : result.address.countryRegionIso2

        };
    };

    /**
    * Reverse geocoding
    * @param <integer>  lat      Latittude
    * @param <integer>  lng      Longitude
    * @param <function> callback Callback method
    */
    BingGeocoder.prototype.reverse = function(lat, lng, callback) {

        var _this = this;

        this.httpAdapter.get(this._endpoint + '/' + lat + ',' + lng , {'incl': 'ciso2','key' : querystring.unescape(this.apiKey)}, function(err, result) {
            if (err) {
                return callback(err);
            } else {
                var results = [];

                var locations = result.resourceSets[0].resources;

                for(var i = 0; i < locations.length; i++) {
                    results.push(_this._formatResult(locations[i]));
                }

                callback(false, results);
            }
        });
    };

    module.exports = BingGeocoder;

})();