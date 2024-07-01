// @ts-nocheck
import React, {Component} from 'react';
import './App.css';
import {KeplerGl} from "@kepler.gl/components";
import {connect, ReactReduxContext} from 'react-redux'
import {addDataToMap, fitBounds} from '@kepler.gl/actions';
import {replaceDataInMap} from "kepler.gl/src/actions";
import {ReplaceDataInMapPayload} from "kepler.gl/src/actions/dist/actions";
import axios from "axios";
import {ParsedConfig} from "@kepler.gl/types/schemas";

class App extends Component<any, any> {
  private alerts_fields: any;
  private veh_fields: any;
  private readonly config: any;
  private routesFields: any;

  constructor(props) {
    super(props);
    const DATE_FORMAT = 'h:mm a MMMM DD, YYYY'
    this.state = {off: false}
    this.alerts_fields = []
    this.routesFields = [
      {name: 'index', format: '',},
      {name: 'shape_pt_lat', format: '', type: 'real'},
      {name: 'shape_pt_lon', type: 'real',},
      {name: 'route_id', format: '', type: 'string'},
    ]
    this.veh_fields = []
    this.config = {
      version: 'v1',
      config: {
        visState: {
          layers: [
            {
              type: 'icon',
              id: 'alerts',
              config: {
                dataId: 'alerts',
                label: 'Alerts',
                color: [253, 121, 0],
                columns: {
                  lat: 'attributes.stop_lat',
                  icon: 'icon',
                  lng: 'attributes.stop_lon',
                  altitude: null
                },
                isVisible: true,
                visConfig: {radius: 15},
                highlightColor: [255, 0, 0, 255]
              },
              visualChannels: {
                sizeField: {name: 'Plan', type: 'integer'}
              }
            },
          ],
          interactionConfig: {
            tooltip: {
              enabled: true,
              fieldsToShow: {
                'alerts': [
                  'Stop',
                  'Alert',
                  {name: 'Start', format: DATE_FORMAT},
                  {name: 'End', format: DATE_FORMAT},
                ],
                'vehicles': [
                  'License Plate',
                  'Speed',
                  'Route',
                  'Direction',
                  'Occupancy, 0 to 6, less to more people',
                ]
              }
            }
          }
        }
      }
    } as ParsedConfig;
  }

  buildFields(from) {
    return Object.values(
      from
    ).slice(1).map(v => {
        switch (v.name) {
          case 'attributes.stop_name':
            v.name = 'Stop';
            break;
          case 'alert_text':
            v.name = 'Alert';
            break;
          case 'period_end':
            v.name = 'End';
            break;
          case 'period_start':
            v.name = 'Start';
            break;
          case 'vehicle.vehicle.license_plate':
            v.name = 'License Plate';
            break;
          case 'vehicle.position.speed':
            v.name = 'Speed';
            break;
          case 'vehicle.trip.route_id':
            v.name = 'Route';
            break;
          case 'vehicle.trip.direction_id':
            v.name = 'Direction';
            break;
          case 'vehicle.occupancy_status':
            v.name = 'Occupancy, 1 to 6, less to more people';
            break;
        }

        if (v.type === 'number') {
          v.type = 'real'
        } else if (v.type === 'boolean') {
          v.type = 'bool'
        }
        return v
      }
    )
  }

