#! /bin/sh
echo 'startup.sh started'
python manage.py migrate
python manage.py runserver
