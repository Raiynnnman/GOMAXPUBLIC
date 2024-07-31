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
#tmp = config.getKey("temporary_files")
#dbname = "%s/sportsbiz.db" % (tmp)
#con = sqlite3.connect(dbname, check_same_thread=False, timeout=60)

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

    
    def initializeDB(self):
        dblock = ".dblock-%s" % config.getKey("mysql_db")    
        if not self._testdb:
            if os.path.exists(dblock):   #  TODO replace with an explicit db init function
                return
            H = open(dblock, "w")
            # Have to close it on windows or it breaks
            H.close()
        
        mydb = self.getConnection()
        version = 0
        cur = mydb.cursor(buffered=True)
        if not self._testdb:    #  if using testdb, always create tables
            try:
                cur.execute("select version from dstoolkit.version")
                for x in cur.fetchall():
                    version = int(x[0])
            except:
                pass
        print("updating db, current version=%s" % version)
        f = []
        with open('sql/schema.json') as x: rawjson = x.read()
        schema = json.loads(rawjson)
        c = 0
        if version == 0:
            print("new database, initializing")
            cur.execute(schema[0])
            cur.execute("replace into version (label, version) values (%s, %s)",("version",str(c).zfill(6)));
            c += 1
        while (c < len(schema)):
            # print("Version=%s" % c)
            x = schema[c]
            if c <= version:
                c+=1
                continue
            print("query=%s" % x)
            cur.execute(x)
            cur.execute("replace into version (label, version) values (%s, %s)",("version",str(c).zfill(6)));
            mydb.commit()
            c+=1
        print("updated db to version=%s" % version)
        mydb.commit()
        if not self._testdb:
            os.remove(dblock)
        # Close the pooled connection
        mydb.close()

    def makeDB(self):
        if 'test' in config.getKey("mysql_db") \
            and config.getKey("TESTING"):                   # only do it when we're sure we're testing
            
            self._testdb = True
            # TODO:  we'd need expanded privs for test account, so resolve this point
            #   in the meantime, onboarding doc will say create 2 databases
            # with self._engine_lock:
                # conn = self._dbConnection = mysql.connector.connect(
                        # host=config.getKey("mysql_host"), 
                        # user=config.getKey("mysql_user"), 
                        # password=config.getKey("mysql_pass")
                # )
                # cursor = conn.cursor()
                # dbs = cursor.execute('SHOW DATABASES')
                # for database in cursor:
                    # if config.getKey("mysql_db") == database[0]:
                        # return
                ##  create db if not found
                # cursor.execute("CREATE DATABASE %s" % config.getKey("mysql_db"))

            mydb = self.getConnection()
            cursor = mydb.cursor(buffered=True)
            dbs = cursor.execute('SHOW TABLES')
            
            # Collect any existing table names, and drop them
            tables = []
            for table_name in cursor:
                tables.append (table_name[0])

            for table_name in tables:
                cursor.execute('DROP TABLE %s' % table_name)
                

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

        if not conn.is_connected() or time.time() - self.last_used > self._recycle_time:
            print("MySQL connection has expired, generating new")
            try:
                self._dbConnection.close()  ## try to close the connection
            except:
                pass
            self._dbConnection = None
            return self.getConnection()
        self.last_used = time.time()
        return conn
