# Secure Auth & RBAC API

A simple Express.js API implementing:

- JWT‑based authentication (access + refresh tokens)  
- Role‑based access control (`user`, `moderator`, `admin`)  
- Password reset flow  
- Rate limiting on auth routes  
- (Optional) Persistent storage with lowdb


## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Basmala27


2- .env    
JWT_SECRET=2c8f1a73882f8b6e09a5dcd545bc37299b2043efb66c15c9e393b7c0f6b2da4e
PORT=5000


### 2.2 List of Features Implemented
```markdown

## Features
- User registration with bcrypt password hashing  
- User login with JWT (access token + refresh token)  
- Public (`/public`) and protected (`/protected`) routes  
- Role-based routes for `moderator` and `admin`  
- User profile viewing (`GET /profile`) and updating (`PUT /profile`)  
- Admin-only role management (`PUT /users/:id/role`)  
- Password reset flow (`/reset-password` + `/reset-password/:token`)  
- Refresh token endpoint (`POST /refresh-token`)  
- Rate limiting on auth routes  
- (Optional) Persistent storage with lowdb


## Testing API Endpoints
1. **Register**  
   - `POST /register`  
   - Body:
     ```json
     { "username":"alice", "email":"alice@example.com", "password":"Pass@1234", "role":"user" }
     ```

2. **Login**  
   - `POST /login`  
   - Body:
     ```json
     { "email":"alice@example.com", "password":"Pass@1234" }
     ```
   - Response:
     ```json
     { "token":"<jwt>","refreshToken":"<refreshJwt>" }
     ```

3. **Refresh Token**  
   - `POST /refresh-token`  
   - Body:
     ```json
     { "refreshToken":"<refreshJwt>" }
     ```
   - Response:
     ```json
     { "accessToken":"<newJwt>" }
     ```

4. **Password Reset Request**  
   - `POST /reset-password`  
   - Body:
     ```json
     { "email":"alice@example.com" }
     ```
   - Response:
     ```json
     { "message":"Password reset link: /reset-password/<token>" }
     ```

5. **Password Reset Confirm**  
   - `PUT /reset-password/<token>`  
   - Body:
     ```json
     { "newPassword":"NewPass@1234" }
     ```
   - Response:
     ```json
     { "message":"Password reset successful" }
     ```

6. **Public Route**  
   - `GET /public`  
   - No auth required

7. **Protected Route**  
   - `GET /protected`  
   - Header: `Authorization: Bearer <token>`

8. **Moderator Route**  
   - `GET /moderator`  
   - Header: `Authorization: Bearer <moderatorOrAdminToken>`

9. **Admin Route**  
   - `GET /admin`  
   - Header: `Authorization: Bearer <adminToken>`

10. **Profile**  
    - `GET /profile`  
      - Header: `Authorization: Bearer <token>`  
    - `PUT /profile`  
      - Header: `Authorization: Bearer <token>`  
      - Body:
        ```json
        { "email":"newalice@example.com","password":"NewPass@1234" }
        ```

11. **Role Management (Admin only)**  
    - `PUT /users/alice@example.com/role`  
    - Header: `Authorization: Bearer <adminToken>`  
    - Body:
      ```json
      { "role":"moderator" }
      ```
