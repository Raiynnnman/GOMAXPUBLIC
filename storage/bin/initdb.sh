umask 0077
# export PYTHON_PATH=$PYTHON_PATH:`pwd`

DIR=$( dirname -- "$( readlink -f -- "$0"; )"; )
cd ${DIR}/..   #get to main project dir, as all programs assume this directory is cd
source p/bin/activate || . p/bin/activate
python initdb.py
