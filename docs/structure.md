# Project NextJS 14 - Building a Uber Eats App

## Authentication, Authorization, and Permission for the App

### Configure ENV variables in the APP

- Environment variables in the browser can be accessed by both the browser and the server.

- In this advanced NextJS course, we will **not** set cookies here.

### Setup Postman for the project

### Configure HTTP for the project

- In this project, the login and logout flow will change slightly:  
  From the `clientComponent`, we will make a request to `serverNext` -> then `serverNext` will call the `serverBE` for us -> and finally return the result back to the `clientComponent`.

- In the `serverComponent` or `nextServer`, to determine whether the user is logged in, we rely on the `cookies` sent by the client -> Every request from the client to the `nextServer` will automatically include the `cookies`.

- In the `clientComponent` or `nextClient`, to determine whether the user is logged in, we rely on `localStorage`.

- This is the case where the `serverBE` uses authorization with a `Bearer token` — which is also what we use in our backend source code for this project.

- If `serverBE` uses cookies, then it's enough to store a variable like `isLogin` as true or false in `localStorage` → Just storing a variable like `isAuth` as true or false in `localStorage` is sufficient.

- The `isClient` variable runs on the client side, so by default it's already true — no need to define a separate function for this.

- The body of the logout request will be sent as `null` → Here’s our logout strategy:

   - Logout should always be allowed to succeed.

   - Even if the `accessToken` has expired, we still allow logout. When the `accessToken` is expired, the server won’t accept it, but we still proceed with logout by removing the `accessToken` from both `localStorage` and cookies.

   - Logout is always treated as successful regardless of token expiration → So there's no need to send something like `force = true` in the request.

### Create the Login route handler

### Setup Tanstack Query and implement login logic

### Implement logout logic