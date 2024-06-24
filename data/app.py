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


def can_make_request():
  wait_seconds = 60
  with open(file_wait_seconds, 'r') as f:
    wait_seconds = int(f.read())
    print('wait_seconds ')
    print(wait_seconds)

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
      return []

  try:
    url = "https://api.at.govt.nz/realtime/legacy/vehiclelocations"

    hdr = {
    'Cache-Control': 'no-cache',
    'Ocp-Apim-Subscription-Key': os.environ.get('AT_KEY'),
    }

    req = urllib.request.Request(url, headers=hdr)

    req.get_method = lambda: 'GET'
    response = urllib.request.urlopen(req)
#     print(response.getcode())
    if response.getcode() != 200:
      print('Error!!!')
    contents = response.read()
  except Exception as e:
    print(e)

  data = json.loads(contents)
  entities = pd.json_normalize(data['response']['entity'])
  response = entities.to_json(orient='values')

  f = open(vehicles_response_cache, "w")
  f.write(response)
  f.close()
  numf = open(file_vehicles_request, "a")
  numf.write(str(int(time.time()))+"\n")
  numf.close()


  return response

def get_alerts():
  print('get_alerts   ')
  if can_make_request() == False:
    try:
      with open(alerts_response_cache, 'r') as f:
        return f.read()
    except Exception as e:
      print('no alerts cache')

  print('before try ')
  try:
    url = "https://api.at.govt.nz/realtime/legacy/servicealerts"

    hdr = {
    'Cache-Control': 'no-cache',
    'Ocp-Apim-Subscription-Key': os.environ.get('AT_KEY'),
    }
    print('before req')
    req = urllib.request.Request(url, headers=hdr)
    print('after req')

    req.get_method = lambda: 'GET'
    response = urllib.request.urlopen(req)
    print(' alerts req     ')
    print(response.getcode())
    if response.getcode() != 200:#
      print('Error    !!!')
    contents = (response.read())
#     f = open(alerts_response_cache, "w")
#     f.write(js)
#     f.close()

    data = json.loads((contents))
    entities = pd.json_normalize(data['response']['entity'])
    js = entities.to_json(orient='values')

  except Exception as e:
    print('alerts Error!!!')
    print(e)
    return []

  print('writing cache')
  f = open(alerts_response_cache, "w")
  f.write(js)
  f.close()
  numf = open(file_alerts_request, "a")
  numf.write(str(int(time.time()))+"\n")
  numf.close()


  return js

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8000)
