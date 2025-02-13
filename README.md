# 📌 Install Dependencies for Backend  
```sh
npm i  # or npm install
```

# 🚀 How to Run  
```sh
Develompment fase:
npm run serve

Production fase:
npm run start
```
# Set up
```sh
duplicat .env.e.example into .env and set your credentials
```

# 📡 API Endpoint  

## 🔑 Access Token OAuth  
**URL:**  
```
GET localhost:4000/user/auth/fitbit
```

<!-- ### 🔹 Request Headers  
```yaml
authorization: Basic <basic_token>  # Basic token obtained by encoding client_id:client_secret from Fitbit
``` -->
**Register Fitbit App:**  
🔗 [Fitbit App Registration](https://dev.fitbit.com/apps/new)  

<!-- ### 🔹 Request Body (application/x-www-form-urlencoded)  
```yaml
grant_type: authorization_code  
code: <code in redirect URI>  # or check full guide  
redirect_uri: <your redirect URI>  
``` -->
📖 **OAuth2 Guide:**  
🔗 [Fitbit OAuth2 Tutorial](https://dev.fitbit.com/build/reference/web-api/troubleshooting-guide/oauth2-tutorial/?clientEncodedId=23Q769&redirectUri=http://localhost&applicationType=PERSONAL)  

<!-- ### 🔹 Response
```
{
    "access_token": "access token",
    "expires_in": 28800,
    "refresh_token": "refresh",
    "scope": "sleep",
    "token_type": "Bearer",
    "user_id": "12121"
}
``` -->