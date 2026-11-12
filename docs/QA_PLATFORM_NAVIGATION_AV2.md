# SafeLab Platform — AV2 v2.5.1: pruebas de navegación

## Alcance

Corrección limitada a los flujos de detalle y listados de organizaciones en el frontend Vue, sin modificar API, permisos, modelos de datos ni estilos globales.

## Pruebas manuales

1. Iniciar sesión como administrador de plataforma (`platformAdmin`). Abrir `/platform/overview`.
2. **Estado de las empresas**: comprobar que la tarjeta presenta un máximo de cinco organizaciones, aunque existan más en la base de datos. Al pulsar sobre una empresa, comprobar que se abre `/platform/organizations/<id>` con las pestañas **General**, **Usuarios**, **Dispositivos**, **Pagos** y **Operaciones**.
3. Pulsar **Ver todos** en dicha tarjeta: debe abrir `/platform/records/organizations`, con todas las organizaciones (en páginas si superan 8), búsqueda, filtro por estado y exportación CSV. También funciona pulsar en el espacio libre de la tarjeta.
4. Desde `/platform/organizations`, comprobar que la tabla de vista previa sigue limitada a tres empresas y que el botón azul **Detalles** abre la ficha completa de esa empresa.
5. En `/platform/records/organizations`, pulsar cualquier fila, el botón **Detalles**, `Enter` o `Espacio` cuando la fila tiene el foco. **No** debe aparecer el modal genérico; debe abrirse la ficha completa de esa organización, con las cinco pestañas.
6. En la ficha abierta desde `/platform/records/organizations`, pulsar **Empresas** (volver): debe regresar al listado completo, no a la tabla resumida.
7. En `/platform/overview`, **Actividad reciente** muestra como máximo cinco eventos; pulsar **Ver todos** o el fondo de la tarjeta debe abrir `/platform/records/activity`, con todos los registros y filtros disponibles.
8. Abrir otra colección (por ejemplo, `/platform/records/users`) y pulsar **Detalles** sobre una fila: debe seguir apareciendo el modal genérico de detalles, sin regresiones.
9. Repetir las pruebas principales con el selector **EN/ES**.
10. Verificar `npm run build` en el entorno local antes de merge y despliegue.

**Nota:** El frontend usa el mismo store y los mismos endpoints de antes. La cantidad de organizaciones y eventos depende de los datos del entorno; la prueba de límite de cinco empresas requiere seis o más organizaciones de prueba.
