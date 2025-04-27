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

- Create a route hanlder for the `login` endpoint
 
 - We want the user to send the request body just like they would when sending it to our `serverBE` -> Therefore, when calling the `route hanlder`, it should behave the same way
 
 - After receiving the `accessToken` and `refreshToken` from `serverBE` returned to `nextServer`, we proceed to `decode` them
 
   - The purpose of decoding is to extract the expiration time of the `accessToken`
 
   - Once we’ve extracted the expiration time, we will then set the cookies -> Because cookies require a defined expiration time; they can’t exist indefinitely
 
 - After retrieving the expiration time of both the `accessToken` and `refreshToken`, we’ll set cookies for `client.com`
 
   - The syntax for setting cookies in Next.js is: `cookies.set(name, value, options())`
 
     - The `options` object includes `expires: timestamp`
 
   - We should set `httpOnly` to prevent the client from accessing the cookie, which helps protect against XSS attacks and malicious scripts
 
   - When the client sends a request to the server, the cookie will be automatically included in the request
 
   - Note: The `expires` value in `cookies-next` should be in milliseconds (`ms`)
 

### Setup Tanstack Query and implement login logic

-	Implement the login logic for our website.

### Analyze the pros and cons of two login management mechanisms: `server-side` and `client-side`

- Analyze the advantages and disadvantages of managing login state on the `server` vs `client`.
- Also implement logic to dynamically show/hide menu items upon successful login to align with business logic.
- Disadvantage of managing login state on the server using cookies:
  - It will turn any page that uses cookies into a `dynamic rendering` page, meaning it won’t be statically prebuilt into HTML.
  - Since cookie reading is a `dynamic function`, it causes the page to require dynamic rendering. As a result, no prebuilt HTML is available; instead, when the user requests the page, the `Next.js server` has to build the HTML on-demand, increasing server processing time.
	- In contrast, static rendering means the HTML is already prebuilt. When a user requests it, the server just needs to return that pre-rendered HTML immediately.
	- Every `request` that requires dynamically building HTML increases `server` load, which is not ideal for scalability.
	- (Dynamic rendering = server-rendering on demand.)
	- Using `cookies` is still possible, but to optimize for faster user access, `static rendering` should be preferred.
- Problem: Without using `cookies`, how can we determine on the server whether a user is logged in?
	- With our current authentication mechanism that does not use `cookies`, we have no way to know login status during `server-side rendering`.
	- Unless we build some sort of server-accessible database that Next.js can query directly (which would add complexity).
	- Otherwise, without `cookies`, login state must be checked on the `client` side.
	- Checking login on `client` side ensures that `static rendering` is preserved.
- On the client, we will use `localStorage`:
	- Any pages in the public section are affected by the layout, which also means they are influenced by `NavItems`.
	- If `NavItems` used cookie-based detection via `next/headers`, it would force `dynamic rendering`.
	- Thus, we will add `'use client'` directive and perform login check using `localStorage` only.
	- Even with `'use client'`, errors like "localStorage is not defined" might occur:
	- localStorage only exists in the browser environment, not during build-time `server-side rendering`.
	- When using `'use client'`, components run in two environments:
	- During build time (when the project is compiled).
	- During browser runtime (when users actually load the page).
	- Even when running `npm run dev`, part of the build process simulates `server rendering`, so errors may show up early.
- Hydration mismatch problem:
	- In Next.js, server and client might render different content if login status is based on `client-side` only (e.g., based on `accessToken` from `localStorage`).
	- This mismatch happens because React’s hydration expects the `server-pre-rendered` HTML and `client-rendered` HTML to be identical.
- Solutions:
	- Use useEffect to check login status after the initial render (client-only check), instead of during `server-side rendering`.
	- Disable `SSR` for the specific component.
	- Use the `suppressHydrationWarning` tag.
- Trade-off:
	- These solutions can cause a flash (small flicker) when the user reloads (F5) the page.
	- Either accept the flash for the benefit of full static rendering.
	- Or require `server-side` logic to render fully dynamic pages — which would remove the flash but at the cost of dynamic rendering.

⸻

### Use Middleware for Request Redirection
	- Implement a middleware to redirect users based on login/authentication status.

⸻

### Code the Router Handler for Logout
	- Implement the router handler that handles logout.

⸻
