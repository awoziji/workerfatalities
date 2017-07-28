import React from 'react';
import mapboxgl from 'mapbox-gl'
import LegendControl from './legend.js'
import {getDistance} from '../utils.js'
// let skull_url = require("../../img/skull_d2.png")
// XXX This must be present in the page or it won't work, right now it's the icon in the menu
// probably better if it's hidden in index.html ?
let skull_url = require("file-loader?name=skull_d2.png!../../img/skull_d2.png")
console.log(skull_url)

mapboxgl.accessToken = 'pk.eyJ1IjoiemlzY2h3YXJ0eiIsImEiOiJjaXhxOXp5eGIwOHJqMzNubnI2Zjh2a2RjIn0.CMKNggl2Se8uH0GEKEJcJw'
window.mapboxgl = mapboxgl


// the actual react component we export, Map
//
class Map extends React.Component {
  constructor(props) {
    super(props)
    // this.state = {all_years: false, all_years_loaded:false, active_kinds: {vehicle:true, crime:true, by_police:true, work: true} }
    this.state = {}
  }

  // flip_all_years(){
  //   this.setState({all_years:!this.state.all_years})
  // }
  componentDidMount(){
    if (!mapboxgl.supported()) {
      alert('Your browser does not support Mapbox GL');return;
    }

    // can set which load_data to use here?
    // make_map is a helper below
    // let f_to_load_data = !this.state.all_years ? load_data : load_all_years_data
    let f_to_load_data =  load_data
    make_map(this.refs.mapboxMap).then(f_to_load_data).then(([geojson, map])=> {
      window.map = map //debug
      this.mb_map = map
      // console.log(geojson)
      map.addSource('data', {
        type: 'geojson',
        // cluster: true, // https://www.mapbox.com/mapbox-gl-js/example/cluster/ // clusterRadius: 25 // default is 50
        data: geojson,
      })
      let image = new Image(40,53)
      image.src = skull_url
      map.addImage('skull_d2_image', image, {width: 40, height: 53});
      map.addLayer(point_layer_obj())

      map.on('mouseenter', 'point', function(e) {
        // console.log(e.features[0])
        map.getCanvas().style.cursor = 'pointer';
      })

      map.on('click', 'point', function(e) {
          let popup = new mapboxgl.Popup() //  closeButton: false,  closeOnClick: false

          // Change the cursor style as a UI indicator.
          map.getCanvas().style.cursor = 'pointer';
          // Populate the popup and set its coordinates
          // based on the feature found.
          let p = e.features[0].properties
          // new Date(p.date).toDateString()
          // not actually utc, but otherwise the date is off by one, blah
          // "America/New_York"
          let date_opts = { timeZone:"UTC", weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
          let html = [new Date(p.date).toLocaleDateString("en-US", date_opts), p.description, p.employer].join('<br/>')
          popup.setLngLat(e.features[0].geometry.coordinates)
              .setHTML(html)
              .addTo(map);
      });

      map.on('mouseleave', 'point', function() {
          map.getCanvas().style.cursor = '';
      });

      map.addControl(new mapboxgl.NavigationControl());
      map.addControl(new mapboxgl.GeolocateControl({  positionOptions: {   enableHighAccuracy: true }}))
      // setTimeout(()=> map.zoomIn() , 500)
    })
  }
  shouldComponentUpdate(nextProps, nextState) {
    // do we need to add the all years source to the map ?
    // we'll filter years otherwise maybe
    // if (nextState.all_years && !this.state.all_years_loaded ){
    //   load_all_years_data().then(data=> this.mb_map.getSource('data').setData(data[0]) )
    //   // even though they're not yet, so this should prevent multiple loads
    //   this.setState({all_years_loaded:true})
    // }
    // always return true to re render the comp
    //which doesn't actually re-render the map
    return true
  }
  render() {
    // let year_filter = this.state.all_years ? ['all'] : ['in', 'year', 2015, 2016]
    // filter by kind and by year
    // let current_filter = [ 'all', year_filter, ['in', 'kind'].concat(this.get_active_kinds()) ]
    // only actually apply the filter if the map has been instantiated
    // if (this.mb_map){  this.mb_map.setFilter('point', current_filter )  }
    // let active_kinds = this.state.active_kinds
    return (<div>

            <div ref="mapboxMap" id="map"/></div>);
  }
}

export default Map;


// Helpers !
// -------------------


function load_data(map) {
  return new Promise(function(resolve, reject){
        require.ensure([], function() {
          let records = require('dsv-loader!../../data/osha_current.csv')
          let geojson = get_geo_from_records(records)
          resolve([geojson, map])
      }) // end ensure
  }) // end promise, which is returned
} // end load data

// function load_all_years_data(map) {
//   return new Promise(function(resolve, reject){
//         require.ensure([], function() {
//           let records = require('dsv-loader!../../data/all_deaths.csv')
//           let geojson = get_geo_from_records(records)
//           resolve([geojson, map])
//       }) // end ensure
//   }) // end promise, which is returned
// } // end load data

// helper for above
function get_geo_from_records(records){
  let geojson = {features: [],  type: 'FeatureCollection'}
  let counts = {}
  for (let [index, record] of records.entries()) {
    // this normalizes and rounds, prevent occlusion of close ones, as opposed to using the clustering stuff
    record.lat = parseFloat(record.lat)
    record.lng = parseFloat(record.lng)
    // for dupe locations, move them slightly
    let loc_string = `${record.lat.toFixed(4)} ${record.lng.toFixed(4)}`
    if (counts[loc_string]){
      counts[loc_string]+=1
      // pass the record and the count for that loc, get back and adjusted rec
      record = adjust_location(record, counts[loc_string])
    }
    else { counts[loc_string]=1 }

    record.date = new Date(record.date)

    // create the feature, pass the whole record for props
    // console.log(record.lng, record.lat)
    let f = create_feature(record.lng, record.lat, record)
    geojson.features.push(f)
  }
  return geojson
}




// let records = [{lng:-73.8232488, lat:40.76131858}, {lng:-73.8232488, lat:40.76131858},{lng:-73.8232488, lat:40.76131858},{lng:-73.8232488, lat:40.76131858},{lng:-73.8232488, lat:40.76131858},{lng:-73.8232488, lat:40.76131858},{lng:-73.8232488, lat:40.76131858}]
// for testing adjust_location

// if the location already has a record, adjust them manually
// this is the "jitter" thing from the first version, but better
// could just leave icon-allow-overlap false, but this shows magnitude
function adjust_location(record, count){
  let offset = 0.001
  let mod = count%4
  let lvl = Math.floor((count-2)/4)+1
  switch (mod){
    case 0:
      record["lng"] += -offset*lvl
      record["lat"] +=  offset*lvl
      break;
    case 1:
      record["lng"] +=  offset*lvl
      record["lat"] += -offset*lvl
      break;
    case 2:
      record["lng"] +=  offset*lvl
      record["lat"] +=  offset*lvl
      break;
    case 3:
      record["lng"] += -offset*lvl
      record["lat"] += -offset*lvl
      break;
  }
  return record
}

// actually make a map, via a promise . todo, pass in options
//
function make_map(container){
  // console.log('make map called, about to promise')
  // console.log(mapboxgl.version)
  return new Promise(function(resolve, reject){
    let map = new mapboxgl.Map({
          container: container, // can be element or element id
          // style: 'mapbox://styles/mapbox/streets-v9',
          style: 'mapbox://styles/mapbox/satellite-v9',
          // style: 'mapbox://styles/mapbox/dark-v9',
          // style: 'mapbox://styles/mapbox/light-v9',
          zoom: 3,
          minZoom: 2,
          maxZoom: 16,
          attributionControl: false, // only shows up on small screens and isn't clickable anyway?!
          // maxZoom: 15,
          // hash: true,
          // center:[-73.9,-90],
          center:[-99, 40],
          // maxBounds: bounds, // Sets bounds as max
          // style: 'mapbox://styles/mapbox/dark-v9', //hosted style id
          // style: toner_layer_style(), //hosted style id
      })
    map.on('load', ()=> resolve(map) )
  })
}

// export function create_feature(lng, lat, properties={}){
function create_feature(lng, lat, properties={}){
  return {
    type: 'Feature',
    properties: properties,
    geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  }
}

// for making our skulls
function point_layer_obj(){
  return {
    id: 'point',
    type: 'symbol',
    source: 'data',
    // "paint":{"icon-opacity": 1,},
    "paint":{"icon-opacity": .65,},
    "layout": {
      "icon-image": "skull_d2_image",
      "icon-allow-overlap": true,
      "icon-size": 1,
      // "icon-size": {
      //   stops:[ [4, 0.5], [5, 0.5], [6, 0.5], [7, 0.5] ],
      // }
    },
  }
}


// <nav id='all-years-group' className='filter-group'>
//   <input type="checkbox" id="all_years" checked={this.state.all_years} onChange={e=>this.flip_all_years()} />
//   <label htmlFor="all_years">Show All Years</label>
// </nav>
// <nav id='filter-kind-group' className='filter-group'>
//   <input type="checkbox" id="vehicle" checked={active_kinds.vehicle} onChange={e=>this.flip_active_kind('vehicle')} />
//   <label htmlFor="vehicle">Vehicle</label>
//   <input type="checkbox" id="crime" checked={active_kinds.crime} onChange={e=>this.flip_active_kind('crime')} />
//   <label htmlFor="crime">Crime</label>
//   <input type="checkbox" id="by_police" checked={active_kinds.by_police} onChange={e=>this.flip_active_kind('by_police')} />
//   <label htmlFor="by_police">By Police</label>
//   <input type="checkbox" id="work" checked={active_kinds.work} onChange={e=>this.flip_active_kind('work')} />
//   <label htmlFor="work">At Work</label>
// </nav>
