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
    this.state = {off: true, interval: 1}
    this.alerts_fields = []
    this.routesFields = [
      {name: 'index', format: '',},
      {name: 'shape_pt_lat', format: '', type: 'real'},
      {name: 'shape_pt_lon', type: 'real',},
      {name: 'Route', format: '', type: 'string'},
    ]
    this.veh_fields = []
    this.config = {
      version: 'v1',
      config: {
        visState: {
          "filters": [

            {
              "dataId": [
                "routes"
              ],
              "id": "rjzywhi6",
              "name": [
                "Route"
              ],
              "type": "multiSelect",
              "value": [],
              "plotType": "histogram",
              "animationWindow": "free",
              "yAxis": null,
              "view": "side",
              "speed": 1,
              "enabled": true
            },
            {
              "dataId": [
                "vehicles"
              ],
              "id": "ke35bdwt",
              "name": [
                "License Plate"
              ],
              "type": "multiSelect",
              "value": [],
              "plotType": "histogram",
              "animationWindow": "free",
              "yAxis": null,
              "view": "side",
              "speed": 1,
              "enabled": true
            },
            {
              "dataId": [
                "alerts"
              ],
              "id": "a30bvjyz",
              "name": [
                "Stop"
              ],
              "value": [],
              "type": "multiSelect",
              "plotType": "histogram",
              "animationWindow": "free",
              "yAxis": null,
              "view": "side",
              "speed": 1,
              "enabled": true
            },
            {
              "dataId": [
                "vehicles"
              ],
              "id": "dg3hisz",
              "name": [
                "Route"
              ],
              "type": "multiSelect",
              "value": [],
              "plotType": "histogram",
              "animationWindow": "free",
              "yAxis": null,
              "view": "side",
              "speed": 1,
              "enabled": true
            },
          ],
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
                visConfig: {
                  radius: 20,
                  "opacity": 1,
                },
                highlightColor: [255, 0, 0, 255]
              },
              visualChannels: {
                sizeField: {name: 'Plan', type: 'integer'}
              }
            },
            {
              "id": "4i842mg",
              "type": "point",
              "config": {
                "dataId": "routes",
                "label": "Routes",
                "color": [
                  231,
                  159,
                  213
                ],
                "highlightColor": [
                  252,
                  242,
                  26,
                  255
                ],
                "columns": {
                  "lat": "shape_pt_lat",
                  "lng": "shape_pt_lon"
                },
                "isVisible": true,
                "visConfig": {
                  "radius": 10,
                  "fixedRadius": false,
                  "opacity": 0.8,
                  "outline": false,
                  "thickness": 2,
                  "strokeColor": null,
                  "colorRange": {
                    "name": "Custom Palette",
                    "type": "custom",
                    "category": "Custom",
                    "colors": [
                      "#12939A",
                      "#DDB27C",
                      "#88572C",
                      "#FF991F",
                      "#F15C17",
                      "#223F9A",
                      "#DA70BF",
                      "#125C77",
                      "#4DC19C",
                      "#776E57",
                      "#17B8BE",
                      "#F6D18A",
                      "#B7885E",
                      "#FFCB99",
                      "#F89570",
                      "#829AE3",
                      "#E79FD5",
                      "#1E96BE",
                      "#89DAC1",
                      "#B3AD9E",
                      "#83795e",
                      "#ca25ca",
                      "#527552"
                    ]
                  },
                  "strokeColorRange": {
                    "name": "Global Warming",
                    "type": "sequential",
                    "category": "Uber",
                    "colors": [
                      "#5A1846",
                      "#900C3F",
                      "#C70039",
                      "#E3611C",
                      "#F1920E",
                      "#FFC300"
                    ]
                  },
                  "radiusRange": [
                    0,
                    50
                  ],
                  "filled": true
                },
                "hidden": false,
                "textLabel": [
                  {
                    "field": null,
                    "color": [
                      255,
                      255,
                      255
                    ],
                    "size": 18,
                    "offset": [
                      0,
                      0
                    ],
                    "anchor": "start",
                    "alignment": "center",
                    "outlineWidth": 0,
                    "outlineColor": [
                      255,
                      0,
                      0,
                      255
                    ],
                    "background": false,
                    "backgroundColor": [
                      0,
                      0,
                      200,
                      255
                    ]
                  }
                ]
              },
              "visualChannels": {
                "colorField": {
                  "name": "Route",
                  "type": "string"
                },
                "colorScale": "ordinal",
                "strokeColorField": null,
                "strokeColorScale": "quantile",
                "sizeField": null,
                "sizeScale": "linear"
              }
            },
            {
              type: 'point',
              id: 'vehicles',
              "config": {
                "dataId": "vehicles",
                "label": "Transport",
                "color": [
                  18,
                  147,
                  154
                ],
                "highlightColor": [
                  252,
                  242,
                  26,
                  255
                ],
                "columns": {
                  "lat": "vehicle.position.latitude",
                  "lng": "vehicle.position.longitude"
                },
                "isVisible": true,
                "visConfig": {
                  "radius": 18,
                  "fixedRadius": false,
                  "opacity": 1,
                  "outline": false,
                  "thickness": 2,
                  "strokeColor": null,
                  "colorRange": {
                    "name": "Uber Viz Qualitative 4",
                    "type": "qualitative",
                    "category": "Uber",
                    "colors": [
                      "#12939A",
                      "#DDB27C",
                      "#88572C",
                      "#223F9A",
                      "#DA70BF",
                      "#125C77",
                      "#4DC19C",
                      "#776E57",
                      "#17B8BE",
                      "#F6D18A",
                      "#B7885E",
                      "#FFCB99",
                      "#F89570",
                      "#829AE3",
                      "#E79FD5",
                      "#1E96BE",
                      "#89DAC1",
                      "#B3AD9E",
                      "#5A1846",
                      "#900C3F",
                      "#C70039",
                      "#FFC300",
                      "#a9a9a9",
                      "#dcdcdc",
                      "#2f4f4f",
                      "#556b2f",
                      "#8b4513",
                      "#191970",
                      "#006400",
                      "#708090",
                      "#8b0000",
                      "#808000",
                      "#3cb371",
                      "#bc8f8f",
                      "#663399",
                      "#008080",
                      "#b8860b",
                      "#bdb76b",
                      // "#cd853f",
                      "#4682b4",
                      // "#d2691e",
                      "#9acd32",
                      "#cd5c5c",
                      "#00008b",
                      "#32cd32",
                      "#8fbc8f",
                      "#800080",
                      "#b03060",
                      "#48d1cc",
                      "#9932cc",
                      "#ff0000",
                      // "#ffa500",
                      "#ffd700",
                      "#c71585",
                      "#0000cd",
                      "#7cfc00",
                      "#deb887",
                      "#00ff00",
                      "#00fa9a",
                      "#4169e1",
                      "#e9967a",
                      "#dc143c",
                      "#00ffff",
                      "#00bfff",
                      "#9370db",
                      "#0000ff",
                      "#a020f0",
                      "#ff6347",
                      "#ff00ff",
                      "#db7093",
                      "#ffff54",
                      "#6495ed",
                      "#dda0dd",
                      "#90ee90",
                      "#87ceeb",
                      "#ff1493",
                      "#afeeee",
                      "#ee82ee",
                      "#7fffd4",
                      "#ff69b4",
                      "#ffe4c4",
                      "#ffc0cb",
                      '#cbd5e1',
                      '#94a3b8',
                      '#7c3aed',
                      '#f0abfc',
                      '#d946ef',
                      '#fecdd3',
                      '#fda4af',
                      '#fb7185',
                      '#92ffaa',
                      '#d62d4c',
                    ]
                  },
                  "strokeColorRange": {
                    "name": "Global Warming",
                    "type": "sequential",
                    "category": "Uber",
                    "colors": [
                      "#5A1846",
                      "#900C3F",
                      "#C70039",
                      "#E3611C",
                      "#F1920E",
                      "#FFC300"
                    ]
                  },
                  "radiusRange": [
                    0,
                    50
                  ],
                  "filled": true
                },
                "hidden": false,
                "textLabel": [
                  {
                    "field": null,
                    "color": [
                      255,
                      255,
                      255
                    ],
                    "size": 18,
                    "offset": [
                      0,
                      0
                    ],
                    "anchor": "start",
                    "alignment": "center",
                    "outlineWidth": 0,
                    "outlineColor": [
                      255,
                      0,
                      0,
                      255
                    ],
                    "background": false,
                    "backgroundColor": [
                      0,
                      0,
                      200,
                      255
                    ]
                  }
                ]
              },
              "visualChannels": {
                "colorField": {
                  "name": "vid",
                  "type": "string"
                },
                "colorScale": "ordinal",
                "strokeColorField": null,
                "strokeColorScale": "quantile",
                "sizeField": null,
                "sizeScale": "linear"
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
      if (!this.state.off) {
        setTimeout(() => {
          this.updateVehicles()
        }, this.state.interval * 1000)
      }
    })
  }

  updateVehicles() {
    console.log((new Date()).toISOString())
    axios({
      method: 'GET',
      url: 'http://localhost:3000/update',
    }).then(data => {
      this.setData(data.data)
      if (!this.state.off) {
        setTimeout(() => {
          this.updateVehicles()
        }, this.state.interval * 1000)
      }
    })
  }

  render() {
    const updateInterval = () => {
      const input = document.querySelector('.js-interval')
      const interval = +(input['value'])
      if (Number.isInteger(interval) && interval > 0) {
        this.setState({...this.state, interval: interval})
      } else {
        input['value'] = 1
      }
    }
    const updateOff = (e) => {
      const isUpdateOff = document.querySelector('#off')['checked'] === true
      this.setState({off: isUpdateOff})
      if (!isUpdateOff) {
        setTimeout(() => {
          this.updateVehicles()
        }, this.state.interval * 1000)
      }

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
        <h1 style={{marginLeft: '20px'}}>Auckland Public Transport</h1>

        <div className="header">
          <div className="header-real">Real-time update:</div>
          <div className="normal-container">
            <div className="smile-rating-container">
              <div className="smile-rating-toggle-container">
                <form className="submit-rating">
                  <input id="off" name="satisfaction" type="radio" defaultChecked={true} onClick={updateOff}/>
                  <input id="on" name="satisfaction" type="radio" onClick={updateOff}/>
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
          <div className="label-update-interval label-update-interval-1">every</div>
          <input className="update-interval js-interval" type="number" defaultValue="1" onChange={updateInterval}
          />
          <div className="label-update-interval label-update-interval-2">seconds</div>
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
