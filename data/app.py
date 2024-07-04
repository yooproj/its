from flask import Flask
import urllib.request
import json
import pandas as pd
import time
import os

file_stops = './data/stops.json'
file_routes = './data/routes.csv'
orient = 'table'

app = Flask(__name__)

@app.route('/')
def getData():

  response = app.response_class(
    response=json.dumps({'vehicles': json.loads(get_vehicles()), 'alerts': json.loads(get_alerts())}),
    status=200,
    mimetype='application/json'
  )
  return response

@app.route('/routes')
def getRoutes():
  # routes we get from cache (prepare it once by downloading from AT API)
  # do not load it at every request for speed optimization, routes are rarely changing.
  routes_data = []
  try:
    routes_data = pd.read_csv(file_routes)
  except Exception as e:
    routes_data = []

  response = app.response_class(
    response=routes_data.to_json(orient='values'),
    status=200,
    mimetype='application/json'
  )
  return response


def get_vehicles():
  # request data from AT API
  try:
    url = "https://api.at.govt.nz/realtime/legacy/vehiclelocations"

    hdr = {
    'Cache-Control': 'no-cache',
    'Ocp-Apim-Subscription-Key': os.environ.get('AT_KEY'),
    }

    req = urllib.request.Request(url, headers=hdr)

    req.get_method = lambda: 'GET'
    response = urllib.request.urlopen(req)
    if response.getcode() != 200:
      print('Error!!!')
    contents = response.read()
  except Exception as e:
    print(e)

  # data preparation
  data = json.loads(contents)
  entities = pd.json_normalize(data['response']['entity'])

  # data preparation - create unique identifier for each transport for visualization (colors are based on that ID):
  entities['vid'] = ([entities['vehicle.trip.route_id'][i] or entities['vehicle.vehicle.license_plate'][i] or 'V'+entities['vehicle.vehicle.id'][i] for i in entities['vehicle.vehicle.license_plate'].keys()])


  # data preparation - remove unused dataset columns:
  entities = entities.drop(['is_deleted','vehicle.timestamp',
                             'vehicle.trip.trip_id','vehicle.trip.start_time','id',
                             'vehicle.trip.start_date','vehicle.trip.schedule_relationship',
                             'vehicle.position.odometer','vehicle.position.bearing'],axis=1)
  # data preparation - convert numbers to text for clarity:
  entities['vehicle.trip.direction_id'] = entities['vehicle.trip.direction_id'].replace({0.0: 'outbound', 1.0: 'inbound'})

  return entities.to_json(orient=orient)

def get_alerts():
  # request data from AT API
  try:
    url = "https://api.at.govt.nz/realtime/legacy/servicealerts"

    hdr = {
    'Cache-Control': 'no-cache',
    'Ocp-Apim-Subscription-Key': os.environ.get('AT_KEY'),
    }
    req = urllib.request.Request(url, headers=hdr)

    req.get_method = lambda: 'GET'
    response = urllib.request.urlopen(req)
    if response.getcode() != 200:
      print('Error!!!')
    contents = (response.read())

    data = json.loads((contents))
    entities = pd.json_normalize(data['response']['entity'])

  except Exception as e:
    print('alerts Error!!!')
    print(e)
    return '[]'


  # data preparation - json extraction of alert texts:
  alerts_copy = entities.copy()
  alerts_copy = pd.json_normalize(data['response']['entity'],
    ['alert','informed_entity' ], meta=['id'])
  alerts_copy = alerts_copy.drop(['route_id'], axis=1)

  # data preparation - add extracted alert texts to the original dataset:
  n = entities.merge(alerts_copy, on=['id'])
  n.dropna(subset=["stop_id"], inplace=True)

  # data preparation - load stops coordinates dataset:
  stops = pd.json_normalize(json.load(open(file_stops))['data'])
  # data preparation - extraction of needed fields:
  stops = stops[["attributes.stop_code", "attributes.stop_id", "attributes.stop_lat", "attributes.stop_lon", "attributes.stop_name"]]
  stops = stops.rename(columns={"attributes.stop_id": "stop_id"})

  # data preparation - merge alerts and stops datasets in one:
  result = n.merge(stops, on=['stop_id'], how='left')

  copy = result.copy()

  # data preparation - json extraction of alert information:
  copy['alert_text'] = pd.json_normalize(pd.json_normalize(copy['alert.header_text.translation'])[0])['text']
  copy['description'] = pd.json_normalize(pd.json_normalize(copy['alert.description_text.translation'])[0])['text']

  # data preparation - convert dates:
  copy['period_start'] = pd.json_normalize(pd.json_normalize(copy['alert.active_period'])[0])['start']
  copy['period_end'] =   pd.json_normalize(pd.json_normalize(copy['alert.active_period'])[0])['end']

  copy['period_end']= pd.to_datetime(copy['period_end'], unit='s', utc=True)
  copy['period_start']= pd.to_datetime(copy['period_start'], unit='s', utc=True)

  # data preparation - convert to New Zealand timezone:
  copy['period_end'] = copy['period_end'] + pd.Timedelta('12:00:00')
  copy['period_start'] = copy['period_start'] + pd.Timedelta('12:00:00')

  # data preparation - add visualization configuration:
  copy['icon'] = 'alert'

  # data preparation - remove unused data columns:
  copy=copy.drop(['alert.header_text.translation','alert.description_text.translation',
                  'alert.url.translation','stop_id','id','alert.cause',
                  'alert.active_period','alert.informed_entity','timestamp','alert.effect',
                  ], axis=1)

  return copy.to_json(orient=orient)

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8000)
