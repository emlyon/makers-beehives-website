# coding=utf-8

import os
import requests
import json
import dateutil.parser
import datetime
from flask import Flask, request, redirect, url_for
from werkzeug.utils import secure_filename

SNAPSHOT_NAME = 'snapshot.jpg'

# Flask Webserver
webapp = Flask(__name__)
webapp.config['UPLOAD_FOLDER'] = os.path.dirname(os.path.abspath(__file__))+'/static/upload/'

# Dashboard Template
from jinja2 import Environment, PackageLoader
jinja_env = Environment(loader=PackageLoader('server', 'views'))

# Check file upload
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

# Home
@webapp.route("/")
def home():

    dashboard = jinja_env.get_template('base.html')

    data = {}

    # Snapshot
    snapdate = datetime.datetime.fromtimestamp(os.path.getmtime(webapp.config['UPLOAD_FOLDER']+SNAPSHOT_NAME))
    snapdate += datetime.timedelta(hours=2)
    data['image'] = {'updated': snapdate.strftime("%d/%m/%Y %H:%M:%S") }

    # SCK api
    req = requests.get('https://api.smartcitizen.me/devices/3723').json()

    data['sck_id'] = req['id']
    data['sck_name'] = req['name']
    data['sck_city'] = req['data']['location']['city']
    data['sck_country'] = req['data']['location']['country']
    data['sck_inout'] = req['data']['location']['exposure']

    for sensor in req['data']['sensors']:
        if sensor['id'] == 12: key = 'temp'
        elif sensor['id'] == 13: key = 'humi'
        elif sensor['id'] == 7: key = 'noise'
        elif sensor['id'] == 14: key = 'light'
        else: key = None
        if key:
            sckdate = dateutil.parser.parse(req['last_reading_at'])
            sckdate += datetime.timedelta(hours=2)
            data[key] = {'value': round(sensor['value'],2), 'updated': sckdate.strftime("%d/%m/%Y %H:%M:%S")}

    return dashboard.render(data)

# Upload snapshot
@webapp.route("/snapshot", methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'image' not in request.files:
            return 'ERROR: No file..'

        file = request.files['image']
        if not file or file.filename == '' or not allowed_file(file.filename):
            return 'ERROR: Wrong file..'

        #filename = secure_filename(file.filename)
        filename = SNAPSHOT_NAME
        file.save(os.path.join(webapp.config['UPLOAD_FOLDER'], filename))
        return 'SUCCESS!'
    return 'ERROR: You\'re lost Dave..'



if __name__ == "__main__":
    webapp.run()
