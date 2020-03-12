// Auth provider OAuth 2.0 + OpenID connect//

1 Send GET req, http://localhost:3002/auth?response_type=code&client_id={}&redirect_uri={http://localhost:3000/callback}&scope=id_token access_token&state={}

where:

response_type - specify code for authorization code flow
client_id - string generated for app during creation
redirect_uri - link to callback on client
scope - needed access permitions from client
state - random string

2 If client accepts AUTH redirects to redirect_uri http://localhost:3000/callback?code={some code}&state={same state as for request} 

code - authorization code generated on Auth provider
state - the same state as in first GET

3 Send POST from websrv req, http://localhost:3002/auth {grant_type: authorization_code, code, redirect_uri, client_id, client_secret}

grant_type - authorization code means that we use auth code flow
code - received code from Auth provider
client_secret - client secret specified for app

4 res, http://localhost:3000/callback {access_token, id_token,  token_type: “Bearer”, ?expires_in, refresh token, scope: read write} id and access tokens need 
to be stored in localStorage

5 Each request to API needs to contain “Authorization: Bearer {token}” in req header
