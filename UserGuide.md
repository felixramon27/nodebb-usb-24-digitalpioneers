# Activación de las nuevas funcionalidades

Las nuevas funcionalidades en su mayoría se integraron en el código base, pero la interfaz relacionada con las mismas se encuentra en el plugin digitalpioneers, en la ruta `plugins/nodebb-plugin-digitalpioneers`

## Instalando el plugin

- Navegar hacia la carpeta `plugins/nodebb-plugin-digitalpioneers` y usar el comando `npm link`
- Volver al repositorio base de nodebb y usar el comando `npm link nodebb-plugin-digitalpioneers`, seguido de `./nodebb build`
- Verifica que aparece en la lista al usar el comando `./nodebb plugins`

### Activando el plugin
`./nodebb activate nodebb-plugin-digitalpioneers`

## Nuevas caracteristicas
- En los comentarios de los posts, se ven las opciones para bookmark, feature, like y dislike. El boton de bookmark se cambio de lugar, y la funcionalidad para el boton de feature era que el profesor pudiera destacar un comentario dentro de un post, pero no se logro implementar en el backend. Tambien el cambio de upvotes y downvotes para likes y dislikes, cada uno con contador separado.
- Tambien se encuentra el boton para poder marcar las preguntas hechas en el foro como respondidas, para dejar saber a los miembros de la comunidad cuales dudas han sido ya resueltas.
- En la pagina de registro, se puede marcar un checkbox para registrarse como profesor.
- En la pagina del perfil, se puede ver el rol del usuario, si es estudiante o profesor.


# Pruebas

Se utiliza Mocha (instalar con npm usando `npm install mocha`)
directorio: `/test/digitalpioneers`
comando: Al ejecutar `npm run test`, se ejecutaran tambien los test que se agregaron. Para ejecutar solamente los test nuevos, utilizar el comando `npx mocha "./test/digitalpioneers/*.js"`
