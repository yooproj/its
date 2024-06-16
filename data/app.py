from flask import Flask
import urllib.request
import json
import pandas as pd

app = Flask(__name__)

@app.route('/')
def hello():
  try:
    url = "https://api.at.govt.nz/realtime/legacy/vehiclelocations"

    hdr ={
    # Request headers
    'Cache-Control': 'no-cache',
    'Ocp-Apim-Subscription-Key': '',
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


  return entities.to_csv()

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8000)
