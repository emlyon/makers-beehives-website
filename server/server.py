# coding=utf-8

# source venv/bin/activate

import os, glob
import requests
import json
import dateutil.parser
import datetime, time
from shutil import copyfile
from flask import Flask, request, redirect, url_for

from StringIO import StringIO
import requests

# Flask Webserver
webapp = Flask(__name__)

# Dashboard Template
from jinja2 import Environment, PackageLoader
jinja_env = Environment(loader=PackageLoader('server', 'views'))


sheetGids = [ '0', '276788529', '1484690480', '77643038' ]
# Poll SpreadSheet
def pollSheet(sheet_id):
    try:
        r = requests.get( 'https://docs.google.com/spreadsheets/d/1cJRaDxrSRpd754ncW69N8Kk84PlfYFvD9PlvOZIjPls/export?format=csv&id=1cJRaDxrSRpd754ncW69N8Kk84PlfYFvD9PlvOZIjPls&gid=' + sheet_id )
        data = r.content

        return data

    except:
        return None

# Home
@webapp.route("/")
def home():
    base = jinja_env.get_template('base.html')
    dashboard = jinja_env.get_template('dashboard.html')

    data = {}
    data['scks'] = []
    data['scks'].append( pollSheet( sheetGids[ 0 ] ) )
    data['scks'].append( pollSheet( sheetGids[ 1 ] ) )
    print "data:"
    print data
    # data['activepage'] = 'dashboard'
    return base.render(data, content=dashboard.render(data))


if __name__ == "__main__":
    webapp.run(host='0.0.0.0')
