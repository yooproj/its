import React, {Component} from 'react';
import './App.css';
import {KeplerGl} from "@kepler.gl/components";
import {connect, ReactReduxContext} from 'react-redux'
import {addDataToMap} from '@kepler.gl/actions';
import {replaceDataInMap} from "kepler.gl/src/actions";
import {ReplaceDataInMapPayload} from "kepler.gl/src/actions/dist/actions";
import axios from "axios";
import {ParsedConfig} from "@kepler.gl/types/schemas";

class App extends Component<any, any> {
  private readonly alerts_fields: any;
  private readonly veh_fields: any;
  private readonly config: ParsedConfig;

  constructor(props) {
    super(props);
    const DATE_FORMAT = 'h:mm a MMMM DD, YYYY'

    this.alerts_fields = [
      {name: 'id', format: '', type: 'string'},
      {name: 'timestamp', format: '', type: 'timestamp'},
      {name: 'alert.cause', format: '', type: 'string'},
      {name: 'alert.effect', format: '', type: 'string'},
      {name: 'alert.url.translation', format: '', type: 'string'},
      {name: 'stop_id', format: '', type: 'string'},
      {name: 'attributes.stop_code', format: '', type: 'string'},
      {name: 'attributes.stop_lat', format: '', type: 'real'},
      {name: 'attributes.stop_lon', format: '', type: 'real'},
      {name: 'attributes.stop_name', format: '', type: 'string'},
      {name: 'alert_text', format: '', type: 'string'},
      {name: 'description', format: '', type: 'string'},
      {name: 'period_start', format: '', type: 'timestamp'},
      {name: 'period_end', format: '', type: 'timestamp'},
      {name: 'start', format: '', type: 'timestamp'},
      {name: 'end', format: '', type: 'timestamp'},
    ]
    this.veh_fields = [
      {name: 'id', format: '', type: 'string'},
      {name: 'is_deleted',},
      {name: 'vehicle.position.latitude', format: '', type: 'real'},
      {name: 'vehicle.position.longitude', format: '', type: 'real'},
      {name: 'vehicle.position.bearing',},
      {name: 'vehicle.position.speed',},
      {name: 'vehicle.timestamp',},
      {name: 'vehicle.vehicle.id',},
      {name: 'vehicle.vehicle.label',},
      {name: 'vehicle.vehicle.license_plate',},
      {name: 'vehicle.trip.start_time',},
      {name: 'vehicle.trip.start_date',},
      {name: 'vehicle.trip.schedule_relationship',},
      {name: 'vehicle.trip.route_id',},
      {name: 'vehicle.trip.direction_id',},
      {name: 'vehicle.occupancy_status',},
      {name: 'vehicle.position.odometer',},
    ]
    this.config = {
      version: 'v1',
      config: {
        visState: {
          interactionConfig: {
            tooltip: {
              enabled: true,
              fieldsToShow: {
                'alerts': [
                  'attributes.stop_name',
                  'alert_text',
                  {name: 'period_start', format: DATE_FORMAT},
                  {name: 'period_end', format: DATE_FORMAT},
                  'description',
                ]
              }
            }
          }
        }
      }
    } as ParsedConfig;
  }

  setData(response_data, first = false) {
    const vehiclesData = {
      fields: this.veh_fields,
      rows: response_data['vehicles']
    };
    const alertsData = {
      fields: this.alerts_fields,
      rows: (response_data['alerts'])
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
                  id: 'alerts'
                },
                data: alertsData
              },
            ],
            options: {
              centerMap: true,
              readOnly: false,
              keepExistingConfig: false
            },
            config: this.config,
            info: {
              title: 'Taro and Blue',
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
            centerMap: false
          }

        } as ReplaceDataInMapPayload))
    }
  }

  componentDidMount() {
    axios({
      method: 'GET',
      url: 'http://localhost:3000/update',
    }).then(data => {
      this.setData(data.data, true)
      const eventSource = new EventSource('//localhost:3000/sse');
      eventSource.onmessage = ({data}) => {
        const response_data = JSON.parse(data)
        this.setData(response_data)
      }
    })
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
