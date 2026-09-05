# Cómo se desarrolló este proyecto

El objetivo de este documento es dejar constancia del proceso de desarrollo
paso a paso, incluyendo la interacción con herramientas de IA.

1. Convertí el PDF con el enunciado de la prueba técnica a un fichero
   `tech-doc.md` en Markdown, para que la IA pudiese leerlo con facilidad.

2. Junto con la IA, definí una hoja de ruta y elegí las tecnologías más
   adecuadas para cubrir los requisitos.

3. Con el plan dividido en pasos y etapas, empecé a desarrollar. Escribí una
   primera versión de la documentación y un fichero `plan-route.md` para
   registrar el progreso, usando `tech-doc.md` como fuente de verdad.

4. Cuando surgía algún imprevisto, actualizaba `plan-route.md` con la decisión
   o el cambio realizado.

5. Cada etapa se contrastaba con `tech-doc.md` para verificar que se cumplían
   los requisitos.

6. Al terminar la hoja de ruta, pedí a un modelo frontera una evaluación
   global. El resultado se guardó en `eval-1.md` con los defectos detectados y
   las posibles mejoras.

7. Revisé la evaluación y decidí qué defectos y mejoras abordar, teniendo en
   cuenta el alcance del proyecto y el tiempo disponible.

8. Una vez pulido el producto, actualicé por última vez la documentación de
   cada directorio y del root.

9. Para cerrar, escribí este mismo fichero.

---

> **Nota:** Los ficheros `plan-route.md` y `eval-*.md` eran artefactos
> temporales del proceso de desarrollo. Se eliminaron al terminar el proyecto
> porque su contenido ya quedó reflejado en las decisiones finales y en la
> documentación de cada servicio.
