# coding=utf-8
# pylint: disable=broad-except

import unittest
import os
import random
import base64
import string
import configparser
from Crypto import Random
from Crypto.Cipher import AES


BLOCK_SIZE = 16

def pad(data):
    length = 16 - (len(data) % 16)
    return data + chr(length) * length


def unpad(data):
    return data.decode("utf-8")[:-ord(data.decode("utf-8")[-1])]

class config(object):

    __keys__ = {}
    
    def defaults(self):
        self.__class__.__keys__['DEBUG'] = False
        self.__class__.__keys__['mysql_timeout'] = 60

    def __init__(self):
        if 'config_initialized' not in self.__class__.__keys__:
            # Empty so there is no debugging
           self.defaults()

    def encrypt(self, message, passphrase):
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


    def decrypt(self, encrypted, passphrase):
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

    def setDebug(self):
        self.__class__.__keys__['DEBUG'] = True

    def read(self, fname):
        if 'config_initialized' not in self.__class__.__keys__:
            if not os.path.exists('settings.enc'):
                self.generateEncConfig()
            if os.stat("settings.enc").st_size < 1:
                self.generateEncConfig()
            if os.path.exists("settings.cfg"):
                if os.stat("settings.cfg").st_mtime > os.stat("settings.enc").st_mtime:
                    self.generateEncConfig()
            j = self.loadEncConfig()
            c = configparser.ConfigParser()
            c.read_string(j)
            for option in c.options("Configuration"):
                try:
                    self.__class__.__keys__[option] = c.get("Configuration", option)
                except Exception:
                    self.__class__.__keys__[option] = None
            if 'delete_config' in self.__class__.__keys__ and os.path.exists("settings.cfg"):
                os.unlink("settings.cfg")
            if 'delete_config' in self.__class__.__keys__ and os.path.exists("settings.cfg.tmpl"):
                os.unlink("settings.cfg.tmpl")
            self.__class__.__keys__['config_initialized'] = True

    def loadEncConfig(self):
        o = self.loadKey("rest/.check")
        F = open("settings.enc", "r")
        t = F.read()
        F.close()
        j = self.decrypt(t, o)
        return j

    def loadKey(self, f):
        o = ''.join(random.choices(string.ascii_uppercase + string.digits, k = 32))
        if not os.path.exists(f):
            F = open(f, "w")
            F.write(base64.b64encode(o.encode('utf-8')).decode('utf-8'))
            F.close()
        F = open(f, "r")
        o = base64.b64decode(F.read())
        F.close()
        return o

    def generateEncConfig(self):
        o = self.loadKey("rest/.check")
        F = open("settings.cfg", "r")
        t = F.read()
        e = self.encrypt(t, o)
        F.close()
        F = open("settings.enc", "wb")
        F.write(e.encode('utf-8'))
        F.close()
        os.chmod("settings.enc", 0o600)

    def setKey(self, key, value):
        self.__class__.__keys__[key] = value

    def getKey(self, key):
        try:
            return self.__class__.__keys__[key]
        except Exception:
            return None

    def update(self, newDict):
        for key in newDict:
            self.__class__.__keys__[key] = newDict[key]

    def getFailTemplate(self):
        fail = {'success': False}
        return fail

    def getSuccessTemplate(self):
        success = {'success': True}
        return success
