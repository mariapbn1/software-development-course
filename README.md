# Catálogo de Teléfonos Móviles - Plataforma Web

Plataforma web full-stack para la gestión, visualización y reseña de equipos móviles. Permite explorar un catálogo
detallado de dispositivos, consultar especificaciones técnicas y gestionar comentarios de usuarios.

## 🛠️ Tecnologías Utilizadas

**Backend:**

* **Python**
* **Django & Django REST Framework (DRF)**
* **PostgreSQL**

**Frontend:**

* **HTML5 & CSS3:** Estructura y estilos base (Directorio `/CSS` y `/Front`).
* **JavaScript (Vanilla):** Lógica de cliente y consumo de la API (Directorio `/Javascript`).
* **Bootstrap:** Framework de diseño responsivo.

**Librerías Clave:**

* `django-cors-headers`: Para permitir la comunicación segura entre el frontend estático y la API.
* `django-filter`: Para dotar a la API de capacidades de filtrado dinámico por características del equipo (marca, color,
  etc.).
* `psycopg2:` Es el adaptador que permite a Python y Django comunicarse con el motor de la base de datos.

---

## 📁 Estructura del Proyecto

El repositorio está dividido en dos directorios principales para separar el cliente (Frontend) del servidor y la lógica
de negocio (Backend).

```
.
└── software-development-course/
    ├── backend/                    # Lógica del servidor, API y Base de Datos
    │   ├── api/                    # Aplicación central de la API
    │   │   ├── comments/           # Modelos de comentarios
    │   │   ├── products/           # Catálogo de celulares
    │   │   ├── users/              # Gestión de usuarios
    │   │   ├── migrations/ 
    │   │   ├── __init__.py
    │   │   ├── apps.py
    │   │   ├── ulrs.py
    │   │   └── views.py
    │   ├── config/
    │   ├── .env.example            # Plantilla de variables de entorno requeridas
    │   ├── manage.py               # Orquestador de comandos de Django
    │   ├── mockup_db_data.json     # Fixtures: Datos iniciales del catálogo para evaluación
    │   └── requirements.txt        # Dependencias de Python necesarias para el proyecto
    ├── frontend/
    │   ├── CSS/                    # Capa de Presentación visual (styles.css)
    │   │   └── styles.css
    │   ├── Front/                  # Capa de Estructura: Vistas HTML del catálogo
    │   │   ├── catalogo.html
    │   │   ├── detalle.html
    │   │   ├── index.html
    │   │   └── productos.html
    │   └── Javascript/             # Capa de Interactividad: Consumo de la API (scripts.js)
    │       └── scripts.js
    ├── .gitignore                  # Archivos excluidos del control de versiones
    └── README.md                   # Documentación principal del proyecto
```

## 🚀 Guía de Ejecución Local

Para facilitar la revisión de este proyecto, se proveen de un tutorial de instalación. El proyecto incluye un archivo de
datos (`mockup_db_data.json`) que poblará automáticamente la base de datos con un catálogo base de celulares y un
usuario administrador de prueba.

* **Usuario Administrador:** `admin`
* **Contraseña:** `admin_123`

### Ejecución Nativa

**Requisitos:**

* Python 3.10 o superior instalado.
* venv para crear un entorno virtual (opcional pero recomendado).
* Django y dependencias listadas en `requirements.txt`.

1. Configurar el entorno virtual e instalar dependencias:
   Abre una terminal en la carpeta `backend/` y ejecuta:

```bash
python -m venv .venv

# Activar entorno virtual (Windows)
.venv\Scripts\activate
# Activar entorno virtual (macOS/Linux)
source .venv/bin/activate

pip install -r requirements.txt
```

2. Configurar la base de datos PostgreSQL:
    * Asegúrate de tener PostgreSQL instalado y en ejecución.
    * Crea una base de datos llamada `mobile_catalog_db` y un usuario con permisos adecuados.
    * Actualiza las credenciales de la base de datos en `backend/mobile_catalog/settings.py` en la sección `DATABASES`.
      o bien, exporta las variables de entorno como aparecen en el archivo ubicado en `backend/.env.example`.

3. Migrar la base de datos y cargar datos de prueba:

```bash
python manage.py migrate
```

4. Cargar el catálogo inicial (Fixtures):

```bash
python manage.py loaddata mockup_db_data.json
```

5. Ejecutar el servidor backend.

```bash
python manage.py runserver
```

6. Visualizar el Frontend:
   Simplemente abre el archivo index.html (ubicado en la carpeta de Frontend/Front) directamente con cualquier navegador
   web.
