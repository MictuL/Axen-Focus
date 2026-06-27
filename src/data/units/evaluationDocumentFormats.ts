import type { PhysicalChecklistFormat } from "../../types";

export const evaluationDocumentFormatsByUnit: Record<string, PhysicalChecklistFormat[]> = {
  "axen-energy": [
    {
      "id": "axen-energy-f-02-evaluacion-directiva",
      "businessUnitId": "axen-energy",
      "code": "F-02",
      "title": "Evaluacion Directiva",
      "frequency": "Trimestral | Semestral",
      "evaluator": "Corporativo Axen Capital",
      "appliesTo": [
        "Director General UDN",
        "Gerente de Desarrollo de Negocios",
        "Gerente Operativo",
        "Gerente de Credito y Cobranza"
      ],
      "repInstruction": "REP: UDN: \"Unidad de negocio rentable, sostenible y en crecimiento constante.\" / Des. Negocios: \"Crecimiento comercial rentable mediante alianzas, prospeccion y conversion efectiva.\" / Operativo: \"Una operacion eficiente, segura y rentable alineada a la calidad del servicio.\" / Cred-Cobranza: \"Cartera financiera sana mediante recuperacion eficiente y control crediticio.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Crecimiento comercial y rentabilidad",
          "aspect": "El porcentaje de crecimiento de ventas y proyectos cumplio la meta del periodo.",
          "evidence": "Reporte de ventas / comparativo meta vs resultado"
        },
        {
          "indicator": "Crecimiento comercial y rentabilidad",
          "aspect": "La utilidad del periodo se mantuvo dentro del margen esperado.",
          "evidence": "Estado financiero / reporte de utilidad"
        },
        {
          "indicator": "Cumplimiento estrategico organizacional",
          "aspect": "Las metas y objetivos estrategicos del periodo tienen avance documentado.",
          "evidence": "Dashboard de KPIs / informe estrategico"
        },
        {
          "indicator": "Sostenibilidad operativa y financiera",
          "aspect": "La operacion funciono sin interrupciones mayores y el gasto se mantuvo dentro del presupuesto.",
          "evidence": "Reporte operativo / estado presupuestal"
        },
        {
          "indicator": "Conversion comercial",
          "aspect": "El porcentaje de prospectos convertidos en proyectos o clientes activos cumplio el objetivo.",
          "evidence": "Reporte de pipeline comercial / CRM"
        },
        {
          "indicator": "Cumplimiento de metas de ventas",
          "aspect": "Los objetivos comerciales mensuales y trimestrales fueron alcanzados.",
          "evidence": "Reporte de ventas mensual / comparativo"
        },
        {
          "indicator": "Generacion de oportunidades",
          "aspect": "El numero de prospectos y oportunidades generadas en el periodo cumplio la meta.",
          "evidence": "Registro de prospectos / reporte de nuevas oportunidades"
        },
        {
          "indicator": "Recuperacion de cartera",
          "aspect": "El porcentaje de recuperacion de pagos y cartera vencida cumplio el objetivo del periodo.",
          "evidence": "Reporte de cobranza / estado de cartera"
        },
        {
          "indicator": "Control de riesgo crediticio",
          "aspect": "El nivel de morosidad se mantuvo dentro del rango aceptable establecido.",
          "evidence": "Reporte de riesgo / analisis de cartera vencida"
        }
      ]
    },
    {
      "id": "axen-energy-f-03-evaluacion-comercial",
      "businessUnitId": "axen-energy",
      "code": "F-03",
      "title": "Evaluacion Comercial",
      "frequency": "Mensual",
      "evaluator": "Gerente de Desarrollo de Negocios",
      "appliesTo": [
        "Coordinador de Alianzas Comerciales",
        "Coordinador B2B",
        "Coordinador B2C",
        "Experiencia al Cliente",
        "Ejecutivo de Comunicacion"
      ],
      "repInstruction": "REP: Alianzas: \"Alianzas estrategicas activas que generen oportunidades y crecimiento de mercado.\" / B2B: \"Empresas prospectadas y convertidas en clientes a traves de soluciones energeticas rentables.\" / B2C: \"Prospectos particulares convertidos en clientes mediante soluciones energeticas rentables.\" / Exp. Cliente: \"Clientes atendidos, satisfechos y fidelizados mediante una experiencia de valor.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Alianzas activas",
          "aspect": "El numero de alianzas comerciales activas y sanas cumple el objetivo del periodo.",
          "evidence": "Registro de alianzas activas / contratos o convenios vigentes"
        },
        {
          "indicator": "Oportunidades derivadas de alianzas",
          "aspect": "Los prospectos o proyectos generados mediante alianzas cumplen la meta.",
          "evidence": "Pipeline de oportunidades generadas por alianza"
        },
        {
          "indicator": "Conversion empresarial (B2B)",
          "aspect": "El porcentaje de empresas prospectadas convertidas en clientes cumplio el objetivo.",
          "evidence": "Reporte de conversion B2B / CRM empresarial"
        },
        {
          "indicator": "Conversion de proyectos (B2C)",
          "aspect": "El porcentaje de prospectos particulares convertidos en ventas cumplio la meta.",
          "evidence": "Reporte de conversion B2C / registro de ventas"
        },
        {
          "indicator": "Satisfaccion del cliente",
          "aspect": "La calificacion de satisfaccion del cliente se mantuvo en el nivel esperado.",
          "evidence": "Encuesta de satisfaccion / NPS / CSAT"
        },
        {
          "indicator": "Tiempo de atencion y seguimiento",
          "aspect": "El tiempo promedio de respuesta y seguimiento al cliente cumplio el estandar.",
          "evidence": "Registro de tiempos de atencion / reporte de seguimiento"
        },
        {
          "indicator": "Retension y fidelizacion",
          "aspect": "El porcentaje de clientes recurrentes o con recomendacion cumplio el objetivo.",
          "evidence": "Registro de clientes recurrentes / encuesta de recomendacion"
        },
        {
          "indicator": "Cumplimiento del plan de comunicacion",
          "aspect": "Las comunicaciones institucionales del periodo se ejecutaron en tiempo y forma.",
          "evidence": "Cronograma de comunicacion vs ejecutado / publicaciones realizadas"
        }
      ]
    },
    {
      "id": "axen-energy-f-04-evaluacion-operativa-finanzas-y-juridico",
      "businessUnitId": "axen-energy",
      "code": "F-04",
      "title": "Evaluacion Operativa, Finanzas y Juridico",
      "frequency": "Mensual",
      "evaluator": "Gerente Operativo / Director General UDN",
      "appliesTo": [
        "Gerente Operativo",
        "Ejecutivo de Cuentas de Finanzas",
        "Coordinador de Mantenimiento y Correccion",
        "Ejecutivo Juridico",
        "Ejecutivo de Credito",
        "Ejecutivo de Cobranza",
        "Coordinador I+D"
      ],
      "repInstruction": "REP: Operativo: \"Una operacion eficiente, segura y rentable alineada a la calidad del servicio.\" / Finanzas: \"Cuentas administradas con control, seguimiento y estabilidad financiera.\" / Mantenimiento: \"Sistemas energeticos funcionales, seguros y operando efectivamente.\" / Juridico: \"Operaciones y proyectos respaldados con cumplimiento legal y seguridad juridica.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Cumplimiento operativo de proyectos",
          "aspect": "Los proyectos del periodo se ejecutaron en tiempo y conforme a los estandares definidos.",
          "evidence": "Reporte de avance de proyectos / checklist de entregables"
        },
        {
          "indicator": "Eficiencia operativa",
          "aspect": "El nivel de productividad y optimizacion de recursos operativos cumplio la meta.",
          "evidence": "Reporte de eficiencia / indicadores de produccion"
        },
        {
          "indicator": "Calidad y satisfaccion del servicio",
          "aspect": "La calificacion de satisfaccion del cliente respecto a la ejecucion del proyecto fue positiva.",
          "evidence": "Encuesta post-proyecto / calificacion del cliente"
        },
        {
          "indicator": "Control y conciliacion financiera",
          "aspect": "El porcentaje de cuentas conciliadas correctamente cumplio el estandar del periodo.",
          "evidence": "Reporte de conciliacion / estado de cuentas"
        },
        {
          "indicator": "Control de flujo",
          "aspect": "El nivel de liquidez y control de ingresos y egresos se mantuvo dentro del rango establecido.",
          "evidence": "Reporte de flujo de caja / saldo disponible"
        },
        {
          "indicator": "Disponibilidad operativa de sistemas",
          "aspect": "El porcentaje de sistemas energeticos funcionando correctamente cumplio el objetivo.",
          "evidence": "Bitacora de disponibilidad / reporte de operacion de sistemas"
        },
        {
          "indicator": "Tiempo de atencion correctiva",
          "aspect": "Las fallas tecnicas fueron atendidas dentro del tiempo de respuesta establecido.",
          "evidence": "Registro de tickets / bitacora de atencion correctiva"
        },
        {
          "indicator": "Cumplimiento legal y regulatorio",
          "aspect": "Los contratos, permisos y procesos del periodo estan alineados a normativas vigentes.",
          "evidence": "Contratos revisados / permisos obtenidos / acuses legales"
        },
        {
          "indicator": "Evaluacion crediticia efectiva",
          "aspect": "Las solicitudes de credito fueron evaluadas correctamente y dentro del tiempo establecido.",
          "evidence": "Reporte de solicitudes evaluadas / tiempo promedio de respuesta"
        },
        {
          "indicator": "Recuperacion de cartera",
          "aspect": "El porcentaje de recuperacion de cuentas activas y vencidas cumplio la meta de cobranza.",
          "evidence": "Reporte de cobranza / estado de cartera por cobrar"
        }
      ]
    }
  ],
  "axen-health": [
    {
      "id": "axen-health-f-02-evaluacion-directiva",
      "businessUnitId": "axen-health",
      "code": "F-02",
      "title": "Evaluacion Directiva",
      "frequency": "Trimestral | Semestral",
      "evaluator": "Corporativo Axen Capital",
      "appliesTo": [
        "Director General UDN",
        "Gerente Administrativo",
        "Gerente Operativo"
      ],
      "repInstruction": "REP: Dir. General: \"Una organizacion solvente, viable y en crecimiento constante.\" / Ger. Admin: \"Una administracion ordenada, eficiente y sostenible que soporte el crecimiento.\" / Ger. Operativo: \"Una operacion eficiente, rentable y alineada a la experiencia de valor.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Rentabilidad neta corporativa",
          "aspect": "La utilidad neta del periodo cumplio el objetivo mensual o trimestral.",
          "evidence": "Estado financiero / reporte de utilidad neta"
        },
        {
          "indicator": "Crecimiento consolidado de ingresos",
          "aspect": "El porcentaje de crecimiento de ventas y membresias cumplio la meta del periodo.",
          "evidence": "Reporte de ventas / comparativo de membresias"
        },
        {
          "indicator": "Cumplimiento estrategico organizacional",
          "aspect": "Los OKRs y metas corporativas del periodo tienen avance documentado y cumplimiento.",
          "evidence": "Dashboard de OKRs / reporte estrategico"
        },
        {
          "indicator": "Control presupuestal",
          "aspect": "La desviacion vs presupuesto autorizado se mantuvo dentro del margen permitido.",
          "evidence": "Reporte presupuestal / conciliacion de gastos"
        },
        {
          "indicator": "Salud financiera operativa",
          "aspect": "El flujo operativo disponible fue suficiente para cumplir obligaciones del periodo.",
          "evidence": "Reporte de flujo / estado de cuentas"
        },
        {
          "indicator": "Eficiencia operativa",
          "aspect": "El porcentaje de cumplimiento operativo de servicios y horarios cumplio el estandar.",
          "evidence": "Reporte de operacion diaria / bitacora de servicios"
        },
        {
          "indicator": "Rentabilidad operativa",
          "aspect": "El margen operativo por servicio o clase se mantuvo en el nivel esperado.",
          "evidence": "Reporte de margen por servicio / analisis de rentabilidad"
        },
        {
          "indicator": "Calidad de experiencia",
          "aspect": "El nivel de satisfaccion general del cliente (NPS/CSAT) cumplio la meta del periodo.",
          "evidence": "Encuesta de satisfaccion / reporte NPS"
        }
      ]
    },
    {
      "id": "axen-health-f-03-evaluacion-comercial-y-experiencia",
      "businessUnitId": "axen-health",
      "code": "F-03",
      "title": "Evaluacion Comercial y Experiencia",
      "frequency": "Mensual",
      "evaluator": "Gerente Operativo",
      "appliesTo": [
        "Experiencia al Cliente",
        "Servicio al Cliente",
        "Host",
        "Especialista Interno",
        "Especialista Externo"
      ],
      "repInstruction": "REP: Exp. Cliente: \"Clientes atendidos, convertidos en miembros activos y fidelizados.\" / Serv. Cliente: \"Clientes totalmente satisfechos con seguimiento oportuno y resolucion efectiva.\" / Host: \"Alto volumen de conversion de prospectos a clientes.\" / Especialistas: \"Sesiones ejecutadas con calidad, puntualidad y alineacion a estandares.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Conversion comercial",
          "aspect": "El porcentaje de prospectos convertidos en clientes o membresias cumplio el objetivo.",
          "evidence": "Reporte de conversion / CRM de prospectos"
        },
        {
          "indicator": "Retencion de clientes",
          "aspect": "El porcentaje de renovacion y permanencia de miembros cumplio la meta del periodo.",
          "evidence": "Reporte de retencion / comparativo de bajas"
        },
        {
          "indicator": "Satisfaccion de atencion",
          "aspect": "La calificacion de experiencia y servicio recibida fue positiva segun estandar.",
          "evidence": "Encuesta de satisfaccion / calificacion post-sesion"
        },
        {
          "indicator": "Tasa de conversion de prospectos (Host)",
          "aspect": "El porcentaje de visitantes convertidos en clientes o membresias cumplio el objetivo.",
          "evidence": "Registro de prospectos vs convertidos"
        },
        {
          "indicator": "Canalización efectiva (Host)",
          "aspect": "Los prospectos fueron correctamente dirigidos segun protocolo comercial y operativo.",
          "evidence": "Reporte de canalizacion / retroalimentacion del area comercial"
        },
        {
          "indicator": "Nivel de satisfaccion del cliente (Especialistas)",
          "aspect": "La calificacion promedio de experiencia y calidad del servicio se mantuvo en el rango esperado.",
          "evidence": "Calificacion post-sesion / encuesta de servicio"
        },
        {
          "indicator": "Cumplimiento operativo y puntualidad",
          "aspect": "Los servicios se ejecutaron conforme a agenda, tiempos y protocolos establecidos.",
          "evidence": "Registro de sesiones / bitacora de cumplimiento"
        },
        {
          "indicator": "Tiempo de respuesta y seguimiento",
          "aspect": "El tiempo promedio de atencion y seguimiento al cliente cumplio el estandar establecido.",
          "evidence": "Registro de tiempos de respuesta / bitacora de seguimiento"
        }
      ]
    },
    {
      "id": "axen-health-f-04-evaluacion-operativa-y-finanzas",
      "businessUnitId": "axen-health",
      "code": "F-04",
      "title": "Evaluacion Operativa y Finanzas",
      "frequency": "Mensual",
      "evaluator": "Gerente Operativo / Gerente Administrativo",
      "appliesTo": [
        "Ejecutivo de Cuentas de Finanzas",
        "Coordinador de Servicios de Produccion",
        "Coordinador de Produccion"
      ],
      "repInstruction": "REP: Finanzas: \"Control de ingresos, egresos e inventarios reportados en tiempo y forma.\" / Coord. Servicios Prod.: \"Infraestructura y equipos disponibles y en optimas condiciones.\" / Coord. Produccion: \"Servicios entregados con la calidad, puntualidad, costos y eficiencia prometidos.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Precision financiera",
          "aspect": "El porcentaje de exactitud en reportes y conciliaciones cumplio el estandar del periodo.",
          "evidence": "Reporte de conciliacion / auditoria de cuentas"
        },
        {
          "indicator": "Cumplimiento de cierres",
          "aspect": "Los reportes financieros fueron entregados dentro del tiempo establecido.",
          "evidence": "Correos de entrega / acuse de recibo"
        },
        {
          "indicator": "Control de flujo",
          "aspect": "El nivel de liquidez y control de egresos se mantuvo dentro del rango aceptable.",
          "evidence": "Reporte de flujo de caja / saldo disponible"
        },
        {
          "indicator": "Disponibilidad operativa",
          "aspect": "El porcentaje de funcionamiento de equipos e instalaciones cumplio el objetivo.",
          "evidence": "Checklist de disponibilidad / reporte de estado de equipos"
        },
        {
          "indicator": "Mantenimiento preventivo",
          "aspect": "Los mantenimientos programados del periodo se ejecutaron en su totalidad.",
          "evidence": "Calendario de mantenimiento vs ejecucion / ordenes de trabajo"
        },
        {
          "indicator": "Incidencias operativas",
          "aspect": "El numero de fallas o interrupciones se mantuvo dentro del limite aceptable.",
          "evidence": "Bitacora de incidencias / reporte de fallas"
        },
        {
          "indicator": "Cumplimiento de servicio",
          "aspect": "Los servicios fueron ejecutados en tiempo y forma conforme al programa.",
          "evidence": "Registro de servicios ejecutados / bitacora de cumplimiento"
        },
        {
          "indicator": "Calidad operativa",
          "aspect": "El nivel de satisfaccion del cliente por servicio cumplio el estandar de calidad.",
          "evidence": "Calificacion post-servicio / encuesta de calidad"
        }
      ]
    }
  ],
  "axen-mind-school": [
    {
      "id": "axen-mind-school-f-02-evaluacion-directiva",
      "businessUnitId": "axen-mind-school",
      "code": "F-02",
      "title": "Evaluacion Directiva",
      "frequency": "Trimestral | Semestral",
      "evaluator": "Corporativo Axen Capital",
      "appliesTo": [
        "Director General UDN",
        "Gerente de Experiencia y Comunidad",
        "Gerente Administrativo",
        "Gerencia Operativa",
        "Gerencia Academica"
      ],
      "repInstruction": "REP: Dir. General: \"Una institucion educativa sostenible, reconocida y en crecimiento constante.\" / Exp. y Comunidad: \"Una comunidad estudiantil integrada, feliz y alineada a la cultura institucional.\" / Admin: \"Una administracion ordenada, eficiente y sostenible que soporte el crecimiento institucional.\" / Operativa: \"Una operacion eficiente, segura y funcional.\" / Academica: \"Un modelo academico de excelencia que garantice el aprendizaje en servicio.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Crecimiento institucional",
          "aspect": "La matricula, retencion y posicionamiento institucional crecieron o se mantuvieron en el nivel esperado.",
          "evidence": "Reporte de matricula / comparativo de periodos"
        },
        {
          "indicator": "Rentabilidad y sostenibilidad",
          "aspect": "El cumplimiento financiero y la estabilidad operativa de la institucion cumplieron el objetivo.",
          "evidence": "Estado financiero / reporte de obligaciones cumplidas"
        },
        {
          "indicator": "Cumplimiento estrategico institucional",
          "aspect": "El porcentaje de cumplimiento de objetivos y metas estrategicas anuales cumplio la meta del periodo.",
          "evidence": "Plan estrategico con avance / dashboard de KPIs"
        },
        {
          "indicator": "Satisfaccion de comunidad educativa",
          "aspect": "El nivel de satisfaccion de padres y alumnos se mantuvo en el rango esperado.",
          "evidence": "Encuesta de satisfaccion / NPS institucional"
        },
        {
          "indicator": "Control presupuestal",
          "aspect": "La desviacion presupuestal institucional se mantuvo dentro del margen permitido.",
          "evidence": "Reporte presupuestal / conciliacion de gastos"
        },
        {
          "indicator": "Continuidad operativa",
          "aspect": "El porcentaje de disponibilidad de instalaciones y servicios cumplio el estandar.",
          "evidence": "Bitacora de operacion / reporte de disponibilidad"
        },
        {
          "indicator": "Desempeno academico estudiantil y docente",
          "aspect": "El promedio general y cumplimiento de objetivos academicos se mantuvieron en el nivel esperado.",
          "evidence": "Reporte de calificaciones / cumplimiento del programa"
        },
        {
          "indicator": "Cumplimiento metodologico",
          "aspect": "El porcentaje de cumplimiento de programas, planeaciones y estandares academicos cumplio la meta.",
          "evidence": "Planeaciones entregadas / bitacora de revision academica"
        }
      ]
    },
    {
      "id": "axen-mind-school-f-03-evaluacion-academica-docentes-y-minders",
      "businessUnitId": "axen-mind-school",
      "code": "F-03",
      "title": "Evaluacion Academica — Docentes y Minders",
      "frequency": "Mensual",
      "evaluator": "Gerencia Academica / Director General UDN",
      "appliesTo": [
        "Docentes",
        "Minders"
      ],
      "repInstruction": "REP: Docentes: \"Estudiantes formados con aprendizaje al servicio, competencias y desarrollo integral.\" / Minders: \"Estudiantes acompanados en su desarrollo integral y formativo.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Desempeno academico del grupo",
          "aspect": "El promedio del grupo se mantuvo en el estandar institucional del periodo.",
          "evidence": "Reporte de calificaciones / promedio del grupo"
        },
        {
          "indicator": "Desempeno academico del grupo",
          "aspect": "Los alumnos con bajo rendimiento tienen plan de atencion documentado.",
          "evidence": "Plan de nivelacion / bitacora de seguimiento"
        },
        {
          "indicator": "Cumplimiento academico",
          "aspect": "Las planeaciones fueron entregadas en tiempo y ejecutadas conforme al programa.",
          "evidence": "Planeaciones firmadas / bitacora de clase"
        },
        {
          "indicator": "Cumplimiento academico",
          "aspect": "Los contenidos del programa vigente fueron cubiertos en el periodo.",
          "evidence": "Avance programatico / lista de temas impartidos"
        },
        {
          "indicator": "Experiencia educativa",
          "aspect": "Los estudiantes mostraron participacion activa en las sesiones.",
          "evidence": "Reporte del docente / observacion de clase"
        },
        {
          "indicator": "Seguimiento y retencion (Minders)",
          "aspect": "El porcentaje de permanencia de alumnos en talleres cumplio el objetivo.",
          "evidence": "Registro de asistencia / reporte de retencion"
        },
        {
          "indicator": "Desarrollo de habilidades y habitos (Minders)",
          "aspect": "Se documentan avances en habitos, habilidades y desempeno integral de los Mindix.",
          "evidence": "Ficha de seguimiento individual / reporte formativo"
        },
        {
          "indicator": "Impacto metodologico (Minders)",
          "aspect": "Los talleres muestran efectividad documentada en el desarrollo de los alumnos.",
          "evidence": "Evaluacion de talleres / retroalimentacion de padres"
        }
      ]
    },
    {
      "id": "axen-mind-school-f-04-evaluacion-bienestar-control-escolar-y-operativo",
      "businessUnitId": "axen-mind-school",
      "code": "F-04",
      "title": "Evaluacion Bienestar, Control Escolar y Operativo",
      "frequency": "Mensual | Mensual",
      "evaluator": "Gerente correspondiente / Director General UDN",
      "appliesTo": [
        "Psicopedagogo",
        "Enfermera",
        "Host",
        "Coordinador Estudiantil",
        "Ejecutivo de Cuentas de Finanzas",
        "Coordinador de Control Escolar",
        "Coordinador Servicios Generales",
        "Soporte Tecnico TI",
        "Guardian Escolar"
      ],
      "repInstruction": "REP: Segun puesto: Psicopedagogo: \"Comunidad educativa libre de violencia y educada para la paz.\" / Enfermera: \"Estudiantes atendidos con seguridad, prevencion y bienestar fisico.\" / Host: \"Prospectos y visitantes atendidos optim., alineados a protocolos.\" / Coord. Estudiantil: \"Estudiantes integrados, participativos y alineados a la cultura institucional.\" / Finanzas: \"Libros, cuentas y reportes en tiempo y forma.\" / Control Escolar: \"Informacion academica organizada, actualizada y controlada.\" / Servicios: \"Instalaciones funcionales, limpias y seguras.\" / TI: \"Infraestructura tecnologica funcional y disponible.\" / Guardian: \"Comunidad resguardada en entorno seguro y controlado.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Seguimiento psicopedagogico efectivo",
          "aspect": "Los alumnos con casos activos tienen expediente y plan de seguimiento documentado.",
          "evidence": "Expediente psicopedagogico / registro de casos activos"
        },
        {
          "indicator": "Tiempo de atencion medica",
          "aspect": "La atencion ante incidencias medicas se brindo dentro del tiempo de respuesta establecido.",
          "evidence": "Bitacora de incidencias con hora de atencion"
        },
        {
          "indicator": "Satisfaccion de atencion inicial (Host)",
          "aspect": "Los visitantes y prospectos atendidos reportan experiencia positiva en recepcion.",
          "evidence": "Encuesta de atencion / retroalimentacion del visitante"
        },
        {
          "indicator": "Participacion estudiantil",
          "aspect": "Los alumnos participaron activamente en actividades y programas del periodo.",
          "evidence": "Lista de asistencia a actividades / reporte de participacion"
        },
        {
          "indicator": "Recuperacion y cobranza",
          "aspect": "El porcentaje de colegiaturas y pagos recuperados en tiempo cumplio el objetivo.",
          "evidence": "Reporte de cobranza / estado de cuentas por cobrar"
        },
        {
          "indicator": "Cumplimiento administrativo y actualizacion documental",
          "aspect": "Los expedientes y registros escolares estan actualizados y completos.",
          "evidence": "Revision de expedientes / reporte de documentos faltantes"
        },
        {
          "indicator": "Condiciones de instalaciones",
          "aspect": "Las instalaciones se mantuvieron limpias, ordenadas y funcionales durante el periodo.",
          "evidence": "Lista de verificacion de limpieza / inspeccion de espacios"
        },
        {
          "indicator": "Disponibilidad tecnologica",
          "aspect": "Los sistemas, plataformas y redes funcionaron sin interrupciones mayores.",
          "evidence": "Reporte de disponibilidad de sistemas / bitacora TI"
        },
        {
          "indicator": "Control y seguridad institucional",
          "aspect": "No se registraron incidencias de riesgo graves sin atencion oportuna.",
          "evidence": "Bitacora de seguridad / reporte de incidencias"
        }
      ]
    }
  ],
  "axen-work": [
    {
      "id": "axen-work-f-02-evaluacion-directiva",
      "businessUnitId": "axen-work",
      "code": "F-02",
      "title": "Evaluacion Directiva",
      "frequency": "Trimestral | Semestral",
      "evaluator": "Corporativo Axen Capital",
      "appliesTo": [
        "Director General UDN",
        "Gerente Operativo",
        "Gerente Administrativo"
      ],
      "repInstruction": "REP: Dir. General: \"Una UDN rentable, sostenible y reconocida por la excelencia de sus proyectos.\" / Ger. Operativo: \"Proyectos desarrollados con calidad, rentabilidad y cumplimiento de tiempos.\" / Ger. Admin: \"Recursos financieros, humanos y administrativos controlados eficientemente.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Rentabilidad y sostenibilidad de la UDN",
          "aspect": "El crecimiento rentable y la estabilidad financiera de la unidad cumplieron el objetivo del periodo.",
          "evidence": "Estado financiero / reporte de rentabilidad por proyecto"
        },
        {
          "indicator": "Posicionamiento y crecimiento comercial",
          "aspect": "La expansion comercial y generacion de proyectos cumplio la meta del periodo.",
          "evidence": "Reporte de proyectos nuevos / presencia de mercado documentada"
        },
        {
          "indicator": "Cumplimiento estrategico organizacional",
          "aspect": "Las metas, objetivos y planes estrategicos del periodo tienen avance documentado.",
          "evidence": "Plan estrategico con avance / dashboard de KPIs"
        },
        {
          "indicator": "Cumplimiento de Proyectos",
          "aspect": "Los programas de trabajo establecidos fueron cumplidos en tiempo y forma.",
          "evidence": "Reporte de avance de obra / checklist de hitos"
        },
        {
          "indicator": "Control de Costos Operativos",
          "aspect": "El uso de recursos y presupuestos se mantuvo dentro del margen autorizado.",
          "evidence": "Reporte de costos vs presupuesto / analisis de desviacion"
        },
        {
          "indicator": "Control Presupuestal",
          "aspect": "El uso eficiente de recursos economicos autorizados cumplio el estandar.",
          "evidence": "Reporte presupuestal / conciliacion de gastos"
        },
        {
          "indicator": "Recuperacion de Cartera",
          "aspect": "La efectividad en la cobranza de cuentas pendientes cumplio el objetivo del periodo.",
          "evidence": "Reporte de cobranza / estado de cartera"
        },
        {
          "indicator": "Cumplimiento Administrativo",
          "aspect": "Las obligaciones fiscales, laborales y administrativas del periodo fueron cumplidas en tiempo.",
          "evidence": "Declaraciones fiscales / registros laborales / acuses"
        }
      ]
    },
    {
      "id": "axen-work-f-03-evaluacion-operativa-proyectos-y-construccion",
      "businessUnitId": "axen-work",
      "code": "F-03",
      "title": "Evaluacion Operativa — Proyectos y Construccion",
      "frequency": "Mensual",
      "evaluator": "Gerente Operativo",
      "appliesTo": [
        "Coordinador de Obras",
        "Residente de Obra",
        "Coordinador Inmobiliario",
        "Disenador de Proyectos",
        "Especialista de Compras",
        "Gestor de Propiedades"
      ],
      "repInstruction": "REP: Coord. Obras: \"Obras ejecutadas conforme al alcance, programa, presupuesto y estandares de calidad.\" / Residente: \"Actividades constructivas ejecutadas correctamente conforme al programa diario.\" / Coord. Inmobiliario: \"Operaciones inmobiliarias concretadas de manera rentable y satisfactoria.\" / Disenador: \"Proyectos arquitectonicos conforme a requerimientos tecnicos, normativos y comerciales.\" / Compras: \"Materiales, equipos y servicios adquiridos optima y oportunamente.\" / Gestor Prop.: \"Inmuebles administrados eficientemente, conservando valor y rentabilidad.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Avance de Obra",
          "aspect": "El cumplimiento de los avances programados de construccion cumplio el porcentaje esperado.",
          "evidence": "Reporte de avance vs programa / fotografia de obra"
        },
        {
          "indicator": "Control Presupuestal de Obra",
          "aspect": "El uso de recursos economicos asignados a la obra se mantuvo dentro del presupuesto.",
          "evidence": "Reporte de costos de obra / comparativo presupuestal"
        },
        {
          "indicator": "Calidad Constructiva",
          "aspect": "La obra cumplio las especificaciones tecnicas requeridas en el periodo.",
          "evidence": "Actas de supervision / informe de calidad / bitacora tecnica"
        },
        {
          "indicator": "Cumplimiento de Programa Diario",
          "aspect": "El avance diario de obra fue conforme a lo programado.",
          "evidence": "Reporte diario de obra / registro de actividades"
        },
        {
          "indicator": "Operaciones Concretadas",
          "aspect": "El numero de operaciones inmobiliarias cerradas exitosamente cumplio la meta.",
          "evidence": "Contratos firmados / registro de cierres inmobiliarios"
        },
        {
          "indicator": "Cumplimiento de Entregables",
          "aspect": "Los proyectos y documentacion tecnica fueron entregados en tiempo y forma.",
          "evidence": "Entregables revisados / acuse de entrega por cliente"
        },
        {
          "indicator": "Oportunidad de Abastecimiento",
          "aspect": "Los materiales requeridos por la obra se entregaron puntualmente.",
          "evidence": "Orden de compra vs fecha de entrega / bitacora de insumos"
        },
        {
          "indicator": "Ocupacion de Inmuebles",
          "aspect": "El nivel de aprovechamiento de los espacios administrados cumplio el objetivo.",
          "evidence": "Reporte de ocupacion / contratos de arrendamiento activos"
        },
        {
          "indicator": "Cobranza de Rentas",
          "aspect": "La recuperacion oportuna de ingresos por arrendamiento cumplio la meta del periodo.",
          "evidence": "Reporte de cobranza de rentas / estado de cuentas"
        }
      ]
    },
    {
      "id": "axen-work-f-04-evaluacion-comercial-y-experiencia-al-cliente",
      "businessUnitId": "axen-work",
      "code": "F-04",
      "title": "Evaluacion Comercial y Experiencia al Cliente",
      "frequency": "Mensual",
      "evaluator": "Gerente Administrativo / Director General UDN",
      "appliesTo": [
        "Ejecutivo de Cuentas de Finanzas",
        "Experiencia al Cliente"
      ],
      "repInstruction": "REP: Finanzas: \"Recursos financieros administrados con control, liquidez y cumplimiento para la continuidad operativa.\" / Exp. Cliente: \"Clientes atendidos de manera oportuna y satisfactoria durante todo su ciclo de relacion.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Control financiero y liquidez",
          "aspect": "La estabilidad financiera y disponibilidad de recursos operativos cumplio el estandar del periodo.",
          "evidence": "Reporte de liquidez / saldo disponible"
        },
        {
          "indicator": "Cumplimiento administrativo y contable",
          "aspect": "Los registros, conciliaciones y pagos del periodo fueron ejecutados correctamente.",
          "evidence": "Reporte de conciliacion / comprobantes de pago"
        },
        {
          "indicator": "Control de conciliacion financiera",
          "aspect": "El porcentaje de cuentas conciliadas y administradas correctamente cumplio el objetivo.",
          "evidence": "Reporte de conciliacion / estado de cuentas actualizado"
        },
        {
          "indicator": "Satisfaccion del Cliente",
          "aspect": "La percepcion del cliente respecto al servicio recibido se mantuvo en el nivel esperado.",
          "evidence": "Encuesta de satisfaccion / calificacion de servicio"
        },
        {
          "indicator": "Tiempo de Respuesta",
          "aspect": "La rapidez de atencion a solicitudes y requerimientos cumplio el estandar establecido.",
          "evidence": "Registro de tiempos de respuesta / bitacora de solicitudes"
        },
        {
          "indicator": "Resolucion de Casos",
          "aspect": "La efectividad para solucionar necesidades del cliente cumplio el objetivo del periodo.",
          "evidence": "Registro de casos cerrados / retroalimentacion del cliente"
        }
      ]
    }
  ],
  "axen-up": [
    {
      "id": "axen-up-f-02-evaluacion-directiva-y-gerencial",
      "businessUnitId": "axen-up",
      "code": "F-02",
      "title": "Evaluacion Directiva y Gerencial",
      "frequency": "Trimestral | Semestral",
      "evaluator": "Corporativo Axen Capital",
      "appliesTo": [
        "Director General de Area",
        "Lider de Investigacion y Desarrollo",
        "Gerente de Operaciones"
      ],
      "repInstruction": "REP: Dir. General: \"Direccion estrategica con crecimiento y alto volumen de rendimientos.\" / Lider I+D: \"Herramientas algoritmicas y estrategias automatizadas para facilitar la produccion.\" / Ger. Operaciones: \"Eficiencia operativa y cumplimiento de produccion.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "ROI Global",
          "aspect": "El nivel de rentabilidad generada por el capital administrado cumplio la meta del periodo.",
          "evidence": "Reporte de ROI global / estado de rendimientos"
        },
        {
          "indicator": "Drawdown Consolidado",
          "aspect": "El drawdown se mantuvo dentro del limite maximo establecido durante el periodo.",
          "evidence": "Reporte de drawdown / bitacora de riesgo consolidado"
        },
        {
          "indicator": "Cumplimiento de Meta Financiera",
          "aspect": "El grado de cumplimiento de los objetivos financieros del periodo fue alcanzado.",
          "evidence": "Reporte de desempeno financiero / comparativo meta vs resultado"
        },
        {
          "indicator": "Disponibilidad Operativa de las Estrategias",
          "aspect": "Las estrategias algoritmicas implementadas funcionaron de manera continua y disponible.",
          "evidence": "Reporte de uptime / bitacora de disponibilidad tecnologica"
        },
        {
          "indicator": "Automatizaciones Implementadas",
          "aspect": "El numero de procesos, herramientas o tareas automatizadas cumplio el objetivo del periodo.",
          "evidence": "Registro de automatizaciones implementadas / documentacion tecnica"
        },
        {
          "indicator": "Meta de Produccion",
          "aspect": "El nivel de cumplimiento de resultados de produccion del periodo fue alcanzado.",
          "evidence": "Reporte de produccion / comparativo de resultados"
        },
        {
          "indicator": "Eficiencia de Ejecucion",
          "aspect": "Los procesos y estrategias se ejecutaron optimizando los recursos disponibles.",
          "evidence": "Reporte de eficiencia operativa / analisis de recursos utilizados"
        },
        {
          "indicator": "Tiempo de Solucion a Incidencias",
          "aspect": "Las fallas o eventos que afectaron la operacion fueron resueltos dentro del tiempo esperado.",
          "evidence": "Registro de incidencias con tiempo de resolucion"
        }
      ]
    },
    {
      "id": "axen-up-f-03-evaluacion-de-produccion-coordinadores-y-especialistas",
      "businessUnitId": "axen-up",
      "code": "F-03",
      "title": "Evaluacion de Produccion — Coordinadores y Especialistas",
      "frequency": "Mensual",
      "evaluator": "Gerente de Operaciones / Lider I+D",
      "appliesTo": [
        "Coordinador de Plataformas",
        "Coordinador de Produccion",
        "Coordinador de Estadistica",
        "Especialista de Produccion Algoritmica",
        "Especialista SET UP Algoritmico",
        "Especialista de Produccion Manual",
        "Trader",
        "Desarrollador"
      ],
      "repInstruction": "REP: Coord. Plataformas: \"Disponibilidad y estabilidad tecnologica.\" / Coord. Produccion: \"Aumento constante de capital.\" / Coord. Estadistica: \"Graficas con claridad de datos para la toma de decisiones.\" / Esp. Prod. Algoritmica: \"Cumplimiento de Meta de produccion.\" / SET UP: \"Algoritmos instalados en tiempo y forma.\" / Esp. Manual: \"Cumplimiento de Meta de produccion manual.\" / Trader: \"Cumplimiento de Meta de produccion.\" / Desarrollador: \"Algoritmos y herramientas desarrolladas y funcionando.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Disponibilidad de Plataforma",
          "aspect": "El nivel de acceso y funcionamiento continuo de las plataformas operativas cumplio el objetivo.",
          "evidence": "Reporte de disponibilidad / bitacora de plataformas"
        },
        {
          "indicator": "Exactitud de Datos",
          "aspect": "El nivel de precision y confiabilidad de la informacion operativa cumplio el estandar.",
          "evidence": "Auditoria de datos / reporte de precision"
        },
        {
          "indicator": "Rentabilidad de Produccion",
          "aspect": "El beneficio economico generado por las estrategias ejecutadas cumplio la meta.",
          "evidence": "Reporte de produccion / estado de rentabilidad"
        },
        {
          "indicator": "Cumplimiento de Protocolos",
          "aspect": "El nivel de apego a procedimientos, politicas y lineamientos operativos fue el esperado.",
          "evidence": "Registro de cumplimiento de protocolos / auditoria operativa"
        },
        {
          "indicator": "Control de Riesgo",
          "aspect": "La operacion se mantuvo dentro de los parametros de riesgo definidos durante el periodo.",
          "evidence": "Reporte de riesgo / registro de limites respetados"
        },
        {
          "indicator": "ROI Algoritmico",
          "aspect": "La rentabilidad generada por las estrategias automatizadas cumplio el objetivo.",
          "evidence": "Reporte de ROI algoritmico / estado de bots"
        },
        {
          "indicator": "Ejecucion Correcta de Bots",
          "aspect": "El nivel de funcionamiento adecuado de los algoritmos durante la operacion fue el esperado.",
          "evidence": "Bitacora de ejecucion de bots / reporte de errores"
        },
        {
          "indicator": "Profit",
          "aspect": "La ganancia neta generada por las operaciones del periodo cumplio la meta establecida.",
          "evidence": "Estado de cuenta de operaciones / reporte de profit"
        },
        {
          "indicator": "Precision de Reportes",
          "aspect": "El nivel de exactitud y confiabilidad de la informacion en reportes e indicadores fue el esperado.",
          "evidence": "Reportes verificados / auditoria de indicadores"
        },
        {
          "indicator": "Algoritmos desarrollados",
          "aspect": "La cantidad de algoritmos productivos puestos en marcha cumplio el objetivo del periodo.",
          "evidence": "Registro de algoritmos en produccion / documentacion tecnica"
        }
      ]
    }
  ],
  "halcones-futbol-club": [
    {
      "id": "halcones-futbol-club-f-02-evaluacion-directiva",
      "businessUnitId": "halcones-futbol-club",
      "code": "F-02",
      "title": "Evaluacion Directiva",
      "frequency": "Trimestral | Semestral",
      "evaluator": "Corporativo Axen Capital",
      "appliesTo": [
        "Director General UDN",
        "Director Deportivo",
        "Gerente Deportivo e Inteligencia",
        "Director Tecnico Premier",
        "Director Tecnico TDP Varonil",
        "Director Tecnico TDP Femenil",
        "Coordinador Administrativo"
      ],
      "repInstruction": "REP: Dir. General: \"Club consolidado, competitivo y sostenible.\" / Dir. Deportivo: \"Modelo deportivo con alto % de partidos ganados.\" / Ger. Dep.: \"Operaciones deportivas organizadas y alineadas al rendimiento.\" / DT Premier: \"Equipo competitivo de alto rendimiento con vision de ascenso.\" / DT TDP: \"Equipo formativo y competitivo alineado a la metodologia institucional.\" / Coord. Admin: \"Procesos administrativos ordenados, eficientes y alineados.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Cumplimiento integral del club",
          "aspect": "El porcentaje de cumplimiento de metas deportivas, administrativas y comerciales cumplio el objetivo.",
          "evidence": "Informe de gestion / dashboard de KPIs del club"
        },
        {
          "indicator": "Sostenibilidad operativa y financiera",
          "aspect": "El apego presupuestal y la eficiencia operativa del club cumplieron la meta.",
          "evidence": "Estado financiero / reporte de apego presupuestal"
        },
        {
          "indicator": "Crecimiento institucional",
          "aspect": "El nivel de profesionalizacion y estabilidad operativa del club muestra avance documentado.",
          "evidence": "Indicadores de profesionalizacion / informe institucional"
        },
        {
          "indicator": "Rendimiento deportivo institucional",
          "aspect": "Los objetivos deportivos y competitivos del periodo fueron alcanzados.",
          "evidence": "Tabla de posiciones / resultados de competencia"
        },
        {
          "indicator": "Desarrollo de talento deportivo",
          "aspect": "El porcentaje de jugadores desarrollados y promovidos cumplio el objetivo del periodo.",
          "evidence": "Registro de promovidos / informe del cuerpo tecnico"
        },
        {
          "indicator": "Alineacion metodologica deportiva",
          "aspect": "Los cuerpos tecnicos aplican la metodologia y filosofia deportiva institucional.",
          "evidence": "Plan tecnico / reporte de cumplimiento metodologico"
        },
        {
          "indicator": "Rendimiento competitivo del equipo",
          "aspect": "Los resultados del equipo en el periodo cumplen con el objetivo de puntos o posicion.",
          "evidence": "Tabla de posiciones / acta de partido"
        },
        {
          "indicator": "Cumplimiento metodologico",
          "aspect": "Los entrenamientos se planificaron y ejecutaron conforme a la metodologia institucional.",
          "evidence": "Plan semanal de entrenamiento / reporte tecnico"
        }
      ]
    },
    {
      "id": "halcones-futbol-club-f-03-evaluacion-cuerpo-tecnico-y-bienestar",
      "businessUnitId": "halcones-futbol-club",
      "code": "F-03",
      "title": "Evaluacion Cuerpo Tecnico y Bienestar",
      "frequency": "Mensual | Post-competencia",
      "evaluator": "Director Deportivo / Gerente Deportivo e Inteligencia",
      "appliesTo": [
        "Cuerpos Tecnicos",
        "Auxiliar Tecnico",
        "Entrenador de Porteros",
        "Doctor Deportivo",
        "Fisioterapeuta",
        "Preparador Fisico"
      ],
      "repInstruction": "REP: Cuerpo Tecnico: ver DT correspondiente. / Auxiliar: \"Apoyo eficiente y alineado a la metodologia del DT.\" / Ent. Porteros: \"Porteros desarrollados tecnica, fisica y tacticamente.\" / Doctor: \"Jugadores en optimas condiciones para el rendimiento.\" / Fisioterapeuta: \"Jugadores rehabilitados y recuperados eficientemente.\" / Prep. Fisico: \"Jugadores preparados fisicamente con alto rendimiento.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Categoria / Equipo",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Apoyo operativo en entrenamientos y partidos",
          "aspect": "El cuerpo tecnico de apoyo estuvo presente y listo para cada sesion y partido.",
          "evidence": "Lista de asistencia del cuerpo tecnico"
        },
        {
          "indicator": "Seguimiento tactico y metodologico",
          "aspect": "Las instrucciones del Director Tecnico se aplicaron con fidelidad.",
          "evidence": "Observacion en sesion / retroalimentacion del DT"
        },
        {
          "indicator": "Desarrollo tecnico de porteros",
          "aspect": "Se observa evolucion tecnica y tactica documentada en los porteros del periodo.",
          "evidence": "Ficha de evaluacion tecnica / video comparativo"
        },
        {
          "indicator": "Control de enfermedades y lesiones",
          "aspect": "Todas las lesiones y enfermedades del periodo estan registradas y con seguimiento oportuno.",
          "evidence": "Registro de incidencias medicas / expediente del jugador"
        },
        {
          "indicator": "Disponibilidad competitiva de jugadores",
          "aspect": "El porcentaje de jugadores disponibles para competencia cumplio el objetivo.",
          "evidence": "Reporte de disponibilidad del plantel"
        },
        {
          "indicator": "Recuperacion fisica efectiva",
          "aspect": "Los jugadores con lesion completaron su rehabilitacion y fueron reincorporados.",
          "evidence": "Registro de altas fisioterapeuticas / protocolo firmado"
        },
        {
          "indicator": "Condicion fisica competitiva",
          "aspect": "Los jugadores mantienen o mejoran su rendimiento fisico segun pruebas del periodo.",
          "evidence": "Resultados de pruebas fisicas / reporte del preparador"
        },
        {
          "indicator": "Cumplimiento de planificacion fisica",
          "aspect": "Los programas fisicos se ejecutaron segun el calendario planificado.",
          "evidence": "Plan fisico vs bitacora de ejecucion"
        }
      ]
    },
    {
      "id": "halcones-futbol-club-f-04-evaluacion-de-jugadores",
      "businessUnitId": "halcones-futbol-club",
      "code": "F-04",
      "title": "Evaluacion de Jugadores",
      "frequency": "Mensual | Al cierre de jornada o torneo",
      "evaluator": "Director Tecnico de la categoria",
      "appliesTo": [
        "Jugadores de todas las categorias"
      ],
      "repInstruction": "REP: \"Desempeno competitivo, alineacion con la vision y los valores del Club.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Categoria",
        "Posicion",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Rendimiento deportivo individual",
          "aspect": "El jugador participa activamente en entrenamientos con esfuerzo y disposicion.",
          "evidence": "Lista de asistencia / reporte del cuerpo tecnico"
        },
        {
          "indicator": "Rendimiento deportivo individual",
          "aspect": "El jugador aporta al equipo en los partidos del periodo.",
          "evidence": "Acta de partido / reporte del DT"
        },
        {
          "indicator": "Disciplina y compromiso institucional",
          "aspect": "El jugador cumple puntualmente con horarios de entrenamiento y partido.",
          "evidence": "Lista de asistencia con horario de entrada"
        },
        {
          "indicator": "Disciplina y compromiso institucional",
          "aspect": "El jugador no acumula sanciones disciplinarias en el periodo.",
          "evidence": "Reporte disciplinario / registro de tarjetas"
        },
        {
          "indicator": "Desarrollo integral del jugador",
          "aspect": "Se observa evolucion tecnica documentada en el periodo.",
          "evidence": "Ficha de evaluacion tecnica / video comparativo"
        },
        {
          "indicator": "Desarrollo integral del jugador",
          "aspect": "El jugador muestra mejora en su condicion fisica evaluada.",
          "evidence": "Reporte del preparador fisico / pruebas fisicas"
        },
        {
          "indicator": "Desarrollo integral del jugador",
          "aspect": "El jugador muestra progreso formativo: actitud, valores, trabajo en equipo.",
          "evidence": "Observacion del cuerpo tecnico / evaluacion formativa"
        }
      ]
    },
    {
      "id": "halcones-futbol-club-f-05-evaluacion-operativa-administrativa-y-federativa",
      "businessUnitId": "halcones-futbol-club",
      "code": "F-05",
      "title": "Evaluacion Operativa, Administrativa y Federativa",
      "frequency": "Mensual | Post-evento",
      "evaluator": "Director Operativo / Coordinador Administrativo",
      "appliesTo": [
        "Coordinador Administrativo",
        "Ejecutivo de Cuentas de Finanzas",
        "Especialista Enlace FMF",
        "Secretarios Tecnicos",
        "Coordinador de Gestion e Infraestructura",
        "Utileros",
        "Chofer",
        "Campero",
        "Experiencia al Cliente",
        "Ejecutivo de Cuenta MKT",
        "Enlace Comercial",
        "Psicopedagogo",
        "Nutriologo"
      ],
      "repInstruction": "REP: Segun puesto: ver Guia Operativa V.001 para el REP especifico de cada puesto operativo.",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Control administrativo institucional",
          "aspect": "Los procesos administrativos del club se ejecutaron ordenadamente sin errores.",
          "evidence": "Reporte de procesos / checklist administrativo"
        },
        {
          "indicator": "Control financiero y presupuestal",
          "aspect": "Los movimientos financieros del periodo estan correctamente registrados.",
          "evidence": "Reporte de conciliacion / estado de cuenta"
        },
        {
          "indicator": "Cumplimiento federativo",
          "aspect": "Los tramites y registros ante FMF se entregaron correctamente y en fecha.",
          "evidence": "Acuses FMF / comprobantes de entrega"
        },
        {
          "indicator": "Disponibilidad de utileria deportiva",
          "aspect": "Todo el material deportivo estuvo disponible y listo para cada sesion.",
          "evidence": "Checklist de utileria previa a sesion/partido"
        },
        {
          "indicator": "Puntualidad en traslados",
          "aspect": "Los traslados se realizaron en los horarios programados sin retrasos injustificados.",
          "evidence": "Bitacora de viajes / reporte de puntualidad"
        },
        {
          "indicator": "Condiciones optimas de cancha",
          "aspect": "Las canchas estuvieron en condiciones optimas para entrenamientos y partidos.",
          "evidence": "Reporte fotografico / inspeccion del cuerpo tecnico"
        },
        {
          "indicator": "Satisfaccion y fidelizacion del cliente",
          "aspect": "Los clientes y patrocinadores activos recibieron seguimiento durante el periodo.",
          "evidence": "Bitacora de seguimiento / encuesta de satisfaccion"
        },
        {
          "indicator": "Cumplimiento de campanas o solicitudes",
          "aspect": "Los entregables de marketing y MKT se entregaron en tiempo y forma.",
          "evidence": "Entregables de campana / reporte de publicaciones"
        }
      ]
    }
  ],
  "fundacion-dante-eludier": [
    {
      "id": "fundacion-dante-eludier-f-02-evaluacion-directiva-y-estrategica",
      "businessUnitId": "fundacion-dante-eludier",
      "code": "F-02",
      "title": "Evaluacion Directiva y Estrategica",
      "frequency": "Trimestral | Semestral",
      "evaluator": "Corporativo Axen Capital",
      "appliesTo": [
        "Director General UDN"
      ],
      "repInstruction": "REP: \"Una fundacion viable, sostenible y de impacto con crecimiento nacional en cobertura y procuracion de fondos.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Cobertura de beneficiarios",
          "aspect": "El numero de beneficiarios atendidos en el periodo cumple o supera la meta.",
          "evidence": "Reporte de beneficiarios / registro de casos activos"
        },
        {
          "indicator": "Cobertura de beneficiarios",
          "aspect": "Cada beneficiario activo recibio al menos un producto de la Fundacion.",
          "evidence": "Expediente del beneficiario / registro por producto"
        },
        {
          "indicator": "Sostenibilidad financiera",
          "aspect": "Los fondos procurados superaron los egresos operativos de la Fundacion.",
          "evidence": "Estado financiero / reporte de procuracion vs gasto"
        },
        {
          "indicator": "Sostenibilidad financiera",
          "aspect": "La Fundacion cuenta con reserva suficiente para operar el siguiente periodo.",
          "evidence": "Reporte de liquidez / saldo disponible"
        },
        {
          "indicator": "Cumplimiento del plan estrategico",
          "aspect": "El avance real del plan estrategico anual alcanzo el porcentaje esperado para el periodo.",
          "evidence": "Plan estrategico con avance actualizado / dashboard de KPIs"
        },
        {
          "indicator": "Cumplimiento del plan estrategico",
          "aspect": "La Fundacion cumple con obligaciones normativas como A.C. sin observaciones pendientes.",
          "evidence": "Acuse SAT / reporte de cumplimiento fiscal y legal"
        }
      ]
    },
    {
      "id": "fundacion-dante-eludier-f-03-evaluacion-de-procuracion-de-fondos-y-activaciones",
      "businessUnitId": "fundacion-dante-eludier",
      "code": "F-03",
      "title": "Evaluacion de Procuracion de Fondos y Activaciones",
      "frequency": "Mensual",
      "evaluator": "Director General UDN",
      "appliesTo": [
        "Coordinador de Procuracion de Fondos",
        "Coordinador de Activaciones",
        "Ejecutivo de Cuenta MKT",
        "Enlace Comercial"
      ],
      "repInstruction": "REP: Coord. Procuracion: \"Procuracion de fondos suficientes para garantizar sostenibilidad y expansion.\" / Coord. Activaciones: \"Activaciones y campanas ejecutadas con calidad, impacto social y cumplimiento institucional.\" / MKT y Comercial: REP institucional relacionado al posicionamiento y crecimiento de la Fundacion.",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Campana / Evento evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Meta de procuracion de fondos",
          "aspect": "El monto recaudado en el periodo cumplio el porcentaje de meta establecido.",
          "evidence": "Reporte de recaudacion / comparativo meta vs resultado"
        },
        {
          "indicator": "Meta de procuracion de fondos",
          "aspect": "Las campanas programadas fueron ejecutadas en tiempo y forma.",
          "evidence": "Cronograma de campanas vs ejecucion real"
        },
        {
          "indicator": "Tasa de donantes recurrentes",
          "aspect": "El numero de donantes fidelizados en el periodo cumplio el objetivo.",
          "evidence": "Base de datos de donantes / registro de donaciones recurrentes"
        },
        {
          "indicator": "Nuevas alianzas corporativas cerradas",
          "aspect": "Se firmaron nuevos convenios o donativos institucionales en el periodo.",
          "evidence": "Convenios firmados / cartas de donativo"
        },
        {
          "indicator": "Cumplimiento de Activaciones",
          "aspect": "Las activaciones programadas del periodo se ejecutaron en su totalidad.",
          "evidence": "Cronograma de activaciones vs ejecucion / reporte post-evento"
        },
        {
          "indicator": "Impacto Comunitario",
          "aspect": "El alcance de las activaciones (personas, participantes, alcance digital) cumplio el objetivo.",
          "evidence": "Reporte de alcance / estadisticas de redes / registro de asistentes"
        },
        {
          "indicator": "Cumplimiento Logistico",
          "aspect": "Los materiales, espacios y recursos estuvieron listos antes del inicio de cada activacion.",
          "evidence": "Checklist logistico pre-evento / reporte de preparacion"
        }
      ]
    },
    {
      "id": "fundacion-dante-eludier-f-04-evaluacion-de-responsabilidad-social-y-finanzas",
      "businessUnitId": "fundacion-dante-eludier",
      "code": "F-04",
      "title": "Evaluacion de Responsabilidad Social y Finanzas",
      "frequency": "Mensual",
      "evaluator": "Director General UDN",
      "appliesTo": [
        "Coordinador de Responsabilidad Social",
        "Ejecutivo de Cuentas y Finanzas"
      ],
      "repInstruction": "REP: Coord. RS: \"Solicitudes atendidas, procesadas y vinculadas en tiempo y forma.\" / Finanzas: \"Procuracion de fondos administrados y reportados con transparencia, solvencia y cumplimiento normativo.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Tasa de continuidad en tratamiento",
          "aspect": "El porcentaje de beneficiarios que llegaron a la etapa de colocacion cumplio el objetivo.",
          "evidence": "Registro de seguimiento de casos / reporte de continuidad"
        },
        {
          "indicator": "Solicitudes atendidas",
          "aspect": "El numero de solicitudes recibidas fue procesado y atendido en tiempo y forma.",
          "evidence": "Registro de solicitudes / reporte de casos atendidos vs recibidos"
        },
        {
          "indicator": "Satisfaccion de familias beneficiarias",
          "aspect": "Se aplico encuesta o mecanismo de retroalimentacion a familias en el periodo.",
          "evidence": "Resultados de encuesta / registros de retroalimentacion"
        },
        {
          "indicator": "Satisfaccion de familias beneficiarias",
          "aspect": "El nivel de satisfaccion de las familias se encuentra en el rango esperado.",
          "evidence": "Reporte de satisfaccion / NPS o calificacion promedio obtenida"
        },
        {
          "indicator": "Oportunidad en reporte financiero",
          "aspect": "Los reportes financieros fueron entregados al Director y al Corporativo en fechas comprometidas.",
          "evidence": "Correos de entrega / acuses de recibo"
        },
        {
          "indicator": "Cumplimiento de obligaciones fiscales",
          "aspect": "Las obligaciones ante el SAT y autoridades A.C. se cumplieron sin multas ni recargos.",
          "evidence": "Acuses SAT / declaraciones en tiempo"
        },
        {
          "indicator": "Exactitud del registro contable",
          "aspect": "La contabilidad no presenta diferencias sin justificar ni errores en el registro de fondos.",
          "evidence": "Conciliacion contable / reporte de auditoria interna"
        }
      ]
    },
    {
      "id": "fundacion-dante-eludier-f-05-evaluacion-de-voluntariados",
      "businessUnitId": "fundacion-dante-eludier",
      "code": "F-05",
      "title": "Evaluacion de Voluntariados",
      "frequency": "Por evento | Mensual (voluntariado activo)",
      "evaluator": "Coordinador de Activaciones / Coord. Procuracion de Fondos",
      "appliesTo": [
        "Voluntariado de Activaciones",
        "Voluntariado de Procuracion de Fondos"
      ],
      "repInstruction": "REP: Activaciones: \"Activaciones de campanas apoyadas de manera eficiente y organizada.\" / Procuracion: \"Recursos y apoyos gestionados que contribuyan a la expansion de la Fundacion.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Rol de Voluntariado",
        "Activacion / Campana",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Participacion en Activaciones",
          "aspect": "El voluntario asistio a las activaciones y campanas asignadas en el periodo.",
          "evidence": "Lista de asistencia / registro de participacion"
        },
        {
          "indicator": "Cumplimiento de Actividades Asignadas",
          "aspect": "Las tareas asignadas al voluntario en cada activacion fueron realizadas en su totalidad.",
          "evidence": "Checklist de actividades asignadas / reporte del Coordinador"
        },
        {
          "indicator": "Calidad del Apoyo Operativo",
          "aspect": "La contribucion del voluntario fue ordenada y alineada a las instrucciones institucionales.",
          "evidence": "Retroalimentacion del Coordinador / reporte post-activacion"
        },
        {
          "indicator": "Procuracion de fondos",
          "aspect": "El voluntario incorporo nuevos donantes en el periodo.",
          "evidence": "Registro de nuevos donantes referidos / reporte de captacion"
        },
        {
          "indicator": "Cumplimiento de Actividades de Procuracion",
          "aspect": "El voluntario participo en las actividades de procuracion con el nivel de compromiso esperado.",
          "evidence": "Registro de participacion / retroalimentacion del Coordinador"
        },
        {
          "indicator": "Nivel de conversion",
          "aspect": "Los prospectos gestionados por el voluntario se convirtieron en donadores en el periodo.",
          "evidence": "Registro de prospectos vs donadores confirmados"
        }
      ]
    }
  ],
  "marca-dante-eludier": [
    {
      "id": "marca-dante-eludier-f-02-evaluacion-directiva",
      "businessUnitId": "marca-dante-eludier",
      "code": "F-02",
      "title": "Evaluacion Directiva",
      "frequency": "Trimestral | Semestral",
      "evaluator": "Corporativo Axen Capital",
      "appliesTo": [
        "Director General UDN",
        "Gerente de Diseno de Experiencias"
      ],
      "repInstruction": "REP: Dir. General: \"Una marca personal, solida, influyente y trascendente con crecimiento sostenible.\" / Ger. Experiencias: \"Experiencias memorables alineadas a la filosofia y proposito de la marca.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Posicionamiento de marca personal",
          "aspect": "El nivel de crecimiento de presencia e influencia de la marca cumplio el objetivo del periodo.",
          "evidence": "Metricas de redes sociales / alcance de contenidos / menciones de marca"
        },
        {
          "indicator": "Creacion de iniciativas y proyectos de impacto",
          "aspect": "Los eventos, contenidos y colaboraciones del periodo generaron el alcance y resultados esperados.",
          "evidence": "Reporte de iniciativas / estadisticas de eventos y contenidos"
        },
        {
          "indicator": "Crecimiento economico y estrategico de la marca",
          "aspect": "Los objetivos de expansion y consolidacion de la marca cumplen el avance esperado.",
          "evidence": "Reporte de ingresos por marca / avance de plan estrategico"
        },
        {
          "indicator": "Satisfaccion de asistentes y participantes",
          "aspect": "El nivel de percepcion positiva de las experiencias desarrolladas cumplio la meta.",
          "evidence": "Encuesta post-evento / calificacion promedio de asistentes"
        },
        {
          "indicator": "Cumplimiento de experiencias ejecutadas",
          "aspect": "El nivel de eventos y activaciones realizados conforme a la planeacion cumplio el objetivo.",
          "evidence": "Cronograma de eventos vs ejecutado / reporte post-activacion"
        },
        {
          "indicator": "Alineacion de experiencias con la marca",
          "aspect": "Los estandares y narrativa de marca se aplicaron correctamente en las experiencias del periodo.",
          "evidence": "Checklist de identidad de marca / retroalimentacion de asistentes"
        }
      ]
    },
    {
      "id": "marca-dante-eludier-f-03-evaluacion-comercial-comunicacion-y-atencion-al-cliente",
      "businessUnitId": "marca-dante-eludier",
      "code": "F-03",
      "title": "Evaluacion Comercial, Comunicacion y Atencion al Cliente",
      "frequency": "Mensual",
      "evaluator": "Gerente de Diseno de Experiencias / Director General UDN",
      "appliesTo": [
        "Enlace Comercial",
        "Enlace de Comunicacion",
        "Atencion al Cliente",
        "Ejecutivo de Cuentas de Finanzas",
        "Coordinador de Eventos"
      ],
      "repInstruction": "REP: Enlace Comercial: \"Alto volumen de ventas de los productos y/o servicios de la UDN.\" / Enlace Comunicacion: \"Comunicacion institucional alineada, estrategica y consistente con la filosofia de la marca.\" / Atencion: \"Audiencias, participantes y clientes atendidos oportunamente con experiencia positiva.\" / Finanzas: \"Recursos financieros controlados con estabilidad y cumplimiento.\" / Coord. Eventos: \"Eventos ejecutados exitosamente con calidad y experiencia memorable.\"",
      "fields": [
        "Unidad de Negocio",
        "Area",
        "Puesto Evaluado",
        "Nombre del Evaluado",
        "Evaluador",
        "Periodo Evaluado",
        "Fecha de Evaluacion",
        "Folio"
      ],
      "checklist": [
        {
          "indicator": "Oportunidades comerciales generadas",
          "aspect": "El nivel de proyectos y alianzas identificadas y desarrolladas cumplio la meta del periodo.",
          "evidence": "Pipeline comercial / registro de prospectos y propuestas"
        },
        {
          "indicator": "Conversion y rentabilidad de oportunidades",
          "aspect": "El nivel de propuestas convertidas en acuerdos o contratos cumplio el objetivo.",
          "evidence": "Contratos firmados / registro de conversiones comerciales"
        },
        {
          "indicator": "Ingresos generados por alianzas",
          "aspect": "La contribucion comercial al crecimiento de la marca cumplio la meta financiera.",
          "evidence": "Reporte de ingresos generados por alianzas / estado de cuenta"
        },
        {
          "indicator": "Cumplimiento del plan de comunicacion",
          "aspect": "Las acciones y campanas de comunicacion se ejecutaron conforme a la estrategia.",
          "evidence": "Calendario de comunicacion vs ejecutado / publicaciones realizadas"
        },
        {
          "indicator": "Coherencia de marca y mensaje",
          "aspect": "Los contenidos del periodo estuvieron alineados con la identidad de Dante Eludier.",
          "evidence": "Revision de piezas / vo.bo. de Direccion"
        },
        {
          "indicator": "Alcance e interaccion de comunicacion",
          "aspect": "El impacto generado por contenidos y campanas cumplio la meta de alcance.",
          "evidence": "Estadisticas de redes sociales / reporte de alcance"
        },
        {
          "indicator": "Tiempo de respuesta a solicitudes",
          "aspect": "El nivel de atencion oportuna a clientes y comunidad cumplio el estandar.",
          "evidence": "Registro de tiempos de respuesta / bitacora de atencion"
        },
        {
          "indicator": "Cumplimiento logistico de eventos",
          "aspect": "Los eventos se ejecutaron conforme al cronograma y requerimientos establecidos.",
          "evidence": "Checklist logistico / reporte post-evento"
        },
        {
          "indicator": "Control presupuestal",
          "aspect": "El nivel de cumplimiento del presupuesto autorizado cumplio el estandar del periodo.",
          "evidence": "Reporte presupuestal / conciliacion de gastos"
        }
      ]
    }
  ]
};

export const getEvaluationDocumentFormats = (businessUnitId: string) => evaluationDocumentFormatsByUnit[businessUnitId] ?? [];
