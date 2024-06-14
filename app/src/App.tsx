import React, {Component} from 'react';
import './App.css';
import {KeplerGl} from "@kepler.gl/components";
import {connect, ReactReduxContext} from 'react-redux'
import {addDataToMap} from '@kepler.gl/actions';
import {replaceDataInMap} from "kepler.gl/src/actions";
import {ProtoDataset} from "@kepler.gl/types";
import {ReplaceDataToMapOptions} from "@kepler.gl/actions/dist/actions";
import {ReplaceDataInMapPayload} from "kepler.gl/src/actions/dist/actions";

class App extends Component<any, any> {
  componentDidMount() {



    const sampleTripData = {
      fields: [
        {name: 'tpep_pickup_datetime', format: 'YYYY-M-D H:m:s', type: 'timestamp'},
        {name: 'pickup_longitude', format: '', type: 'real'},
        {name: 'pickup_latitude', format: '', type: 'real'}
      ],
      rows: [
        [
          ['2015-01-15 19:05:39 +00:00',  174.76219,-36.848450]
        ]
      ]
    };
    const eventSource = new EventSource('//localhost:3000/sse');
    eventSource.onmessage = ({ data }) => {

      const sampleTripData2 = {
        fields: [
          {name: 'tpep_pickup_datetime', format: 'YYYY-M-D H:m:s', type: 'timestamp'},
          {name: 'pickup_longitude', format: '', type: 'real'},
          {name: 'pickup_latitude', format: '', type: 'real'}
        ],
        rows: JSON.parse(data)
      };
      console.log(data)
      this.props.dispatch(
        replaceDataInMap({
          datasetToReplaceId: 'test_trip_data',
          datasetToUse: {
            info: {
              label: 'Sample Taxi Trips in New York City',
              id: 'test_trip_data'
            },
            data: sampleTripData2
          },
          options:{
            centerMap: false
          }

        } as ReplaceDataInMapPayload))
    }
    const sampleConfig = {
      // visState: {
        // filters: [
        //   {
        //     id: 'me',
        //     dataId: 'test_trip_data',
        //     name: 'tpep_pickup_datetime',
        //     type: 'timeRange',
        //     view: 'enlarged',
        //     value: ''
        //   }
        // ]
      // }
    }


    // setTimeout(() => {
    //   debugger
    this.props.dispatch(
      addDataToMap(
        {
          datasets: {
            info: {
              label: 'Sample Taxi Trips in New York City',
              id: 'test_trip_data'
            },
            data: sampleTripData
          },
          options: {
            centerMap: true,
            readOnly: false,
            keepExistingConfig: false
          },
          info: {
            title: 'Taro and Blue',
            description: 'This is my map'
          },
          config: sampleConfig
        }
      ))
  }

  render() {


    const token: string = 'pk.eyJ1IjoibmVrb3phZW1vbiIsImEiOiJjbHc3bXVhOGUxaDZ0MmtxZXJlaG5uODV2In0.r-32TJBbgyDT2kfgpHBfFg'
    return <>
      <div>
        <h1>Start Screen</h1>
        <ReactReduxContext.Consumer>
          {({store}) => (
            <div className="App">
              <KeplerGl
                id="foo"
                mapboxApiAccessToken={token}
                store={store}
                height={600}
                width={1200}
              />
            </div>
          )}
        </ReactReduxContext.Consumer>
      </div>
    </>;
  }

}

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});
export default connect(mapStateToProps, dispatchToProps)(App);
