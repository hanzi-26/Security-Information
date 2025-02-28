#!/bin/bash

echo "No. of certificate file: "
read i
echo "Organisation: "
read ORGANISATION
echo "Common Name: "
read CN
echo "DOMAIN: "
read DOMAIN
echo "E-Mail: "
read EMAIL

export DOMAIN
export EMAIL
#export EMAIL="test@example.com"
export ADM="Physician"
export ADMAUTH="Medical Chamber Test Country"
export TID="1-109900000000000099"

#echo "Admission Authority: "
#read ADMAUT
#export ADMAUTH=$ADMAUT

#./openssl genrsa -out private/user$i.key.pem 3072
#./openssl req -config ca.cfg -multivalue-rdn -subj "/C=DE/serialNumber=$SERIALNUMBER+GN=$VORNAME+SN=$NACHNAME+CN=$VORNAME $NACHNAME" -key private/user$i.key.pem -new -sha256 -out csr/user$i.csr.pem
#./openssl ca -utf8 -verbose -config ca.cfg -preserveDN -extensions userauth -days 700 -md sha256 -in csr/user$i.csr.pem -out certs/user$i.cert.pem


#./openssl pkcs12 -export -in certs/user$i.cert.pem -inkey private/user$i.key.pem -out private/user$i.p12

#./openssl asn1parse -inform DER -in certs/user$i.crt -dump -i


echo "#####################Generate Server (TLS) Zertifikat ######################"
openssl genrsa -out private/tls$i.key.pem 3072
openssl req -config ca.cfg -subj "/C=DE/O=$ORGANISATION/CN=$CN" -key private/tls$i.key.pem -new -sha256 -out csr/tls$i.csr.pem
openssl ca -utf8 -verbose -config ca.cfg -extensions server -days 700 -notext -md sha256 -in csr/tls$i.csr.pem -out certs/tls$i.cert.pem
openssl x509 -inform PEM -in certs/tls$i.cert.pem -outform DER -out certs/tls$i.crt
openssl asn1parse -inform DER -in certs/tls$i.crt -dump -i

