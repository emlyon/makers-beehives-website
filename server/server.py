# coding=utf-8
# source venv/bin/activate

import os, glob
from flask import Flask, request, redirect, url_for
from StringIO import StringIO

# Flask Webserver
webapp = Flask( __name__ )

# Dashboard Template
from jinja2 import Environment, PackageLoader
jinja_env = Environment( loader=PackageLoader( "server", "views" ) )

# Home
@webapp.route( "/" )
def home():
    base = jinja_env.get_template( "base.html" )
    return base.render()

if __name__ == "__main__":
    webapp.run( host="0.0.0.0" )
