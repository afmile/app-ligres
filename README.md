<div align="center" style="background:#0A0F1E;padding:24px;border-radius:16px;">
  <h1 style="color:#00FF7F;margin:0;font-size:42px;">App Ligres</h1>
  <p style="color:#9AA3B0;margin:8px 0 0;font-size:16px;">
    Organiza tus equipos, alinea por posiciones y comparte la táctica en segundos.
  </p>
  <br/>
  <img src="https://img.shields.io/badge/Estado-Activa-16A34A?style=for-the-badge&labelColor=111A2E" alt="Estado"/>
  <img src="https://img.shields.io/badge/Versi%C3%B3n-1.1.1-00FF7F?style=for-the-badge&labelColor=111A2E&color=00FF7F" alt="Versión"/>
  <img src="https://img.shields.io/badge/Stack-React%20%2B%20Vite-3A7BFF?style=for-the-badge&labelColor=111A2E" alt="Stack"/>
</div>


## ✨ ¿Qué es App Ligres?

Una herramienta rápida y amigable para planificar partidos de fútbol 6/7:

- Define alineaciones por posición con lógica de zonas en cancha.
- Gestiona banca y plantillas de jugadores reutilizables.
- Guarda historial de partidos y re-cárgalos cuando quieras.
- Controla pagos por jugador (opcional).
- Exporta y comparte una imagen lista para enviar al equipo.


## 🖼 Paleta de colores

<div>
  <span style="display:inline-block;width:16px;height:16px;background:#00FF7F;border-radius:3px;border:1px solid #0A0F1E"></span> <code>#00FF7F</code> Primario (neón)
  <br/>
  <span style="display:inline-block;width:16px;height:16px;background:#3A7BFF;border-radius:3px;border:1px solid #0A0F1E"></span> <code>#3A7BFF</code> Secundario
  <br/>
  <span style="display:inline-block;width:16px;height:16px;background:#0A0F1E;border-radius:3px;border:1px solid #111A2E"></span> <code>#0A0F1E</code> Fondo
  <br/>
  <span style="display:inline-block;width:16px;height:16px;background:#111A2E;border-radius:3px;border:1px solid #0A0F1E"></span> <code>#111A2E</code> Superficie
  <br/>
  <span style="display:inline-block;width:16px;height:16px;background:#E5E9F0;border-radius:3px;border:1px solid #111A2E"></span> <code>#E5E9F0</code> Texto principal
  <br/>
  <span style="display:inline-block;width:16px;height:16px;background:#9AA3B0;border-radius:3px;border:1px solid #111A2E"></span> <code>#9AA3B0</code> Texto secundario
  <br/>
  <span style="display:inline-block;width:16px;height:16px;background:#075E29;border-radius:3px;border:1px solid #0A0F1E"></span> <code>#075E29</code> Campo
</div>


## 🚀 Empezar

Requisitos: Node.js 18+

```bash
npm install
npm run dev
# abre http://localhost:5173
```

Build de producción y preview:

```bash
npm run build
npm run preview
```


## 🧩 Características clave

- Alineación por zonas para 6 y 7 jugadores.
- Drag & drop fluido con memoria de posiciones.
- Compartir imagen con html2canvas (descarga o Web Share).
- Historial de partidos y plantillas de jugadores.
- Seguimiento de pagos por jugador.


## 🛠️ Stack

- React + Vite
- Tailwind (CDN)
- html2canvas


## 📄 Scripts npm

- `dev` – servidor de desarrollo
- `build` – compila para producción
- `preview` – sirve el build localmente


## 📝 Notas de versión

Versión actual: `1.1.1`

- Correcciones de alineación entre edición y exportación (sin doble centrado)
- Ajustes de UI en selección de color, etiquetas y exportación
- Mejoras en posicionamiento por zonas


## 🤝 Contribuir

¿Ideas o PRs? ¡Bienvenidos! Abre un issue o envía un Pull Request.


## ⚖️ Licencia

Proyecto con fines comunitarios del equipo Ligres. Todas las contribuciones deben respetar el estilo y el propósito del proyecto.
