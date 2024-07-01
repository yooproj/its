from flask import Flask
import urllib.request
import json
import pandas as pd
import time
import os


file = './data/request.txt'
vehicles_response_cache = './data/vehicles_response_cache.txt'
file_vehicles_request = './data/vehicles_requests.txt'
alerts_response_cache = './data/alerts_response_cache.txt'
file_alerts_request = './data/alerts_requests.txt'
file_wait_seconds = './data/wait_seconds'
file_stops = './data/stops.json'
orient = 'table'
file_routes_cache = './data/routes.csv'
app = Flask(__name__)


@app.route('/')
def getData():
  vehicles = []

  vehicles = get_vehicles()

  response = app.response_class(
    response=json.dumps({'vehicles': json.loads(vehicles), 'alerts': json.loads(get_alerts())}),
    status=200,
    mimetype='application/json'
  )
  return response

@app.route('/routes')
def getRoutes():
  routes_data=[]
  try:
    routes_data = pd.read_csv(file_routes_cache)

  except Exception as e:
    routes_data=[]

  response = app.response_class(
    response=routes_data.to_json(orient='values'),
    status=200,
    mimetype='application/json'
  )
  return response


def can_make_request():
  wait_seconds = 60
  try:
    with open(file_wait_seconds, 'r') as f:
      wait_seconds = int(f.read())
      print('wait_seconds ')
      print(wait_seconds)
  except Exception as e:
    wait_seconds = 60

  try:
    with open(file, 'r') as f:
      read_data = f.read()

      if (time.time() - int(read_data) < wait_seconds):
        print('not yet')
        return False
      else:
        f = open(file, "w")
        f.write(str(int(time.time())))
        f.close()
        print('can make request')
        return True
  except Exception as e:
    f = open(file, "w")
    f.write(str(int(time.time())))
    f.close()
    return True





def get_vehicles():
  if can_make_request() == False:
    try:
      with open(vehicles_response_cache, 'r') as f:
        return f.read()
    except Exception as e:
      print('no cache')
      return '[]'

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

  data = json.loads(contents)
  entities = pd.json_normalize(data['response']['entity'])

  entities = entities.drop(['is_deleted','vehicle.timestamp',
                             'vehicle.trip.trip_id','vehicle.trip.start_time','id',
                             'vehicle.trip.start_date','vehicle.trip.schedule_relationship',
                             'vehicle.position.odometer','vehicle.position.bearing'],axis=1)
  entities['vehicle.trip.direction_id'] = entities['vehicle.trip.direction_id'].replace({0.0: 'outbound', 1.0: 'inbound'})
  response = entities.to_json(orient=orient)

  entities.to_json(vehicles_response_cache, orient=orient)
  numf = open(file_vehicles_request, "a")
  numf.write(str(int(time.time()))+"\n")
  numf.close()


  return response

def get_alerts():
  if can_make_request() == False:
    try:
      with open(alerts_response_cache, 'r') as f:
        return f.read()
    except Exception as e:
      print('no alerts cache')

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


  alerts_copy = entities.copy()
  alerts_copy = pd.json_normalize(data['response']['entity'],
    ['alert','informed_entity' ], meta=['id'])
  alerts_copy = alerts_copy.drop(['route_id'], axis=1)

  n = entities.merge(alerts_copy, on=['id'])
  n.dropna(subset=["stop_id"], inplace=True)

  stops = pd.json_normalize(json.load(open(file_stops))['data'])
  stops = stops[["attributes.stop_code", "attributes.stop_id", "attributes.stop_lat", "attributes.stop_lon", "attributes.stop_name"]]
  stops = stops.rename(columns={"attributes.stop_id": "stop_id"})

  result = n.merge(stops, on=['stop_id'], how='left')

  copy = result.copy()
  copy['alert_text'] = pd.json_normalize(pd.json_normalize(copy['alert.header_text.translation'])[0])['text']

  copy['description'] = pd.json_normalize(pd.json_normalize(copy['alert.description_text.translation'])[0])['text']

  copy['period_start'] = pd.json_normalize(pd.json_normalize(copy['alert.active_period'])[0])['start']
  copy['period_end'] = pd.json_normalize(pd.json_normalize(copy['alert.active_period'])[0])['end']

  copy['start'] = pd.json_normalize(pd.json_normalize(copy['alert.active_period'])[0])['start']
  copy['end'] = pd.json_normalize(pd.json_normalize(copy['alert.active_period'])[0])['end']
  copy['icon'] = 'alert'


  copy['period_end']= pd.to_datetime(copy['period_end'], unit='s', utc=True)
  copy['period_start']= pd.to_datetime(copy['period_start'], unit='s', utc=True)

  # convert to New Zealand timezone
  copy['period_end'] = copy['period_end'] + pd.Timedelta('12:00:00')
  copy['period_start'] = copy['period_start'] + pd.Timedelta('12:00:00')

  copy=copy.drop(['alert.header_text.translation','alert.description_text.translation',
                  'alert.url.translation','stop_id','id','alert.cause',
                  'alert.active_period','alert.informed_entity','timestamp','alert.effect',
                  'end','start',],axis=1)
  result=copy

  result.to_json(alerts_response_cache, orient=orient)
  numf = open(file_alerts_request, "a")
  numf.write(str(int(time.time()))+"\n")
  numf.close()

  return result.to_json(orient=orient)

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8000)
