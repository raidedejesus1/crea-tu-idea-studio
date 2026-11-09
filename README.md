# Canasto · Agenda de retiros por canasto

App para que un vecino de Montevideo agende el retiro de su ropa eligiendo zona, día y franja. El cupo se cuenta en **canastos** (≈ un lavarropas de 6 kg).

## Pantallas
- `/` inicio: zonas y cartel de precios
- `/agendar/:zona` día (desde mañana, lunes a sábado) y franja con contador de canastos
- `/pedido` formulario (canastos 1–4, ropa de cama, datos, forma de pago)
- `/confirmacion/:id` comprobante, `.ics` y texto para WhatsApp
- `/admin` panel del recorrido (con clave), cancelar pedidos devuelve canastos

## Correrlo
```bash
bun install
bun run dev      # http://localhost:8080
bunx vitest run  # pruebas de cupo, precios y fechas
```

## Datos de ejemplo
Todo se guarda en `localStorage` (clave `canasto:orders:v1`). En la primera apertura se cargan 12 pedidos inventados (`src/lib/store.ts → makeSeed`), con la franja Prado y Aguada 11–13 del primer día hábil completa. Las zonas, franjas, topes y precios (`src/lib/data.ts`) son de ejemplo; solo la unidad por canasto y la ventana de 11 a 21 son del negocio. Para recargar el ejemplo, entrá al panel `/admin` (clave `canasto2026`) y usá el botón **Restaurar datos de ejemplo** al pie de la pantalla; también podés borrar esa clave del navegador.

## Clave del panel
Por defecto es `canasto2026`. Cambiala en `src/lib/config.ts` (`ADMIN_PASSWORD`). Es una protección simple del lado del navegador, no una seguridad real.
