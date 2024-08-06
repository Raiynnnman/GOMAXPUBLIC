# coding=utf-8

import os
import json
import mysql.connector
from mysql.connector import pooling
import sqlite3
import time
from os import walk
from common import settings
from threading import Lock
from mysql.connector.errors import OperationalError
from mysql.connector.errors import PoolError


config = settings.config()
config.read("settings.cfg")

class DBManager(object):

    __instance = None
    _dbConnection = None
    _testdb = False
    _connect_timeout = None
    _recycle_time = None
    _pool_size = 32

    #  Make a Singleton
    def __new__(cls, *args, **kwargs):
        if not DBManager.__instance:
            DBManager.__instance = object.__new__(cls)
        return DBManager.__instance

    def __init__(self):
        self._engine_lock = Lock()

    def getConnection(self):
        with self._engine_lock:
            if not self._dbConnection:
                self._dbConnection = pooling.MySQLConnectionPool(
                    pool_name = "dspool",
                    pool_size = self._pool_size,
                    pool_reset_session=True,
                    host=config.getKey("mysql_host"), 
                    db=config.getKey("mysql_db"), 
                    user=config.getKey("mysql_user"), 
                    password=config.getKey("mysql_pass"),
                    connect_timeout=config.getKey("mysql_timeout")
                )
                self._connect_timeout=config.getKey("mysql_timeout")
                if not self._connect_timeout:
                    self._connect_timeout=600
                self._recycle_time = (self._connect_timeout - 1) * 60
                self.last_used = time.time()
                
        conn = None

        try: 
            conn = self._dbConnection.get_connection()
        except PoolError as pe:
            print("pool failed, making new")
            self._dbConnection = None
            return self.getConnection()

        # if not conn.is_connected() or time.time() - self.last_used > self._recycle_time:
        if not conn.is_connected():
            print("MySQL connection has expired, generating new")
            self._recycle_time = (self._connect_timeout - 1) * 60
            self.last_used = time.time()
            try:
                self._dbConnection.close()  ## try to close the connection
            except:
                pass
            self._dbConnection = None
            return self.getConnection()
        self.last_used = time.time()
        return conn
