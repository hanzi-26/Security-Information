const keycloak = new Keycloak();

function init() {
    initKeycloak();
    console.log(keycloak.user);
}

// CAVE! Flow can be changed to 'implicit' or 'hybrid', but then client must enable implicit flow in admin console too
const initOptions = {
    responseMode: 'fragment',
    flow: 'standard',
    promiseType: 'native',
    pkceMethod: 'S256',
    // 'check-sso' only authenticate the client if the user is already logged-in.
    // If the user is not logged in the browser will be redirected back to the application and remain unauthenticated.
    // onLoad: 'check-sso',
    // 'login-required' authenticate the client if the user is logged-in or display the login page if not
    // onLoad: 'login-required',
    // silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    // enable/disable monitoring login state; creates a hidden iframe that is used to detect if a Single-Sign Out has occurred
    checkLoginIframe: false
};

function saveTokens(keycloak) {
    window.sessionStorage.setItem('token', keycloak.token);
    window.sessionStorage.setItem('tokenParsed', JSON.stringify(keycloak.tokenParsed));

    window.sessionStorage.setItem('refreshToken', keycloak.refreshToken);
    window.sessionStorage.setItem('refreshTokenParsed', JSON.stringify(keycloak.refreshTokenParsed));

    window.sessionStorage.setItem('idToken', keycloak.idToken);
    window.sessionStorage.setItem('idTokenParsed', JSON.stringify(keycloak.idTokenParsed));
}

function restoreTokens(keycloak) {
    keycloak.token = window.sessionStorage.getItem('token');
    keycloak.tokenParsed = JSON.parse(window.sessionStorage.getItem('tokenParsed'));

    keycloak.refreshToken = window.sessionStorage.getItem('refreshToken');
    keycloak.refreshTokenParsed = JSON.parse(window.sessionStorage.getItem('refreshTokenParsed'));

    keycloak.idToken = window.sessionStorage.getItem('idToken');
    keycloak.idTokenParsed = JSON.parse(window.sessionStorage.getItem('idTokenParsed'));

    keycloak.timeSkew = 0;
}

function deleteTokens() {
    window.sessionStorage.clear();
}

function initKeycloak() {
    keycloak.init(initOptions).then(function (authenticated) {
        output(authenticated ? 'Authenticated!' : 'Not authenticated!');
    }).catch(function () {
        output('Failed to initialize!');
    });
}

function login(scope) {
    let loginOptions = {
        scope: scope
    };
    keycloak.login(loginOptions);
    saveTokens(keycloak);
}

function logout() {
    keycloak.logout();
    deleteTokens();
}

function output(data) {
    if (typeof data === 'object') {
        data = JSON.stringify(data, null, '  ');
    }
    document.getElementById('output').innerHTML = data;
}

function loadUserProfile() {
    keycloak.loadUserProfile().then(function (profile) {
        output(profile);
    }).catch(function () {
        output('Failed to load profile!');
    });
}

function loadUserInfo() {
    keycloak.loadUserInfo().then(function (userInfo) {
        output(userInfo);
    }).catch(function () {
        output('Failed to load user info!');
    });
}

function refreshToken(minValidity) {
    keycloak.updateToken(minValidity).then(function (refreshed) {
        if (refreshed) {
            output(keycloak.tokenParsed);
            saveTokens(keycloak);
        } else {
            output('Token not refreshed, valid for ' + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
        }
    }).catch(function () {
        output('Failed to refresh token!');
    });
}

function showExpires() {
    if (!keycloak.tokenParsed) {
        output("Not authenticated!");
        return;
    }
    let expiresTime = 'Token expires:\t\t' + new Date((keycloak.tokenParsed.exp + keycloak.timeSkew) * 1000).toLocaleString() + '\n';
    expiresTime += 'Token expires in:\t' + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds\n';
    output(expiresTime);
}

function event(event) {
    let e = document.getElementById('events').innerHTML;
    document.getElementById('events').innerHTML = new Date().toLocaleString() + "\t" + event + "\n" + e;
}

keycloak.onAuthSuccess = function () {
    event('Authentification successfully!');
    saveTokens(keycloak);
    if (keycloak.authenticated) {
        let element = document.getElementById("logout");
        element.removeAttribute("hidden");
        element = document.getElementById("userInfo");
        element.removeAttribute("hidden");
        element = document.getElementById("tokenInfo");
        element.removeAttribute("hidden");
    }
};

keycloak.onAuthError = function (errorData) {
    event("Authentification error: " + JSON.stringify(errorData));
    deleteTokens();
};

keycloak.onAuthRefreshSuccess = function () {
    event('Authentification refresh successfully!');
    saveTokens(keycloak);
};

keycloak.onAuthRefreshError = function () {
    event('Authentification refresh failed!');
    deleteTokens();
};

keycloak.onAuthLogout = function () {
    event('User logged out!');
    deleteTokens();
};

keycloak.onTokenExpired = function () {
    event('Access token expired!');
    deleteTokens();
};