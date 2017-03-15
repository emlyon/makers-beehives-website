# coding=utf-8
# source venv/bin/activate

import os, glob
import requests
import json
import dateutil.parser
import datetime, time
from shutil import copyfile
from flask import Flask, request, redirect, url_for

# Settings
RECORD_INTERVAL = 1             # Interval between snaphots in seconds
HISTORY_COUNT = 10              # Number of snapshot to keep

SNAPSHOT_NAME = 'snapshot.jpg'
UPLOAD_PATH = os.path.dirname(os.path.abspath(__file__))+'/static/upload/'

LONGPOLL_TIME = 15
LONGPOLL_INTERVAL = 0.1
LONGPOLL_LIMIT = int(LONGPOLL_TIME/LONGPOLL_INTERVAL)

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

# Shared Bool SETTER
def setBool(name, boole):
    if boole:
        if not getBool(name):
            os.mknod(name+".tmp")
    elif getBool(name):
        os.remove(name+".tmp")

# Shared Bool GETTER
def getBool(name):
    return os.path.isfile(name+".tmp")

# Init
setBool('clik', False)
setBool('clak', False)
setBool('repeat', False)

# Poll SCK
def pollSCK( sck_id ):
    data = {}

    # SCK api
    try:
        req = requests.get('https://api.smartcitizen.me/devices/'+str(sck_id)).json()

        data['sck_id'] = req['id']
        data['sck_name'] = req['name']
        data['sck_city'] = req['data']['location']['city']
        data['sck_country'] = req['data']['location']['country']
        data['sck_inout'] = req['data']['location']['exposure']
        data['sck_lat'] = req['data']['location']['latitude']
        data['sck_long'] = req['data']['location']['longitude']

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

        return data

    except:
        return None

# Home
@webapp.route("/")
def home():
    base = jinja_env.get_template('base.html')
    # dashboard = jinja_env.get_template('dashboard.html')

    data = pollSCK(3723)
    # data['activepage'] = 'dashboard'
    return base.render(data)


# Maps
# @webapp.route("/maps")
# def maps():
#
#     base = jinja_env.get_template('base.html')
#     maps = jinja_env.get_template('maps.html')
#
#     data = pollSCK(3723)
#     data['activepage'] = 'maps'
#     return base.render(data, content=maps.render(data))


# notify
# @webapp.route("/notify")
# def notify():
#
#     base = jinja_env.get_template('base.html')
#
#     data = {}
#     data['activepage'] = 'notify'
#     return base.render(data, content=" ")



# Upload snapshot
@webapp.route("/shot", methods=['POST'])
def snapshot_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'image' not in request.files:
            return 'ERROR: No file..'

        file = request.files['image']
        if not file or file.filename == '' or not allowed_file(file.filename):
            return 'ERROR: Wrong file..'

        # Save Snapshot with Timestamp
        filepath = os.path.join(UPLOAD_PATH, str(int(time.time()))+"_"+SNAPSHOT_NAME)
        file.save(filepath)

        # Remove older ones
        existingfiles = []
        for f in os.listdir(UPLOAD_PATH):
            if os.path.isfile(os.path.join(UPLOAD_PATH, f)):
                existingfiles.append(f)
        existingfiles.sort()
        while len(existingfiles) > HISTORY_COUNT:
            old = existingfiles.pop(0)
            os.remove(os.path.join(UPLOAD_PATH, old))

        # New shot available
        setBool('clak', True)

        # Should we repeat ?
        if getBool('repeat'):
            time.sleep(RECORD_INTERVAL)
            setBool('clik', True)

        return 'SUCCESS'

    return 'ERROR: You\'re lost Dave..'


# Dashboard ask a shot
@webapp.route("/clik/<int:repeat>")
def take_shot(repeat):
    print('clik')
    setBool('clik', True)
    setBool('repeat', (repeat==1))
    return 'OK'


# RPi keep informed
@webapp.route("/clak")
def wait_order():
    wait_clik = 0
    while not getBool('clik') and wait_clik < LONGPOLL_LIMIT:
        time.sleep(LONGPOLL_INTERVAL)
        wait_clik += 1

    if getBool('clik'):
        setBool('clik', False)
        return 'YES'
    else:
        return 'NO'


# Dashboard keep informed
@webapp.route("/news")
def wait_news():

    data = {}

    wait_news = 0
    while not getBool('clak') and wait_news < LONGPOLL_LIMIT:
        time.sleep(LONGPOLL_INTERVAL)
        wait_news += 1

    # New Snaphsot available
    if getBool('clak'):
        setBool('clak', False)
        print('clak')

        # Last snapshot
        newest = max(glob.iglob(UPLOAD_PATH+'*.jpg'), key=os.path.getctime)
        path, filename = os.path.split(newest)

        snapdate = datetime.datetime.fromtimestamp(os.path.getmtime(newest)) + datetime.timedelta(hours=2)
        data['snaptime'] = snapdate.strftime("%d/%m/%Y %H:%M:%S")
        data['snapshot'] = '/static/upload/'+filename

    data['recording'] = getBool('repeat')
    return json.dumps(data)


if __name__ == "__main__":
    webapp.run(host='0.0.0.0')
