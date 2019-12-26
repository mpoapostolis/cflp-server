#!/bin/bash

i=0
while [ $i -le 10000 ] 
do
    curl "http://localhost:3000/stores?lat=20&lng=20&id=$i&limit=20";
    i=$(( $i + 1 ))
done
