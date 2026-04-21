# Pendiente: estructura arquitectonica para features con DDD

## Contexto

En la refactorizacion de `compound-interest` se aplico una estructura orientada a feature dentro de la propia pagina:

```text
src/app/pages/simulations/compound-interest/
  application/
  domain/
  infrastructure/
  presentation/
```

Despues se planteo revisar si esta organizacion encaja con la estructura habitual usada en otros proyectos del equipo, donde las capas estan centralizadas a nivel global:

```text
src/app/
  application/
  domain/
  infrastructure/
  ui/
```

## Alternativas

### 1. Organizacion por feature con capas internas

Ejemplo:

```text
src/app/features/compound-interest/
  application/
  domain/
  infrastructure/
  ui/
```

Pros:

- Alta cohesion: todo lo de una feature vive junto.
- Facilita entender, mover o eliminar una feature completa.
- Reduce el acoplamiento accidental entre modulos no relacionados.
- En frontend suele encajar bien cuando cada pantalla tiene logica propia.

Contras:

- Puede duplicar conceptos si varias features comparten reglas de dominio.
- Cuesta mas tener una vista global del dominio completo.
- Si no hay convenciones claras, cada feature puede divergir en estilo.

### 2. Organizacion global por capas

Ejemplo:

```text
src/app/
  application/
  domain/
  infrastructure/
  ui/features/
```

Pros:

- Hace muy visible la arquitectura general de la aplicacion.
- Facilita centralizar entidades, repositorios y servicios compartidos.
- Encaja bien cuando el dominio es transversal y se reutiliza mucho.

Contras:

- Navegar una feature completa exige saltar entre muchas carpetas.
- En frontend puede degradarse en organizacion por tipo tecnico.
- Es mas facil mezclar responsabilidades transversales sin limites claros.

## Evaluacion para este proyecto

Para este repositorio, la sensacion inicial es que una organizacion puramente global por capas puede ser demasiado pesada para features relativamente aisladas como `compound-interest`.

Tambien parece mejorable dejar la arquitectura dentro de `pages/`, porque `pages` representa mas la navegacion que el limite funcional del modulo.

## Recomendacion provisional

Si se decide normalizar la arquitectura, la opcion mas equilibrada parece ser un enfoque hibrido:

```text
src/app/
  features/
    compound-interest/
      application/
      domain/
      infrastructure/
      ui/
  shared/
  domain/            # solo conceptos realmente globales
  application/       # solo servicios/casos de uso transversales
  infrastructure/    # solo infraestructura compartida
```

Esto mantiene cohesion por feature, pero evita que `pages/` se convierta en contenedor de dominio.

## Decision actual

No mover ahora la estructura actual.

Se deja pendiente una decision de arquitectura mas amplia para todo el proyecto antes de seguir refactorizando otras features.

## Proximos pasos sugeridos

1. Definir si el proyecto quiere estandarizar una arquitectura por feature, por capas globales o hibrida.
2. Si se elige una convencion, documentarla con 2 o 3 ejemplos reales de ubicacion de archivos.
3. Solo despues, migrar `compound-interest` y futuras features al patron definitivo.
