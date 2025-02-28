FROM quay.io/keycloak/keycloak:19.0.1 as builder

# Enable health and metrics support:
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Additional features:
ENV KC_FEATURES="token-exchange, docker"

# Database vendor:
ENV KC_DB=postgres

WORKDIR /opt/keycloak

RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:19.0.1
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# HTTPS Certificates:
ENV KC_HTTPS_CERTIFICATE_FILE="/etc/x509/https/fullchain.pem"
ENV KC_HTTPS_CERTIFICATE_KEY_FILE="/etc/x509/https/tlssigner.key.pem"

# Running DB (postgres) instance:
ENV KC_DB=postgres
ENV KC_DB_PASSWORD=Pa55w0rd
ENV KC_DB_URL=jdbc:postgresql://postgresql:5432/keycloak
ENV KC_DB_USERNAME=keycloak
ENV KC_HOSTNAME=localhost

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start --optimized"]
