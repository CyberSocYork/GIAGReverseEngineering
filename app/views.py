import hashlib
import os
import time
import json

from flask import render_template, request, jsonify

from app import app



@app.route('/', methods=["POST","GET"])
def hello_world():

    if request.method == "GET":
        return "The SQL challenge has now been taken down. I'll provide the source code for it soon"
    if request.method == "POST":

        try:
            username = request.json['username']
            password = request.json['password']
        except KeyError:
            return "Invalid request"

        if username == "Alice" and password == "password":
            return "welcome back alice"
        else:
            return "invalid login"


    else:
        return ""


@app.route('/getUserNames', methods = ["POST"])
def getUserNames():

    if request.method == "POST":
        authId, authPassword = checkParams(request)

        if auth(authId,authPassword):
            with open((os.path.join(os.path.dirname(__file__),'entries.json')),'r') as f:
                return jsonify(json.load(f))
        else:
            return ""
    else:
        return ""



@app.route('/getAuthentication',methods=["GET"])
def getAuthentication():

    return "authId : cyberSocAdmin , authPassword : toor"



def checkParams(request):

    try:
        authId = request.json['authId']
        authPassword = request.json['authPassword']
    except KeyError:
        return None, None

    return authId,authPassword

def auth(authId, authPassword):

    if authId == "cyberSocAdmin" and authPassword == "toor":
        return True
    else:
        return False