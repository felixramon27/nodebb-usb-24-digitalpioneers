# Activación de las nuevas funcionalidades

Las nuevas funcionalidades en su mayoría se integraron en el código base, pero la interfaz relacionada con las mismas se encuentra en el plugin digitalpioneers, en la ruta `plugins/nodebb-plugin-digitalpioneers`

## Instalando el plugin

- Navegar hacia la carpeta `plugins/nodebb-plugin-digitalpioneers` y usar el comando `npm link`
- Volver al repositorio base de nodebb y usar el comando `npm link nodebb-plugin-digitalpioneers`, seguido de `./nodebb build`
- Verifica que aparece en la lista al usar el comando `./nodebb plugins`

### Activando el plugin
`./nodebb activate nodebb-plugin-digitalpioneers`

# Pruebas

Se utiliza Mocha (instalar con npm usando `npm install mocha`)
directorio:
comando: