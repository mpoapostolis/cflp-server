#!/bin/bash

arr=(m f)
i=0
while [ $i -le 200 ] 
do
    age=$((1 + RANDOM % 90))
    rand=$[$RANDOM % ${#arr[@]}]
    gender=${arr[$rand]}
    curl "127.0.0.1:4000/api/client/stores?id=$i&age=$age&gender=$gender";
    i=$(( $i + 1 ))
done
