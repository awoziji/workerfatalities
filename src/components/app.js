import React from 'react';

require('./app.css')

import Map from './map.js'

// console.log("Hello world")
// require("file-loader?name=skull_d2.png!../../img/skull_d2.png")

let skull_url = require("file-loader?name=skull_d2.png!../../img/skull_d2.png")
// let skull_url = require("../../img/skull_d2.png")
require("file-loader?name=wf.jpg!../../img/wf.jpg");
require("file-loader?name=favicon.ico!../../img/favicon.ico");


class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {show_moreinfo: false}
  }
  componentDidMount(){

  }
  render(){
    let p_style = this.state.show_moreinfo ? {display:"block"} : {display:"none"}
    let label = this.state.show_moreinfo ? 'Less': 'More info'
    // style={p_style}
    return <div id="app">
      <div id="info">
        <img src={skull_url} style={ {'float':'left', marginTop:-3, marginLeft: -5, marginRight:4, width: 20, height:27} }/>
        <div className='title'>
          <strong>Worker Fatalities</strong>
          <a className='moreinfo' href="#" onClick={()=> this.setState({show_moreinfo:!this.state.show_moreinfo})}>{label}</a>
        </div>
        <p style={p_style}>This is a map of fatalities and catastrophes reported to OSHA from 2009 to the present.</p>
        <p style={p_style}>All data used is from the <a href="https://www.osha.gov/dep/fatcat/dep_fatcat.html">Department of Labor website</a>. </p>
      </div>
      <Map/>
    </div>
  }
}

// consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
//         <p>Lorem ipsum dolor sit amet, </p> <p>By <a href="https://twitter.com/zischwartz">Zach Schwartz</a> | <a href="https://github.com/zischwartz/womensmarches">Source Code</a></p>
export default App;
