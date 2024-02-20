# coding=utf-8

import os
import unittest
import random
import string
import hashlib
import io
import tempfile
import base64
import jwt
import datetime

from uuid import uuid4

from Crypto import Random
from Crypto.Cipher import AES
from common import settings

config = settings.config()
config.read("settings.cfg")

BLOCK_SIZE = 16


def getRandomFilename():
    f = config.getKey("temporary_files")
    if f is None:
        raise Exception("TEMP_UNSET")
    return tempfile.TemporaryFile("w+b", prefix="tmp", dir=f)


def getRandomFileHandle():
    f = config.getKey("temporary_files")
    if f is None:
        raise Exception("TEMPORARY_MISSING")
    return tempfile.SpooledTemporaryFile(max_size=1024 * 1024,
                                         prefix="tmp",
                                         dir=f)


def getRandomChars(r=16):
    return ''.join(
        random.SystemRandom().choice(
            string.ascii_uppercase + string.digits +
            string.ascii_lowercase + string.punctuation
        ) for _ in range(r))

def getRandomCharsNoPunc(r=16):
    return ''.join(
        random.SystemRandom().choice(
            string.ascii_uppercase + string.digits +
            string.ascii_lowercase 
        ) for _ in range(r))

def getSHA256(seed=None):
    if seed is not None:
        t = seed
        if type(seed) is str:
            t = t.encode('UTF-8')
        else:
            raise Exception("CONTENT_MUST_BE_STRING")
        return hashlib.sha256(t).hexdigest()
    else:
        h = None
        n = None
        # with open('/dev/urandom', 'rb') as fp:
        #     n = fp.read(8096)
        n = os.urandom(8096)
        h = hashlib.sha256(n).hexdigest()
        return h


def pad(data):
    length = 16 - (len(data) % 16)
    return data + chr(length) * length


def unpad(data):
    return data.decode("utf-8")[:-ord(data.decode("utf-8")[-1])]


def encrypt(message, passphrase):
    if message is None or len(message) < 1:
        return None
    if len(passphrase) < 32:
        raise Exception("PASSPHRASE_LENGTH_ERROR")
    passphrase = passphrase[:32]
    # pad = lambda s: s + (BS - len(s) % BS) * chr(BS - len(s) % BS) 
    IV = Random.new().read(BLOCK_SIZE)
    if not isinstance(passphrase, bytes):
        passphrase = passphrase.encode('utf-8')
    aes = AES.new(passphrase, AES.MODE_CFB, IV, segment_size=128)
    enc = base64.b64encode(IV + aes.encrypt(pad(message).encode('utf-8')))
    return enc.decode('utf-8')


def decrypt(encrypted, passphrase):
    if encrypted is None or len(encrypted) < 1:
        return None
    if len(passphrase) < 32:
        raise Exception("PASSPHRASE_LENGTH_ERROR")
    passphrase = passphrase[:32]
    encrypted = base64.b64decode(encrypted)
    IV = encrypted[:BLOCK_SIZE]
    if not isinstance(passphrase, bytes):
        passphrase = passphrase.encode('utf-8')
    aes = AES.new(passphrase, AES.MODE_CFB, IV, segment_size=128)
    g = aes.decrypt(encrypted[BLOCK_SIZE:])
    dec = unpad(g)
    return dec

def generatekey(secret, fname):
    key = RSA.generate(2048)
    encrypted_key = key.export_key(passphrase=secret, pkcs=8,
                                  protection="scryptAndAES128-CBC")

    file_out = open(fname, "wb")
    file_out.write(encrypted_key)
    file_out.close()
    return publickey().export_key()

def getkey(secret, fname):
    encoded_key = open(fname, "rb").read()
    key = RSA.import_key(encoded_key, passphrase=secret_code)
    return publickey().export_key()

def generate_sid():
    return str(uuid4())

# https://pyjwt.readthedocs.io/en/stable/
def generate_auth_token(expiration=600):
    auth_token = jwt.encode(
        {
            "confirm": generate_sid(),
            "exp": datetime.datetime.now(tz=datetime.timezone.utc)
                       + datetime.timedelta(seconds=expiration)
        },
        config.getKey('encryption_salt'),
        algorithm="HS256"
    )

    return auth_token


