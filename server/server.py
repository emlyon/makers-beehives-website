# coding=utf-8

# source venv/bin/activate

import os
import requests
import json
import dateutil.parser
import datetime, time
from shutil import copyfile
from flask import Flask, request, redirect, url_for

SNAPSHOT_NAME = 'snapshot.jpg'
USERSHOT_NAME = 'usershot.jpg'
UPLOAD_PATH = os.path.dirname(os.path.abspath(__file__))+'/static/upload/'

# Flask Webserver
webapp = Flask(__name__)
webapp.config['UPLOAD_FOLDER'] = UPLOAD_PATH

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
    try:
        snapdate = datetime.datetime.fromtimestamp(os.path.getmtime(UPLOAD_PATH+SNAPSHOT_NAME))
        snapdate += datetime.timedelta(hours=2)
        data['image'] = {'updated': snapdate.strftime("%d/%m/%Y %H:%M:%S") }
    except:
        data['image'] = {'updated': '...' }


    # SCK api
    try:
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

    except:
        return "SCK API unavailable"


# Upload snapshot
@webapp.route("/snapshot", methods=['GET', 'POST'])
def snapshot_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'image' not in request.files:
            return 'ERROR: No file..'

        file = request.files['image']
        if not file or file.filename == '' or not allowed_file(file.filename):
            return 'ERROR: Wrong file..'

        # Save last Snapshot
        filepath = os.path.join(webapp.config['UPLOAD_FOLDER'], SNAPSHOT_NAME)
        file.save(filepath)

        # Save last Snapshot
        filepath2 = os.path.join(webapp.config['UPLOAD_FOLDER'], str(int(time.time()))+"_"+SNAPSHOT_NAME)
        copyfile(filepath, filepath2)

        # Remove older ones
        existingfiles = [f for f in os.listdir(webapp.config['UPLOAD_FOLDER'])
                            if os.path.isfile(os.path.join(webapp.config['UPLOAD_FOLDER'], f))]
        existingfiles.sort()
        while len(existingfiles) > 10:
            old = existingfiles.pop(0)
            os.remove(os.path.join(webapp.config['UPLOAD_FOLDER'], old))

        return 'SUCCESS'
    return 'ERROR: You\'re lost Dave..'


# Upload usershot
@webapp.route("/shot", methods=['GET', 'POST'])
def usershot_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'image' not in request.files:
            return 'ERROR: No file..'

        file = request.files['image']
        if not file or file.filename == '' or not allowed_file(file.filename):
            return 'ERROR: Wrong file..'

        # Save last Usershot
        filepath = os.path.join(webapp.config['UPLOAD_FOLDER'], USERSHOT_NAME)
        file.save(filepath)

        setBool('clac', True)

        return 'SUCCESS'
    return 'ERROR: You\'re lost Dave..'


def setBool(name, boole):
        if boole:
            os.mknod(name+".tmp")
        elif getBool(name):
            os.remove(name+".tmp")

def getBool(name):
        return os.path.isfile(name+".tmp")

setBool('clic', False)
setBool('clac', False)

# Dashboard ask a shot
@webapp.route("/clic")
def take_shot():
    print('clic')
    setBool('clic', True)
    wait_clac = 0
    while not getBool('clac') and wait_clac < 50:
        time.sleep(0.1)
        wait_clac += 1

    if getBool('clac'):
        setBool('clac', False)
        print('clac')
        return '/static/upload/'+USERSHOT_NAME
    else:
        return 'FAILED'


# RPi ask if shot should be taken
@webapp.route("/clac")
def should_shot():
    wait_clic = 0
    while not getBool('clic') and wait_clic < 50:
        time.sleep(0.1)
        wait_clic += 1

    if getBool('clic'):
        setBool('clic', False)
        return 'YES'
    else:
        return 'NO'



if __name__ == "__main__":
    webapp.run(host='0.0.0.0')