  setData(response_data, first = false) {
    if (this.veh_fields.length === 0) {
      this.veh_fields = this.buildFields(response_data['vehicles']['schema']['fields'])
    }
    const vehiclesData = {
      fields: this.veh_fields,
      rows: response_data['vehicles']['data'].map(e => Object.values(e).slice(1))
    };

    if (this.alerts_fields.length === 0) {
      this.alerts_fields = this.buildFields(response_data['alerts']['schema']['fields'])
    }
    const alertsData = {
      fields: this.alerts_fields,
      rows: response_data['alerts']['data'].map(e => Object.values(e).slice(1))
    };
    if (first) {
      this.props.dispatch(
        addDataToMap(
          {
            datasets: [
              {
                info: {
                  label: 'Public Transport in Auckland',
                  id: 'vehicles'
                },
                data: vehiclesData
              },
              {
                info: {
                  label: 'Disruptions/Alerts',
                  id: 'alerts',
                  // color: '#ff0000'
                },
                data: alertsData
              },
            ],
            options: {
              centerMap: false,
              readOnly: false,
              autoCreateLayers: false,
              keepExistingConfig: true
            },
            config: this.config,
            info: {
              title: 'Auckland Transport',
              description: 'Auckland Transport'
            },
          }
        ))
    } else {
      this.props.dispatch(
        replaceDataInMap({
          datasetToReplaceId: 'vehicles',
          datasetToUse: {
            info: {
              label: 'Public Transport in Auckland',
              id: 'vehicles'
            },
            data: vehiclesData
          },
          options: {
            centerMap: false,
            autoCreateLayers: false,
            keepExistingConfig: true,
          }

        } as ReplaceDataInMapPayload))
    }
  }

  componentDidMount() {
    this.props.dispatch(fitBounds([174.726308, -36.827554, 174.860643, -36.902692,]));

    axios({
      method: 'GET',
      url: 'http://localhost:3000/update',
    }).then(data => {
      this.setData(data.data, true)
      const eventSource = new EventSource('//localhost:3000/sse');
      eventSource.onmessage = ({data}) => {
        if (this.state.off === true) {
          return;
        }
        const response_data = JSON.parse(data)
        this.setData(response_data)
      }
    })
  }

  render() {
    const updateOff = (e) => {
      this.setState({off: document.querySelector('#off')['checked'] === true})
    }
    const loadRoutes = () => {
      axios({
        method: 'GET',
        url: 'http://localhost:3000/routes',
      }).then(data => {
        const routesData = {
          fields: this.routesFields,
          rows: data.data
        };
        this.props.dispatch(
          addDataToMap(
            {
              datasets: [
                {
                  info: {
                    label: 'Routes',
                    id: 'routes',
                  },
                  data: routesData
                },
              ],
              options: {
                centerMap: false,
                readOnly: false,
                autoCreateLayers: true,
                keepExistingConfig: true
              },
              info: {
                title: 'Auckland Transport',
                description: 'Auckland Transport'
              },
            }
          ))

      })
    }

    const token: string = 'pk.eyJ1IjoibmVrb3phZW1vbiIsImEiOiJjbHc3bXVhOGUxaDZ0MmtxZXJlaG5uODV2In0.r-32TJBbgyDT2kfgpHBfFg'
    return <>
      <div>
        <div className="header">

          <h1>Auckland Public Transport</h1>

          <div className="header-real">Real-time update:</div>
          <div className="normal-container">
            <div className="smile-rating-container">
              <div className="smile-rating-toggle-container">
                <form className="submit-rating">
                  <input id="off" name="satisfaction" type="radio" onClick={updateOff}/>
                  <input id="on" name="satisfaction" type="radio" defaultChecked={true} onClick={updateOff}/>
                  <label htmlFor="off" className="rating-label rating-label-off">Off</label>
                  <div className="smile-rating-toggle"></div>

                  <div className="rating-eye rating-eye-left"></div>
                  <div className="rating-eye rating-eye-right"></div>
                  <div className="mouth rating-eye-bad-mouth"></div>

                  <div className="toggle-rating-pill"></div>
                  <label htmlFor="on" className="rating-label rating-label-on">On</label>
                </form>
              </div>
            </div>
          </div>
          <button className="button-3" role="button" onClick={loadRoutes}>Load routes</button>
        </div>


        <ReactReduxContext.Consumer>
          {({store}) => (
            <div className="App">
              <KeplerGl
                id="foo"
                mapboxApiAccessToken={token}
                store={store}
                height={600}
                width={1300}
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
