from flask import Flask

app = Flask(__name__)
from app import views

app.config['UPLOAD_FOLDER'] = 'uploads'
