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
    'Ocp-Apim-Subscription-Key': '5539b638eac44c629cc7c3b6b3c5b1be',
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


  return entities.to_json(orient='values')

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8000)
