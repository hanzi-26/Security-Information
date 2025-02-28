#!/bin/bash

rm index.*
rm -rf private
rm -rf newcerts
rm -rf certs
rm -rf csr
rm -rf crl
rm crlnumber
rm crlnumber.*
rm serial
rm serial.*

mkdir -p private
mkdir newcerts
mkdir certs
mkdir csr
touch index.txt
echo "01" > serial
echo "01" > crlnumber
mkdir crl

export DOMAIN=example.com
export EMAIL=test@example.com
export ADM="Physician"
export ADMAUTH="Medical Chamber Test Country"
export TID="1-109900000000000099"

echo "#####################Generate Root #################"
openssl genrsa -aes256 -out private/cakey.pem 4096
openssl req -config ca.cfg -key private/cakey.pem -new -x509 -days 3650 -sha256 -extensions v3_ca -out certs/cacert.pem

echo "####################Generate OCSPSigner ##################"
openssl genrsa -out private/ocsp.key.pem 3072
openssl req -config ca.cfg -subj "/C=DE/O=eHealth OTH-Regensburg/CN=Test OCSPSigner 1:PN" -key private/ocsp.key.pem -new -sha256 -out csr/ocsp.csr.pem
openssl ca -config ca.cfg -extensions ocsp -days 700 -notext -md sha256 -in csr/ocsp.csr.pem -out certs/ocsp.cert.pem

echo "###################Generate first CRL#################"
openssl ca -config ca.cfg -gencrl -out crl/ca.crl.pem
openssl crl -in crl/ca.crl.pem -text

echo "#####################Generate Server (TLS) Zertifikat ######################"
openssl genrsa -out private/tlssigner.key.pem 3072
openssl req -config ca.cfg -key private/tlssigner.key.pem -new -sha256 -out csr/tlssigner.csr.pem
openssl ca -config ca.cfg -extensions server -days 700 -notext -md sha256 -in csr/tlssigner.csr.pem -out certs/tlssigner.cert.pem

