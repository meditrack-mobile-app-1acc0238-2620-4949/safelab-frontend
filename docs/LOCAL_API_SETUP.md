# SafeLab Web — ejecución API local

1. Inicia PostgreSQL y Spring Boot (perfil `postgres`) en el puerto 8080.
2. Copia `.env.example` a `.env` y conserva `VITE_API_BASE_URL=http://localhost:8080/api/v1`.
3. Ejecuta `npm install` y `npm run dev` en este repositorio. Navega a `http://localhost:5173`.
4. Usa una cuenta ficticia *solo si importaste los datos demo en PostgreSQL*. No se admiten credenciales SQL en Vue.
5. La sesión se conserva en `sessionStorage`; al cerrar sesión, se revoca el token en el backend.
6. Para visualizar cambios hechos desde Mobile, cambia de pestaña y vuelve a Web (refresh on focus) o recarga.

Los 12 BC conservan nomenclatura y vistas anteriores; los módulos con operaciones sin contrato REST no deben suponerse persistidos. Consulta `INTEGRATION_TEST_PLAN.md`.
