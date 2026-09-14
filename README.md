# Motordil — Subastas en vivo

Resolución del ejercicio técnico de frontend con Next.js, React y TypeScript. La página de detalle trae los datos de la subasta por GraphQL y recibe las actualizaciones en tiempo real por WebSocket.

## Instalación

Versión de Node de referencia: **24.7.0**.

Cloná el repositorio y, desde la carpeta del proyecto, ejecutá:

```bash
# Desde la raíz del proyecto
yarn install
cp .env.example .env
yarn dev
```

Abrí [http://localhost:3000](http://localhost:3000). La página inicial te lleva al listado en `/subasta`; desde ahí podés entrar al detalle de cada subasta en `/subasta/[slug]`.

### Variables de entorno

El archivo `.env.example` ya incluye los endpoints de staging, de solo lectura y con datos de prueba:

- `NEXT_PUBLIC_GRAPHQL_API_URL`: API de GraphQL para consultar el listado y el detalle de las subastas.
- `NEXT_PUBLIC_SOCKETS_URL`: servidor de WebSocket plano para recibir los eventos en vivo.
- `NEXT_PUBLIC_DEMO_AUCTION_SLUG`: podés dejarla vacía. La aplicación no la usa: elegís una subasta desde el listado.

Necesitás conexión a internet para consultar la API y recibir las actualizaciones del socket.

## Decisiones de implementación

Como no tenía el slug de una subasta de prueba, consulté por GraphQL las subastas en vivo y armé un listado en `/subasta` para poder entrar al detalle de cada una en `/subasta/[slug]`. Aunque el listado no era un requisito, me sirvió como punto de entrada para recorrer y probar la implementación.

También le di un poco de cariño a la UI: trabajé el diseño responsive y sumé algunas animaciones y transiciones para acompañar la interacción.

## Qué decidí no hacer y por qué

No incorporé Apollo ni otro cliente de GraphQL: para las pocas consultas que necesitaba, usar `fetch` directamente me pareció suficiente. Sumar un cliente completo implicaba más configuración y conceptos para un beneficio acotado en este ejercicio.

Para los eventos en vivo usé la API nativa de `WebSocket`, sin una librería adicional. El servidor habla WebSocket plano, así que Socket.IO tampoco era compatible con el protocolo del enunciado.

Tampoco usé una librería de componentes. En la entrevista hablamos de que los componentes del producto eran propios, así que me pareció coherente trabajar de la misma manera. En general, mantuve las dependencias al mínimo: para este alcance, preferí código directo y fácil de seguir antes que sumar herramientas cuya integración agregara más complejidad de la que resolvía.

Dejé pendiente una estrategia de caché más elaborada. Las consultas usan `cache: "no-store"` para pedir datos actualizados a la API. Cachear los datos del vehículo podría mejorar los tiempos de carga, pero requería separar esa información del precio, las pujas y el estado de la subasta, y definir cuándo revalidarla. Con el tiempo disponible, prioricé la frescura de los datos y la simplicidad de la implementación.

## Qué haría distinto con una semana

Con una semana, agregaría pruebas unitarias sobre las funciones clave: el cálculo del próximo monto válido, la normalización de los datos y la actualización del estado ante eventos de la subasta. Buscaría cubrir especialmente los límites de cada incremento y los eventos duplicados o fuera de orden.

También sumaría pruebas end-to-end para validar la llegada de pujas, las desconexiones y reconexiones del WebSocket, la recuperación de datos actualizados y los estados de carga, error, subasta inexistente y cierre. Completaría ese trabajo con una pasada de pulido de la UI, el comportamiento responsive y las animaciones.

Por último, evaluaría una estrategia de caché para los datos que cambian poco, como la ficha del vehículo, con reglas claras de revalidación. Mantendría el precio, las pujas y el estado sincronizados con la API y el socket, y mediría si esa separación mejora los tiempos de carga antes de sumar más infraestructura o librerías.
