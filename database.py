from flask_sqlalchemy import SQLAlchemy
         
db = SQLAlchemy()
         
class Users(db.Model):
    __tablename__ = "frusers"
    id = db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(255), index=True)
    email = db.Column(db.String(150), index=True, unique=True)
    password = db.Column(db.String(255), index=True)