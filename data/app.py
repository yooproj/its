from flask import Flask
import urllib.request
import json
import pandas as pd
import time
import os

file = 'request.txt'
response_cache = 'response_cache.txt'
wait_seconds = 30
app = Flask(__name__)

@app.route('/')
def hello():
  try:
    with open(file, 'r') as f:
      read_data = f.read()

      if (time.time() - int(read_data) < wait_seconds):
        print('not yet')
      else:
        f = open(file, "w")
        f.write(str(int(time.time())))
        f.close()
        print('can make request')
        return get_vehicles()
  except Exception as e:
    f = open(file, "w")
    f.write(str(int(time.time())))
    f.close()

  try:
    with open(response_cache, 'r') as f:
      return f.read()
  except Exception as e:
    print('no cache')
  return {} # add file contents

def get_vehicles():
  try:
    url = "https://api.at.govt.nz/realtime/legacy/vehiclelocations"

    hdr = {
    'Cache-Control': 'no-cache',
    'Ocp-Apim-Subscription-Key': os.environ.get('AT_KEY'),
    }

    req = urllib.request.Request(url, headers=hdr)

    req.get_method = lambda: 'GET'
    response = urllib.request.urlopen(req)
    print(response.getcode())
    if response.getcode() != 200:
      print('Error!!!')
    contents = response.read()
  except Exception as e:
    print(e)

  data = json.loads(contents)
  entities = pd.json_normalize(data['response']['entity'])
  response = entities.to_json(orient='values')

  f = open(response_cache, "w")
  f.write(response)
  f.close()
  numf = open('num.txt', "a")
  numf.write(str(int(time.time()))+"\n")
  numf.close()


  return response

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8000)
