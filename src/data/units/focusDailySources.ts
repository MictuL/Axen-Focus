export type FocusDailySourcePosition = {
  positionName: string;
  objective: string;
  description: string;
  rep: string;
};

export type FocusDailyUnitSource = {
  unitId: string;
  unitName: string;
  sourceFile: string;
  positions: FocusDailySourcePosition[];
};

export const AXEN_LIFE_UNIT_ID = "axen-life";
export const VITAL_XTATION_UNIT_ID = "vital-xtation";

export const focusDailyUnitSources: FocusDailyUnitSource[] = [
  {
    "unitId": "axen-energy",
    "unitName": "Axen Energy",
    "sourceFile": "Focus_Diario_Axen_Energy.docx",
    "positions": [
      {
        "positionName": "Director General UDN",
        "objective": "Dirigir y supervisar la estrategia integral de Axen Energy, asegurando crecimiento rentable, posicionamiento, eficiencia operativa y cumplimiento de objetivos organizacionales.",
        "description": "Es responsable de liderar la visión estratégica de Axen Energy, garantizando sostenibilidad financiera, expansión comercial, posicionamiento de mercado, alineación cultural y cumplimiento del propósito de transición energética.",
        "rep": "Unidad de negocio rentable, sostenible y en crecimiento constante"
      },
      {
        "positionName": "Gerente De Desarrollo De Negocios",
        "objective": "Dirigir y fortalecer la estrategia comercial, asegurando generación de oportunidades, cierre de ventas y expansión del mercado.",
        "description": "Es responsable de supervisar la estrategia comercial de Axen Energy mediante prospección, alianzas y seguimiento comercial, asegurando crecimiento sostenido y cumplimiento de metas de ventas.",
        "rep": "Un crecimiento comercial rentable mediante alianzas, prospección y conversión efectiva de clientes."
      },
      {
        "positionName": "Coordinador De Alianzas Comerciales",
        "objective": "Desarrollar y fortalecer relaciones estratégicas que impulsen oportunidades comerciales y posicionamiento de la marca.",
        "description": "Es responsable de generar convenios, relaciones y alianzas estratégicas con empresas, desarrolladores, industrias y socios comerciales para ampliar el alcance y crecimiento de Axen Energy.",
        "rep": "Alianzas estratégicas activas que generen oportunidades comerciales y crecimiento de mercado."
      },
      {
        "positionName": "Coordinador B2B",
        "objective": "Gestionar relaciones comerciales con clientes empresariales, asegurando prospección, seguimiento y cierre efectivo de proyectos.",
        "description": "Es responsable de identificar, desarrollar y dar seguimiento a oportunidades comerciales del sector empresarial, promoviendo soluciones energéticas alineadas a las necesidades del cliente y objetivos de la organización.",
        "rep": "Empresas prospectadas y convertidas en clientes a través de soluciones energéticas rentables."
      },
      {
        "positionName": "Coordinador B2C",
        "objective": "Gestionar ventas y seguimiento comercial a clientes particulares, promoviendo soluciones energéticas accesibles y eficientes.",
        "description": "Es responsable de identificar, desarrollar y dar seguimiento a oportunidades comerciales particulares, promoviendo soluciones energéticas alineadas a las necesidades del cliente y objetivos de la organización.",
        "rep": "Prospectos particulares convertidos en clientes a través de soluciones energéticas rentables."
      },
      {
        "positionName": "Ejecutivo De Cuentas De Finanzas",
        "objective": "Gestionar procesos financieros y administrativos, asegurando control de cuentas, seguimiento y cumplimiento financiero.",
        "description": "Es responsable de administrar cuentas, pagos, reportes y seguimiento financiero de proyectos y clientes garantizando la gestión adecuada de los recursos económicos de la unidad.",
        "rep": "Cuentas administradas con control, seguimiento y estabilidad financiera."
      },
      {
        "positionName": "Coordinador De Investigación Y Desarrollo",
        "objective": "Investigar, desarrollar y optimizar soluciones energéticas que fortalezcan la competitividad e innovación de Axen Energy.",
        "description": "Es responsable de analizar y desarrollar propuestas a partir de tendencias, tecnologías y oportunidades de innovación energética, asegurando actualización tecnológica y mejora continua de productos y servicios.”",
        "rep": "Propuestas viables, innovadoras, eficientes y alineadas a la evolución tecnológica del mercado."
      },
      {
        "positionName": "Gerente Operativo",
        "objective": "Supervisar y optimizar la operación, asegurando la continuidad operativa de la unidad, aprovechamiento de los recursos y ejecución correcta de los proyectos.",
        "description": "Es responsable de garantizar la correcta ejecución de procesos operativos, asegurando eficiencia, calidad y cumplimiento de estándares organizacionales.",
        "rep": "Una operación eficiente, segura y rentable alineada a la calidad del servicio."
      },
      {
        "positionName": "Experiencia Al Cliente",
        "objective": "Brindar atención, seguimiento y acompañamiento efectivo garantizando satisfacción y continuidad comercial.",
        "description": "Es responsable de dar seguimiento a prospectos y clientes, asegurando atención oportuna, solución efectiva de incidencias y fortalecimiento de la experiencia del cliente en Axen Energy.",
        "rep": "Clientes atendidos oportunamente, satisfechos y fidelizados mediante una experiencia de valor."
      },
      {
        "positionName": "Ejecutivo De Comunicación",
        "objective": "Gestionar la comunicación interna y externa, alineado a la imagen y posicionamiento de Axen Energy.",
        "description": "Es responsable de vincular las estrategias de comunicación, contenido y difusión institucional manteniendo alineación de marca, fortalecimiento comercial y organizacional.",
        "rep": "Comunicación clara y efectiva, alineada a la cultura de Axen Capital."
      },
      {
        "positionName": "Coordinador De Mantenimiento Y Corrección",
        "objective": "Garantizar mantenimiento preventivo y correctivo asegurando continuidad y rendimiento óptimo de los sistemas instalados.",
        "description": "Es responsable de ejecutar servicios de mantenimiento, seguimiento a pólizas, diagnóstico y corrección técnica de sistemas asegurando funcionalidad, seguridad y satisfacción del cliente.",
        "rep": "Sistemas energéticos funcionales, seguros y operando efectivamente."
      },
      {
        "positionName": "Ejecutivo Jurídico",
        "objective": "Garantizar cumplimiento legal y protección jurídica en contratos, operaciones y procesos organizacionales.",
        "description": "Es responsable de supervisar contratos, normativas, permisos y procesos legales de Axen Energy asegurando cumplimiento regulatorio y protección institucional.",
        "rep": "Operaciones y proyectos respaldados con cumplimiento legal y seguridad jurídica."
      },
      {
        "positionName": "Gerente De Crédito Y Cobranza",
        "objective": "Supervisar procesos de crédito y cobranza, asegurando liquidez, recuperación y control financiero.",
        "description": "Es responsable de supervisar y garantizar estrategias de crédito, cobranza y recuperación de cartera, asegurando estabilidad financiera y disminución de riesgo económico.",
        "rep": "Cartera financiera sana mediante recuperación eficiente y control crediticio."
      },
      {
        "positionName": "Ejecutivo De Crédito",
        "objective": "Evaluar solicitudes de financiamiento, garantizando viabilidad y control de riesgo crediticio.",
        "description": "Es responsable de analizar, validar y someter a la autorización del corporativo procesos de crédito, asegurando cumplimiento de políticas financieras y viabilidad económica.",
        "rep": "Créditos evaluados y autorizados bajo criterios financieros y de riesgo establecidos por el corporativo."
      },
      {
        "positionName": "Ejecutivo De Cobranza",
        "objective": "Asegurar recuperación de cartera y seguimiento de pagos, garantizando liquidez y control financiero.",
        "description": "Es responsable de dar seguimiento a cuentas por cobrar, seguimiento a eventualidades, negociación y recuperación de pagos, asegurando estabilidad financiera, liquidez y cumplimiento operativo.",
        "rep": "Recuperación eficiente de cartera mediante seguimiento y cumplimiento de pagos."
      }
    ]
  },
  {
    "unitId": "axen-health",
    "unitName": "Axen Health",
    "sourceFile": "Focus_Diario_Axen_Health.docx",
    "positions": [
      {
        "positionName": "Director General UDN",
        "objective": "Dirigir y supervisar la operación integral de Axen Health, impulsando el crecimiento rentable del negocio, la eficiencia operativa y el cumplimiento de los estándares de servicio y experiencia, asegurando el cumplimento del REP.",
        "description": "Es responsable de dirigir la estrategia integral de Axen Health, garantizando sostenibilidad operativa, posicionamiento, rentabilidad, expansión constante y alineación cultural.",
        "rep": "Una organización solvente, viable y en crecimiento constante."
      },
      {
        "positionName": "Gerente Administrativo",
        "objective": "Administrar y optimizar el capital humano, los recursos administrativos y financieros garantizando control, eficiencia y soporte a la operación",
        "description": "Dirigir y supervisar la gestión integral de los recursos financieros, contables, administrativos y operativos de la unidad para garantizar finanzas sanas, estabilidad operativa y cumplimiento organizacional, mediante controles eficientes, administración transparente y una ejecución disciplinada orientada a la sostenibilidad y crecimiento del negocio.",
        "rep": "Una administración ordenada, eficiente y sostenible que soporte el crecimiento de la organización."
      },
      {
        "positionName": "Gerente Operativo",
        "objective": "Supervisar y optimizar la operación diaria, asegurando calidad, productividad y cumplimiento de estándares de servicio.",
        "description": "Es responsable de garantizar la ejecución operativa integral de Axen Health mediante procesos eficientes, estandarizados y medibles, asegurando una experiencia premium para el cliente, rentabilidad operativa y alineación con la cultura organizacional de Axen Capital.",
        "rep": "Una operación eficiente, rentable y alineada a la experiencia de valor."
      },
      {
        "positionName": "Experiencia Al Cliente",
        "objective": "Brindar atención y seguimiento efectivo al cliente, garantizando satisfacción, retención y experiencia positiva.",
        "description": "Es responsable de brindar atención estratégica y asesoría personalizada a clientes y prospectos, promoviendo la comercialización de membresías y servicios wellness mediante una experiencia excepcional de servicio, seguimiento y fidelización, contribuyendo directamente al crecimiento comercial, posicionamiento de marca y sostenibilidad de Axen Health.",
        "rep": "Clientes atendidos oportunamente, convertidos en miembros activos y fidelizados."
      },
      {
        "positionName": "Servicio Al Cliente",
        "objective": "Brindar atención, seguimiento y solución efectiva a clientes y prospectos garantizando una experiencia positiva y continua.",
        "description": "Es responsable de atender, orientar y dar seguimiento a clientes y prospectos de Axen Health, asegurando respuestas oportunas, resolución efectiva de incidencias, continuidad en la atención y fortalecimiento de la satisfacción y fidelización del cliente.",
        "rep": "Clientes totalmente satisfechos con seguimiento oportuno y resolución efectiva."
      },
      {
        "positionName": "Host",
        "objective": "Recibir, orientar y canalizar a prospectos y visitantes, asegurando una experiencia premium y convirtiéndolos en clientes.",
        "description": "Es responsable de brindar bienvenida, atención inicial y acompañamiento a visitantes y prospectos de Axen Health, asegurando orden, hospitalidad, correcta canalización y una experiencia alineada a los estándares de servicio y cultura de la marca, asegurando la conversion.",
        "rep": "Alto volumen de conversión de prospectos a clientes."
      },
      {
        "positionName": "Ejecutivo De Cuentas De Finanzas",
        "objective": "Controlar y administrar los recursos financieros, asegurando estabilidad, rentabilidad y cumplimiento presupuestal.",
        "description": "Es responsable de asegurar la estabilidad financiera y el control económico de AXEN Health mediante la correcta administración del flujo financiero, control presupuestal, supervisión de movimientos económicos y cumplimiento de procesos administrativos, contables y financieros, reportando oportunamente a la Dirección Corporativa de Finanzas.",
        "rep": "Control de ingresos, egresos e inventarios reportados en tiempo y forma."
      },
      {
        "positionName": "Coordinador De Servicios De Producción",
        "objective": "Prevenir y garantizar el funcionamiento óptimo de la infraestructura y el equipo de Axen Health.",
        "description": "Es responsable de coordinar y supervisar la correcta ejecución de servicios y actividades operativas relacionadas con la experiencia de entrenamiento, bienestar y atención funcional.",
        "rep": "Infraestructura y equipos disponibles y en óptimas condiciones."
      },
      {
        "positionName": "Coordinador De Producción",
        "objective": "Coordinar la correcta ejecución de los servicios operativos garantizando continuidad, calidad y eficiencia operativa.",
        "description": "Es responsable de planificar, coordinar y supervisar las actividades operativas relacionadas con coaches, especialistas y facilitadores de servicios wellness, garantizando calidad en la atención, óptima programación, alineación cultural y cumplimiento de objetivos operativos y comerciales.",
        "rep": "Servicios entregados a los clientes con la calidad, puntualidad, costos y eficiencia prometidos."
      },
      {
        "positionName": "Especialista Interno",
        "objective": "Diseñar e impartir sesiones de entrenamiento y bienestar de manera puntual y bajo los estándares de calidad establecidos dentro de Axen Health.",
        "description": "Es responsable de garantizar una experiencia de entrenamiento y bienestar de alto nivel que impulsa la satisfacción, permanencia y resultados de los usuarios de Axen Health.",
        "rep": "Sesiones ejecutadas con calidad, puntualidad y alineados a los estándares establecidos por la organización."
      },
      {
        "positionName": "Especialista Externo",
        "objective": "Diseñar e impartir programas de entrenamiento y bienestar de manera puntual y bajo los estándares de calidad establecidos dentro de Axen Health.",
        "description": "Es responsable de garantizar una experiencia de entrenamiento y bienestar de alto nivel que impulsa la satisfacción, permanencia y resultados de los usuarios de Axen Health.",
        "rep": "Sesiones ejecutadas con calidad, puntualidad y alineados a los estándares establecidos por la organización."
      }
    ]
  },
  {
    "unitId": "axen-life",
    "unitName": "Axen Life",
    "sourceFile": "Focus_Diario_Axen_Life.docx",
    "positions": [
      {
        "positionName": "Comisario",
        "objective": "Vigilar la gestión integral de AXEN LIFE, verificando que las operaciones, administración y toma de decisiones se realicen conforme a la normatividad aplicable, estatutos sociales y mejores prácticas de gobierno corporativo.",
        "description": "Es responsable de ejercer funciones de vigilancia y supervisión sobre la administración de la sociedad, observando el cumplimiento de las disposiciones legales, regulatorias y corporativas, emitiendo recomendaciones que contribuyan a la transparencia, control institucional, protección de los intereses de los accionistas y fortalecimiento del gobierno corporativo.",
        "rep": "Una institución supervisada, transparente, alineada al objeto social y operando conforme al marco legal y regulatorio aplicable."
      },
      {
        "positionName": "Director General UDN",
        "objective": "Dirigir y supervisar la estrategia integral de AXEN LIFE garantizando rentabilidad, cumplimiento regulatorio, crecimiento comercial y sostenibilidad institucional.",
        "description": "Es responsable de liderar la visión estratégica de la organización asegurando el cumplimiento de los objetivos financieros, comerciales, operativos y regulatorios, promoviendo el crecimiento ordenado y la generación de valor para socios, clientes y accionistas.",
        "rep": "Una SOFIPO rentable, sostenible, regulatoriamente sólida y en crecimiento continuo."
      },
      {
        "positionName": "Oficial De Cumplimiento",
        "objective": "Garantizar el cumplimiento normativo de la SOFIPO en materia regulatoria, prevención de lavado de dinero y disposiciones emitidas por autoridades financieras.",
        "description": "Es responsable de supervisar el cumplimiento de las obligaciones regulatorias de la institución, monitorear riesgos de incumplimiento y asegurar la correcta aplicación de políticas y controles internos.",
        "rep": "Una institución alineada al marco regulatorio y libre de riesgos de incumplimiento."
      },
      {
        "positionName": "Director Operativo",
        "objective": "Dirigir y coordinar las áreas operativas garantizando eficiencia, productividad, control y continuidad de las operaciones institucionales.",
        "description": "Es responsable de supervisar la operación integral de AXEN LIFE asegurando el cumplimiento de políticas, procedimientos, niveles de servicio y objetivos operativos establecidos.",
        "rep": "Una operación eficiente, segura, rentable y alineada a la estrategia institucional."
      },
      {
        "positionName": "Asesor Comercial",
        "objective": "Promover productos financieros y desarrollar relaciones comerciales que permitan incrementar la cartera de clientes de AXEN LIFE.",
        "description": "Es responsable de prospectar, asesorar y cerrar oportunidades comerciales garantizando una adecuada atención y cumplimiento de objetivos de negocio.",
        "rep": "Incremento sostenible de cartera y captación mediante la generación y fidelización de nuevos clientes."
      },
      {
        "positionName": "Gerente De Sucursal",
        "objective": "Dirigir la operación comercial y administrativa de la sucursal garantizando cumplimiento de metas, servicio y rentabilidad.",
        "description": "Es responsable de administrar integralmente la sucursal coordinando recursos humanos, comerciales y operativos para asegurar resultados sostenibles.",
        "rep": "Una sucursal rentable, eficiente y alineada a los objetivos institucionales."
      },
      {
        "positionName": "Gerente De Crédito",
        "objective": "Supervisar los procesos de atención garantizando una experiencia positiva y solución efectiva de requerimientos en tiempo y forma.",
        "description": "Es responsable de coordinar al personal de atención y asegurar el cumplimiento de estándares de servicio establecidos por la institución.",
        "rep": "Una cartera de crédito rentable, sana y con riesgo controlado."
      },
      {
        "positionName": "Analista De Crédito",
        "objective": "Analizar información financiera y documental para apoyar los procesos de evaluación y autorización.",
        "description": "Es responsable de recopilar, validar y analizar información garantizando calidad y confiabilidad en los dictámenes emitidos.",
        "rep": "Información financiera y crediticia confiable para la toma de decisiones."
      },
      {
        "positionName": "Especialista De Cobranza",
        "objective": "Gestionar la recuperación de créditos manteniendo niveles saludables de cartera.",
        "description": "Es responsable de ejecutar estrategias de cobranza preventiva y correctiva para maximizar la recuperación de recursos.",
        "rep": "Recuperación eficiente de cartera y reducción de morosidad."
      },
      {
        "positionName": "Ejecutivo De Atención Al Cliente – Área Finanzas",
        "objective": "Brindar atención y seguimiento especializado a solicitudes, aclaraciones y trámites financieros de los clientes, garantizando soluciones oportunas, precisas y alineadas a las políticas institucionales.",
        "description": "Es responsable de atender consultas relacionadas con estados de cuenta, movimientos, pagos, inversiones, créditos, aclaraciones financieras y trámites administrativos, proporcionando orientación clara y seguimiento efectivo que contribuya a una experiencia positiva del cliente y a la confianza en AXEN LIFE.",
        "rep": "Clientes atendidos oportunamente en sus requerimientos financieros."
      },
      {
        "positionName": "Ejecutivo De Atención Al Cliente – Área Tecnología",
        "objective": "Brindar soporte y atención especializada a clientes en el uso de plataformas, aplicaciones y servicios digitales de AXEN LIFE, garantizando una experiencia tecnológica eficiente y confiable.",
        "description": "Es responsable de atender incidencias, dudas y solicitudes relacionadas con plataformas digitales, accesos, aplicaciones, banca electrónica y herramientas tecnológicas utilizadas por los clientes, proporcionando orientación y seguimiento oportuno para asegurar la continuidad del servicio y una experiencia digital satisfactoria.",
        "rep": "Clientes con acceso continuo, seguro y funcional a los servicios tecnológicos de la institución."
      },
      {
        "positionName": "Ejecutivo De Soporte Para Asesores Comerciales",
        "objective": "Brindar soporte operativo, administrativo y de atención a los asesores comerciales, asegurando el seguimiento eficiente de solicitudes, integración documental y atención de requerimientos que contribuyan al cumplimiento de los objetivos comerciales.",
        "description": "Es responsable de apoyar a los asesores comerciales mediante la atención y seguimiento de procesos, acompañamiento administrativo, contribuyendo a una operación más ágil, organizada y orientada al servicio.",
        "rep": "Asesores comerciales respaldados con atención, seguimiento y soporte oportuno que faciliten la colocación de productos financieros."
      },
      {
        "positionName": "Ejecutivo De Cuentas Y Finanzas",
        "objective": "Administrar cuentas, flujos financieros, conciliación de cuentas, pagos y control administrativo asegurando estabilidad financiera y soporte a la operación.",
        "description": "Es responsable de gestionar inventarios, ingresos, egresos, presupuestos, pagos y reportes financieros garantizando control financiero, orden administrativo y disponibilidad de recursos para la operación.",
        "rep": "Recursos financieros administrados con control, liquidez y cumplimiento para la continuidad operativa del corporativo ."
      },
      {
        "positionName": "Cajero",
        "objective": "Ejecutar transacciones financieras garantizando precisión, control y servicio al cliente.",
        "description": "Es responsable de realizar operaciones de caja cumpliendo políticas de seguridad, control de efectivo y atención al cliente.",
        "rep": "Operaciones de caja seguras, exactas y oportunas."
      }
    ]
  },
  {
    "unitId": "axen-mind-school",
    "unitName": "Axen Mind School",
    "sourceFile": "Focus_Diario_Axen_Mind_School.docx",
    "positions": [
      {
        "positionName": "Director General UDN",
        "objective": "Dirigir y supervisar la estrategia integral de AXEN MIND School, asegurando excelencia académica, sostenibilidad operativa, crecimiento institucional y alineación cultural.",
        "description": "Es responsable de liderar la visión estratégica de AXEN MINDt School, garantizando excelencia educativa, posicionamiento institucional, rentabilidad, crecimiento sostenible y cumplimiento del propósito formativo de la organización.",
        "rep": "Una institución educativa sostenible, reconocida y en crecimiento constante."
      },
      {
        "positionName": "Gerente De Experiencia Y Comunidad",
        "objective": "Supervisar y fortalecer la experiencia integral de alumnos, padres y comunidad educativa asegurando bienestar, integración y acompañamiento continuo.",
        "description": "Es responsable de dirigir las áreas de experiencia, atención y acompañamiento estudiantil, promoviendo un entorno positivo, seguro y alineado a la cultura y valores de AXEN MIND School.",
        "rep": "Una comunidad estudiantil integrada, feliz y alineada a la cultura institucional."
      },
      {
        "positionName": "Gerente Administrativo",
        "objective": "Administrar y optimizar recursos administrativos y financieros garantizando control, eficiencia y soporte operativo.",
        "description": "Es responsable de dirigir y supervisar los procesos administrativos y financieros de AXEN MIND School asegurando estabilidad, cumplimiento, control organizacional y sostenibilidad institucional.",
        "rep": "Una administración ordenada, eficiente y sostenible que soporte el crecimiento institucional."
      },
      {
        "positionName": "Gerencia Operativa",
        "objective": "Supervisar y optimizar la operación diaria, garantizando infraestructura, soporte tecnológico y funcionamiento preventivo y continuo de la institución.",
        "description": "Es responsable de garantizar la correcta operación de instalaciones, servicios generales y soporte tecnológico asegurando continuidad, funcionalidad y eficiencia operativa.",
        "rep": "Una operación eficiente, segura y funcional."
      },
      {
        "positionName": "Gerencia Académica",
        "objective": "Dirigir y fortalecer la ejecución académica, asegurando excelencia educativa, metodología y cumplimiento de estándares institucionales.",
        "description": "Es responsable de supervisar la excelencia académica, desempeño docente y desarrollo formativo de los estudiantes y maestros, asegurando excelencia educativa y alineación pedagógica institucional.",
        "rep": "Un modelo académico de excelencia que garantice el aprendizaje en servicio*."
      },
      {
        "positionName": "Psicopedagogo",
        "objective": "Brindar acompañamiento psicopedagógico, promoviendo bienestar emocional, adaptación conductual y fortalecimiento del desempeño académico de los estudiantes.",
        "description": "Es responsable de detectar, orientar, dar seguimiento y apoyo psicopedagógico a comunidad educativa, fortaleciendo el bienestar emocional, hábitos de estudio, convivencia escolar y desarrollo integral del alumno dentro de AXEN MIND School.",
        "rep": "Una comunidad educativa libre de violencia y educada para la paz."
      },
      {
        "positionName": "Enfermera",
        "objective": "Proporcionar atención básica de enfermería y seguimiento preventivo garantizando bienestar y seguridad estudiantil.",
        "description": "Es responsable de brindar atención primaria, seguimiento de incidencias médicas menores y control preventivo del bienestar físico dentro de AXEN MIND School, asegurando atención oportuna, resguardo del alumno y cumplimiento de protocolos de seguridad escolar.",
        "rep": "Estudiantes atendidos oportunamente con seguridad, prevención y bienestar físico dentro del entorno escolar."
      },
      {
        "positionName": "Host",
        "objective": "Recibir, orientar y canalizar a visitantes, padres y prospectos, asegurando una experiencia institucional positiva.",
        "description": "Es responsable de brindar atención inicial, orientación y acompañamiento a visitantes y prospectos asegurando hospitalidad, orden y correcta canalización institucional.",
        "rep": "Prospectos y visitantes atendidos óptimamente, alineados a los protocolos de institución."
      },
      {
        "positionName": "Coordinador Estudiantil",
        "objective": "Coordinar actividades estudiantiles promoviendo integración, disciplina y participación activa de los alumnos.",
        "description": "Es responsable de supervisar la convivencia estudiantil, actividades formativas y seguimiento disciplinario asegurando alineación con los valores y cultura de AXEN MIND School.",
        "rep": "Estudiantes integrados, participativos y alineados a la cultura institucional."
      },
      {
        "positionName": "Ejecutivo De Cuentas De Finanzas",
        "objective": "Gestionar seguimiento administrativo y financiero de cuentas escolares garantizando atención y control eficiente.",
        "description": "Es responsable de elaborar el POA* y de brindar atención administrativa a padres de familia, seguimiento de pagos, convenios, cooperativa escolar y procesos financieros relacionados con colegiaturas y servicios escolares.",
        "rep": "Libros*, cuentas y reportes generados y entregados en tiempo y forma."
      },
      {
        "positionName": "Coordinador De Control Escolar",
        "objective": "Administrar y controlar la información escolar garantizando orden, cumplimiento y seguimiento académico-administrativo.",
        "description": "Es responsable de gestionar expedientes, calificaciones, documentación oficial y procesos escolares asegurando control y cumplimiento institucional.",
        "rep": "Información académica y administrativa organizada, actualizada y controlada en tiempo y forma."
      },
      {
        "positionName": "Coordinador Servicios Generales",
        "objective": "Garantizar el correcto funcionamiento, limpieza y mantenimiento general de las instalaciones para su uso diario.",
        "description": "Es responsable de supervisar actividades de limpieza, mantenimiento y soporte operativo asegurando espacios óptimos para la comunidad educativa.",
        "rep": "Instalaciones funcionales, limpias y seguras para la operación educativa."
      },
      {
        "positionName": "Soporte Tecnico TI",
        "objective": "Administrar y dar soporte a la infraestructura y los recursos tecnológicos garantizando continuidad operativa y soporte institucional.",
        "description": "Es responsable de asegurar el correcto funcionamiento de sistemas, redes, plataformas y herramientas tecnológicas de AXEN MIND School.",
        "rep": "Infraestructura tecnológica funcional, segura y disponible para la operación académica y administrativa."
      },
      {
        "positionName": "Docentes",
        "objective": "Impartir educación de excelencia asegurando aprendizaje, disciplina y formación integral de los alumnos.",
        "description": "Es responsable de planificar, actualizar, ejecutar y evaluar el desempeño académico asegurando innovación, excelencia educativa y cumplimiento de los programas vigentes académicos.",
        "rep": "Estudiantes formados con aprendizaje al servicio, competencias y desarrollo integral."
      },
      {
        "positionName": "Minders",
        "objective": "Guiar y acompañar a los Mindix, fortaleciendo hábitos, habilidades, desempeño y desarrollo integral.",
        "description": "Es el responsable de diseñar, acompañar y fortalecer la propuesta metodológica de AXEN MIND School asegurando la calidad de los talleres impartidos.",
        "rep": "Estudiantes acompañados en su desarrollo integral y formativo."
      },
      {
        "positionName": "Guardian Escolar",
        "objective": "Supervisar accesos, orden y seguridad institucional garantizando protección y control dentro de las instalaciones escolares.",
        "description": "Es responsable de supervisar accesos, recorridos y control de seguridad dentro de AXEN MIND School, asegurando disciplina, prevención de incidentes, resguardo de estudiantes y objetos de valor con cumplimiento de protocolos institucionales de seguridad y convivencia escolar.",
        "rep": "Comunidad estudiantil resguardada en un entorno seguro, ordenado y bajo control institucional."
      },
      {
        "positionName": "Encargado De Mantenimiento",
        "objective": "Prevenir y corregir fallas de infraestructura y equipamiento, garantizando continuidad operativa.",
        "description": "Es responsable de ejecutar mantenimiento preventivo y correctivo de instalaciones, mobiliario y equipos de AXEN MIND School, asegurando funcionalidad y seguridad.",
        "rep": "Infraestructura y equipos funcionales, seguros y en óptimas condiciones."
      }
    ]
  },
  {
    "unitId": "axen-up",
    "unitName": "Axen Up",
    "sourceFile": "Focus_Diario_Axen_Up.docx",
    "positions": [
      {
        "positionName": "Director General De Área",
        "objective": "Asegurar el crecimiento sostenible, la producción y el control de riesgo de toda la operación.",
        "description": "Lidera la unidad, define estrategias, supervisa tecnología, finanzas y operaciones, reportando al CEO de Axen Capital.",
        "rep": "Dirección estratégica con crecimiento y alto volumen de rendimientos."
      },
      {
        "positionName": "Líder De Investigación Y Desarrollo",
        "objective": "Desarrollar y mejorar soluciones tecnológicas que incrementen la producción, la eficiencia operativa y la escalabilidad.",
        "description": "Diseña la arquitectura tecnológica y supervisa desarrollos, algoritmos y automatizaciones.",
        "rep": "Herramientas algorítmicas y estrategias automatizadas para facilitar la producción."
      },
      {
        "positionName": "Desarrollador",
        "objective": "Construir, actualizar y mejorar sistemas tecnológicos para la operación de trading.",
        "description": "Es responsable de programar, corregir, probar y optimizar software, bots y plataformas.",
        "rep": "Cantidad de algoritmos y herramientas desarrolladas y funcionando óptimamente."
      },
      {
        "positionName": "Ejecutivo De Cuentas Y Finanzas",
        "objective": "Administrar cuentas, flujos financieros, conciliación de cuentas, pagos y control administrativo asegurando estabilidad financiera y soporte a la operación.",
        "description": "Es responsable de gestionar inventarios, ingresos, egresos, presupuestos, pagos y reportes financieros garantizando control financiero, orden administrativo y disponibilidad de recursos para la operación.",
        "rep": "Recursos financieros administrados con control, liquidez y cumplimiento para la continuidad operativa del corporativo ."
      },
      {
        "positionName": "Gerente De Operaciones",
        "objective": "Garantizar la correcta ejecución de las estrategias y procesos operativos.",
        "description": "Es responsable de coordinar estrategias, plataformas, producción y estadísticas para asegurar resultados.",
        "rep": "Eficiencia operativa y cumplimiento de producción."
      },
      {
        "positionName": "Coordinador De Plataformas",
        "objective": "Administrar las plataformas que soportan la operación comercial y productiva.",
        "description": "Es responsable de gestionar MetaQuotes, CRM y herramientas tecnológicas de la unidad.",
        "rep": "Disponibilidad y estabilidad tecnológica."
      },
      {
        "positionName": "Coordinador De Producción",
        "objective": "Coordinar la ejecución de estrategias de trading manual y algorítmico.",
        "description": "Es responsable de supervisar los equipos productivos y asegura el cumplimiento de metas y protocolos.",
        "rep": "Aumento constante de capital ."
      },
      {
        "positionName": "Especialista De Producción Algorítmica",
        "objective": "Operar y monitorear las estrategias algorítmicas.",
        "description": "Es responsable de supervisar bots, analizar resultados y proponer mejoras.",
        "rep": "Cumplimiento de Meta de producción."
      },
      {
        "positionName": "Especialista Set Up Algorítmico",
        "objective": "Instalación óptima de algoritmos de trading.",
        "description": "Es responsable de cargar los algoritmos a las cuentas de trading conforme a la estrategia de producción.",
        "rep": "Algoritmos instalados en tiempo y forma."
      },
      {
        "positionName": "Especialista De Producción Manual",
        "objective": "Supervisar la ejecución de estrategias manuales de operación conforme a los protocolos definidos.",
        "description": "Es responsable de analizar mercados y ejecutar operaciones con disciplina operativa.",
        "rep": "Cumplimiento de Meta de producción manual."
      },
      {
        "positionName": "Trader",
        "objective": "Ejecutar estrategias manuales de operación conforme a los protocolos definidos.",
        "description": "Es responsable de ejecutar operaciones, monitorear posiciones y documentar resultados.",
        "rep": "Cumplimiento de Meta de producción."
      },
      {
        "positionName": "Coordinador De Estadística",
        "objective": "Analizar información para la acertada toma de decisiones y optimizar la producción.",
        "description": "Es responsable de genera reportes, dashboards e indicadores para dirección y producción.",
        "rep": "Gráficas con claridad de datos para la toma de decisiones."
      }
    ]
  },
  {
    "unitId": "axen-work",
    "unitName": "Axen Work",
    "sourceFile": "Focus_Diario_Axen_Work.docx",
    "positions": [
      {
        "positionName": "Director General UDN",
        "objective": "Dirigir y supervisar la estrategia integral de Axen Work, asegurando crecimiento rentable, posicionamiento de mercado, excelencia operativa y cumplimiento de los objetivos organizacionales.",
        "description": "Es responsable de liderar la visión estratégica de Axen Work, garantizando sostenibilidad financiera, expansión comercial, rentabilidad de proyectos, fortalecimiento de la cultura organizacional y cumplimiento del propósito de dignificar los servicios inmobiliarios y de construcción.",
        "rep": "Una unidad de negocio rentable, sostenible y reconocida por la excelencia de sus proyectos inmobiliarios y de construcción."
      },
      {
        "positionName": "Ejecutivo De Cuentas De Finanzas",
        "objective": "Administrar cuentas, flujos financieros, conciliación de cuentas, pagos y control administrativo, asegurando estabilidad financiera y soporte a la operación.",
        "description": "Es responsable de gestionar ingresos, egresos, presupuestos, cobranza, pagos y reportes financieros de Axen Work, garantizando control financiero, orden administrativo y disponibilidad de recursos para la operación.",
        "rep": "Recursos financieros administrados con control, liquidez y cumplimiento para la continuidad operativa del negocio."
      },
      {
        "positionName": "Gestor De Propiedades",
        "objective": "Administrar la operación de los inmuebles bajo gestión, garantizando ocupación, mantenimiento y satisfacción de los usuarios.",
        "description": "Es responsable de gestionar contratos, renovaciones, cobranza, mantenimiento, atención a inquilinos y propietarios, así como el seguimiento a incidencias operativas de los inmuebles.",
        "rep": "Inmuebles administratos eficientemente, conservando su valor y rentabilidad para propietarios e inversionistas."
      },
      {
        "positionName": "Gerente Operativo",
        "objective": "Dirigir y coordinar la ejecución de los proyectos de construcción, desarrollo inmobiliario y administración operativa, garantizando resultados conforme a presupuesto, calidad y tiempos establecidos.",
        "description": "Es responsable de administrar la operación integral de los proyectos. Coordina equipos técnicos, supervisa avances, controla recursos y asegura la correcta ejecución de obras, desarrollos e inmuebles administrados.",
        "rep": "Proyectos desarrollados y ejecutados con calidad, rentabilidad y cumplimiento de tiempos comprometidos."
      },
      {
        "positionName": "Coordinador De Obras",
        "objective": "Coordinar la ejecución de las obras mediante la supervisión de recursos humanos, materiales y contratistas para garantizar el cumplimiento de los objetivos del proyecto.",
        "description": "Es responsable de organizar y supervisar las actividades de construcción, controla avances físicos y financieros, coordina proveedores y contratistas, verifica calidad constructiva y da seguimiento al cumplimiento de cronogramas.",
        "rep": "Obras ejecutadas conforme al alcance, programa establecido, presupuesto autorizado, dentro del presupuesto autorizado y bajo los estándares de calidad definidos."
      },
      {
        "positionName": "Coordinador Inmobiliario",
        "objective": "Coordinar los procesos de comercialización, adquisición, venta y arrendamiento de inmuebles para generar ingresos y oportunidades de negocio.",
        "description": "Es responsable de administrar y evaluar proyectos, coordinar visitas, negociar operaciones, integrar expedientes, dar seguimiento a clientes y asegurar el cierre exitoso de las transacciones inmobiliarias.",
        "rep": "Operaciones inmobiliarias concretadas de manera rentable y satisfactoria para clientes e inversionistas."
      },
      {
        "positionName": "Diseño De Proyectos",
        "objective": "Diseñar proyectos funcionales, rentables y alineados a los objetivos de negocio y necesidades del cliente.",
        "description": "Es responsable de desarrollar propuestas arquitectónicas, planos ejecutivos, especificaciones técnicas, memorias descriptivas y documentación necesaria para la ejecución de los proyectos.",
        "rep": "Proyectos arquitectónicos y ejecutivos desarrollados conforme a los requerimientos técnicos, normativos y comerciales."
      },
      {
        "positionName": "Especialista De Compras De Construcción",
        "objective": "Garantizar el abastecimiento oportuno de insumos y servicios requeridos para la ejecución de los proyectos constructivos.",
        "description": "Es el responsable de planificar compras, gestionar cotizaciones, comparativos, negociaciones y órdenes de compra. Coordina entregas, evalúa proveedores y controla el suministro de recursos para las obras.",
        "rep": "Materiales, equipos, herramientas y servicios adquiridos optima y oportunamente."
      },
      {
        "positionName": "Gerente Administrativo",
        "objective": "Garantizar el control financiero, administrativo y documental de la organización mediante la correcta gestión de recursos y el cumplimiento de obligaciones legales y fiscales.",
        "description": "Es responsable de supervisar presupuestos, flujo de efectivo, pagos, cobranza, recursos humanos, contratos y documentación corporativa. Proporciona información financiera confiable para la toma de decisiones y asegura el cumplimiento normativo de la empresa.",
        "rep": "Recursos financieros, humanos y administrativos controlados eficientemente."
      },
      {
        "positionName": "Residente De Obra",
        "objective": "Supervisar la ejecución diaria de la obra asegurando calidad, productividad y cumplimiento de especificaciones técnicas y constructivas con cero riesgos.",
        "description": "Es responsable de coordinar personal en sitio, verifica avances, controlar materiales, supervisar contratistas y reportar el avance físico e incidencias de los proyectos al Coordinador de Obra y elaborar bitácora de obra.",
        "rep": "Actividades constructivas ejecutadas correctamente y conforme al programa diario de trabajo."
      },
      {
        "positionName": "Experiencia Al Cliente",
        "objective": "Garantizar una experiencia positiva y profesional que fortalezca la confianza y fidelización de los clientes.",
        "description": "Es responsable de atender solicitudes, dar seguimiento a requerimientos, gestionar quejas, coordinar soluciones con las áreas involucradas y monitorear la satisfacción de los clientes.",
        "rep": "Clientes atendidos de manera oportuna y satisfactoria durante todo su ciclo de relación con la empresa"
      }
    ]
  },
  {
    "unitId": "halcones-futbol-club",
    "unitName": "Halcones Fútbol Club",
    "sourceFile": "Focus_Diario_Club_Deportivo_Halcones.docx",
    "positions": [
      {
        "positionName": "Director General UDN",
        "objective": "Dirigir y supervisar la operación integral del club asegurando cumplimiento deportivo, administrativo y organizacional.",
        "description": "Es responsable de liderar la dirección estratégica del Club Deportivo Halcones, asegurando crecimiento deportivo, estabilidad financiera, fortalecimiento institucional y cumplimiento del propósito organizacional.",
        "rep": "Un club consolidado, competitivo y sostenible con proyección institucional y deportiva."
      },
      {
        "positionName": "Director Deportivo",
        "objective": "Diseñar, dirigir y fortalecer la estructura deportiva asegurando competitividad, metodología y desarrollo integral de jugadores.",
        "description": "Es responsable de supervisar el modelo deportivo del club, garantizando alineación metodológica, desarrollo y selección de talento y cumplimiento de objetivos competitivos.",
        "rep": "Un modelo deportivo con alto porcentaje de partidos ganados."
      },
      {
        "positionName": "Gerente Deportivo E Inteligencia",
        "objective": "Supervisar la ejecución operativa deportiva, garantizando logística, coordinación y cumplimiento de procesos deportivos.",
        "description": "Es responsable de coordinar actividades deportivas, supervisión de equipos y logística, asegurando funcionalidad y cumplimiento operativo del área deportiva.",
        "rep": "Operaciones deportivas organizadas, funcionales y alineadas al rendimiento competitivo del club."
      },
      {
        "positionName": "Director Técnico Premier",
        "objective": "Dirigir el desarrollo deportivo del equipo Premier garantizando rendimiento, disciplina y competitividad.",
        "description": "Es responsable de planificar, dirigir y supervisar entrenamientos, competencias y desarrollo táctico del equipo Premier, asegurando rendimiento deportivo y alineación institucional.",
        "rep": "Un equipo competitivo de alto rendimiento con visión de ascender a la siguiente categoría."
      },
      {
        "positionName": "Doctor Deportivo",
        "objective": "Supervisar y garantizar la salud integral de los jugadores mediante atención médica preventiva, correctiva y seguimiento deportivo.",
        "description": "Es responsable de notificar oportunamente incidencias, brindar atención médica deportiva, diagnóstico, seguimiento clínico y prevención de lesiones asegurando bienestar físico, recuperación adecuada y disponibilidad competitiva de los jugadores del Club Deportivo.",
        "rep": "Jugadores en óptimas condiciones para el rendimiento deportivo."
      },
      {
        "positionName": "Fisioterapeuta Deportivo",
        "objective": "Ejecutar procesos de rehabilitación, recuperación física y prevención de lesiones ,garantizando continuidad deportiva.",
        "description": "Es responsable de notificar oportunamente incidencias así como de aplicar tratamientos fisioterapéuticos, recuperación muscular y programas preventivos asegurando rehabilitación efectiva y optimizando el estado físico de los jugadores.",
        "rep": "Jugadores rehabilitados y recuperados eficientemente para su reincorporación deportiva."
      },
      {
        "positionName": "Preparador Físico",
        "objective": "Diseñar y ejecutar programas de preparación física, fortaleciendo rendimiento, resistencia y prevención de lesiones y mejora constante.",
        "description": "Es responsable notificar oportunamente incidencias, planificar, supervisar y evaluar el acondicionamiento físico de los jugadores asegurando el desempleño atlético, rendimiento competitivo y alineación metodológica deportiva.",
        "rep": "Jugadores preparados físicamente con alto rendimiento, resistencia y condición competitiva."
      },
      {
        "positionName": "Utileros",
        "objective": "Administrar y preparar utilería deportiva asegurando disponibilidad, orden y soporte operativo a los equipos.",
        "description": "Es responsable de organizar, resguardar y preparar uniformes, balones, equipo y material deportivo garantizando funcionamiento operativo y apoyo logístico al cuerpo técnico y jugadores en entrenamientos y competencias.",
        "rep": "Material deportivo disponible, organizado y funcional para entrenamientos y competencias."
      },
      {
        "positionName": "Auxiliar Técnico",
        "objective": "Apoyar al cuerpo técnico en entrenamientos, seguimiento y ejecución táctica asegurando continuidad operativa deportiva.",
        "description": "Es responsable de asistir en la planificación y ejecución de entrenamientos, competencias y el análisis y seguimiento deportivo, fortaleciendo la operación técnica y metodológica de los equipos.",
        "rep": "Apoyo operativo eficiente y alineado a la metodología del Director Técnico y del club."
      },
      {
        "positionName": "Entrenador De Porteros",
        "objective": "Desarrollar habilidades específicas de los porteros mediante entrenamiento técnico, táctico y físico especializado.",
        "description": "Es responsable de planificar y ejecutar entrenamientos específicos para porteros asegurando desarrollo técnico, reacción, posicionamiento y rendimiento competitivo alineado a la metodología institucional.",
        "rep": "Porteros desarrollados técnica, física y tácticamente para el alto rendimiento competitivo."
      },
      {
        "positionName": "Jugadores",
        "objective": "Representar al club mediante desempeño deportivo, disciplina y compromiso institucional.",
        "description": "Es responsable de participar activamente en procesos de formación y competencia, asegurando rendimiento, compromiso y alineación a la filosofía del Club Deportivo.",
        "rep": "Desempeño competitivo, alineación con la visión y los valores del Club."
      },
      {
        "positionName": "Director Técnico TDP Varonil",
        "objective": "Dirigir y formar jugadores del equipo TDP varonil asegurando rendimiento competitivo y desarrollo integral del jugador.",
        "description": "Es responsable de liderar procesos de entrenamiento, competencia y formación deportiva del equipo TDP varonil asegurando disciplina, metodología y competitividad.",
        "rep": "Un equipo formativo y competitivo alineado a la metodología deportiva institucional."
      },
      {
        "positionName": "Director Técnico TDP Femenil",
        "objective": "Dirigir y formar jugadoras del equipo TDP femenil asegurando rendimiento competitivo y desarrollo integral de la jugadora.",
        "description": "Es responsable de liderar procesos de entrenamiento, competencia y formación deportiva del equipo TDP femenil asegurando disciplina, metodología y competitividad.",
        "rep": "Un equipo formativo y competitivo, alineado a la metodología deportiva institucional."
      },
      {
        "positionName": "Coordinador Administrativo",
        "objective": "Supervisar el uso y aplicación de recursos y procesos administrativos garantizando control, cumplimiento y soporte operativo.",
        "description": "Es responsable de supervisar procesos administrativos, financieros y de soporte institucional asegurando orden organizacional y cumplimiento operativo.",
        "rep": "Procesos administrativos ordenados, eficientes y alineados a la operación del club."
      },
      {
        "positionName": "Ejecutivo De Cuentas De Finanzas",
        "objective": "Gestionar cuentas, pagos y procesos financieros, garantizando control y estabilidad administrativa.",
        "description": "Es responsable de administrar movimientos financieros, seguimiento de pagos y control económico del club, asegurando orden y cumplimiento financiero.",
        "rep": "Recursos financieros controlados y administrados con estabilidad y cumplimiento."
      },
      {
        "positionName": "Especialista Enlace FMF",
        "objective": "Gestionar trámites, registros y cumplimiento ante FMF, asegurando alineación regulatoria del club.",
        "description": "Es responsable de coordinar procesos administrativos y deportivos relacionados con la Federación Mexicana de Futbol, asegurando cumplimiento documental y normativo en todas las categorías que participa el club.",
        "rep": "Procesos federativos gestionados correctamente y alineados a normativas oficiales."
      },
      {
        "positionName": "Director Operativo",
        "objective": "Supervisar y optimizar la operación institucional, asegurando continuidad, logística y soporte operativo.",
        "description": "Es responsable de garantizar el correcto funcionamiento operativo del club mediante supervisión logística, administrativa y de infraestructura.",
        "rep": "Una operación eficiente, segura y funcional alineada a la operación deportiva del club."
      },
      {
        "positionName": "Secretario Técnico Premier",
        "objective": "Gestionar documentación, logística y soporte operativo del equipo Premier.",
        "description": "Es responsable de coordinar registros, programación y seguimiento operativo del equipo Premier asegurando orden y cumplimiento organizacional.",
        "rep": "Procesos administrativos y deportivos ejecutados con control y seguimiento eficiente."
      },
      {
        "positionName": "Secretario Técnico TDP Varonil",
        "objective": "Gestionar documentación, logística y soporte operativo del equipo TDP Varonil.",
        "description": "Es responsable de coordinar registros, programación y seguimiento operativo del equipo TDP Varonil, asegurando orden y cumplimiento organizacional.",
        "rep": "Procesos administrativos y deportivos ejecutados con control y seguimiento eficiente."
      },
      {
        "positionName": "Secretario Técnico TDP Femenil",
        "objective": "Gestionar documentación, logística y soporte operativo del equipo TDP Femenil.",
        "description": "Es responsable de coordinar registros, programación y seguimiento operativo del equipo TDP Femenil, asegurando orden y cumplimiento organizacional.",
        "rep": "Procesos administrativos y deportivos ejecutados con control y seguimiento eficiente."
      },
      {
        "positionName": "Coordinador De Gestión E Infraestructura",
        "objective": "Supervisar infraestructura, logística y mantenimiento, asegurando operación óptima.",
        "description": "Es responsable de coordinar mantenimiento, logística y funcionamiento, asegurando continuidad operativa y condiciones adecuadas.",
        "rep": "Instalaciones deportivas, infraestructura y equipamiento, seguros y disponibles para la operación del club."
      },
      {
        "positionName": "Chofer",
        "objective": "Ejecutar traslados garantizando seguridad, puntualidad y cumplimiento logístico.",
        "description": "Es responsable de realizar traslados oficiales del club asegurando seguridad, orden y cumplimiento de itinerarios deportivos y administrativos.",
        "rep": "Traslados seguros, puntuales y eficientes para equipos y personal del club."
      },
      {
        "positionName": "Campero",
        "objective": "Mantener y preparar áreas deportivas, garantizando funcionalidad y presentación adecuada.",
        "description": "Es responsable de acondicionar, mantener y supervisar las condiciones de canchas deportivas.",
        "rep": "Campos funcionales y en óptimas condiciones para entrenamiento y competencias."
      },
      {
        "positionName": "Experiencia Al Cliente",
        "objective": "Gestionar la experiencia integral del cliente asegurando atención, comunicación, seguimiento postventa y vinculación efectiva entre las áreas comercial, marketing y operación del club.",
        "description": "Es responsable de brindar atención, seguimiento y acompañamiento a clientes, patrocinadores y comunidad del Club, asegurando una experiencia positiva y continua. Funciona como vínculo estratégico entre comercial y marketing; coordinando comunicación institucional, seguimiento postventa y fidelización del cliente con el club.",
        "rep": "Clientes atendidos, acompañados y fidelizados alineados a la identidad y posicionamiento del club."
      },
      {
        "positionName": "Nutriólogo Deportivo",
        "objective": "Diseñar y supervisar planes nutricionales que fortalezcan el rendimiento físico, recuperación y bienestar integral de los jugadores.",
        "description": "Es responsable de evaluar, planificar y dar seguimiento nutricional a los jugadores del Club, asegurando alimentación adecuada.",
        "rep": "Nutrición adecuada para el alto reandimiento deportivo de los jugadores."
      },
      {
        "positionName": "Psicólogo Deportivo",
        "objective": "Brindar acompañamiento psicológico y emocional fortaleciendo el bienestar mental, disciplina y desempeño competitivo de los jugadores.",
        "description": "Es responsable de proporcionar orientación, seguimiento y acompañamiento psicológico a jugadores y cuerpos técnicos, fortaleciendo estabilidad emocional, manejo de presión, motivación, integración grupal y desarrollo humano dentro del Club Deportiv.",
        "rep": "Jugadores emocionalmente fortalecidos, enfocados y alineados al alto rendimiento deportivo y humano."
      }
    ]
  },
  {
    "unitId": "fundacion-dante-eludier",
    "unitName": "Fundación Dante Eludier",
    "sourceFile": "Focus_Diario_Fundación_Dante_Eludier.docx",
    "positions": [
      {
        "positionName": "Director General UDN",
        "objective": "Dirigir y supervisar la operación integral de la Fundación, impulsando el cumplimiento del propósito social, la sostenibilidad financiera y la alineación con el Corporativo de Axen Capital.",
        "description": "Es responsable de la conducción estratégica de la fundación Dante Eludier, asegurando la correcta ejecución de los productos, el cumplimiento normativo como A.C. y la representación institucional ante donantes, aliados y autoridades.",
        "rep": "Una fundación viable, sostenible y de impacto con crecimiento nacional en cobertura y procuración de fondos."
      },
      {
        "positionName": "Coordinador De Procuración De Fondos",
        "objective": "Diseñar y ejecutar estrategias de procuración de fondos y alianzas institucionales.",
        "description": "Es responsable de la procuración de fondos, mediante estrategias, campañas, eventos y otras iniciativas. Prospecta, cultiva y fideliza donantes individuales y corporativos; gestiona alianzas estratégicas con empresas, fundaciones y organismos públicos o privados. Diseña propuestas de valor para donantes, coordina eventos de recaudación, administra la base de datos de donantes y reporta métricas de captación al Director General, asegurando el flujo de recursos necesario para la operación continua de los productos de la Fundación.",
        "rep": "Procuración de fondos suficientes para garantizar la sostenibilidad financiera y la expansión del impacto de la Fundación."
      },
      {
        "positionName": "Coordinador De Responsabilidad Social",
        "objective": "Diseñar, ejecutar y dar seguimiento a las solicitudes de los programas sociales de la Fundación, garantizando la atención integral a los beneficiarios, el vínculo con sus familias.",
        "description": "Es responsable de recibir, evaluar y dar seguimiento a las solicitudes de los productos y/o servicios sociales. Gestiona la relación directa con familias beneficiarias y documenta el impacto social generado.",
        "rep": "Solicitudes atendidas, procesadas y vinculadas en tiempo y forma."
      },
      {
        "positionName": "Ejecutivo De Cuentas Y Finanzas",
        "objective": "Controlar y administrar los ingresos por procuración de fondos y los egresos operativos de la Fundación, garantizando la transparencia financiera, el cumplimiento fiscal como A.C. y la correcta rendición de cuentas a donantes y al Corporativo Axen Capital.",
        "description": "Es responsable de la gestión financiera integral de la Fundación Dante Eludier: procuración de fondos y control presupuestal de los productos. Entrega la información de comprobantes fiscales de donativos, para la elaboración de reportes financieros y cumplimiento de obligaciones ante el SAT y autoridades regulatorias aplicables a asociaciones civiles.",
        "rep": "Procuración de fondos administrados y reportados con transparencia, solvencia y cumplimiento normativo."
      },
      {
        "positionName": "Coordinador De Activaciones",
        "objective": "Planificar, coordinar y ejecutar activaciones, campañas y actividades institucionales que fortalezcan la visibilidad, participación, procuración de fondos y sensibilización social de la Fundación.",
        "description": "Es responsable de diseñar, coordinar y supervisar la ejecución de activaciones comunitarias, campañas de concientización, jornadas de inclusión, eventos de procuración de fondos y actividades institucionales, garantizando el cumplimiento de los objetivos establecidos.",
        "rep": "Activaciones y campañas ejecutadas con calidad, impacto social y cumplimiento de objetivos institucionales."
      },
      {
        "positionName": "Voluntariado De Procuración De Fondos",
        "objective": "Apoyar en la identificación, gestión y seguimiento de oportunidades de procuración de fondos mediante la promoción de campañas.",
        "description": "Colaborar con la Fundación en la promoción y ejecución de acciones orientadas a la procuración de fondos, materiales y apoyos institucionales. Participa en actividades de sensibilización, campañas de donación, acercamiento con empresas y búsqueda de donantes potenciales, vinculación con aliados estratégicos y participación en actividades de recaudación.",
        "rep": "Recursos y apoyos gestionados que contribuyan a la expansión de la Fundación."
      },
      {
        "positionName": "Voluntariado De Activaciones",
        "objective": "Brindar apoyo operativo, logístico y de atención durante la ejecución de activaciones y campañas de la Fundación.",
        "description": "Apoya en actividades de logística, montaje, atención a participantes, registro, difusión, distribución de materiales y recopilación de evidencias.",
        "rep": "Activaciones de campañas apoyadas de manera eficiente y organizada."
      }
    ]
  },
  {
    "unitId": "marca-dante-eludier",
    "unitName": "Marca Dante Eludier",
    "sourceFile": "Focus_Diario_Marca_Dante_Eludier.docx",
    "positions": [
      {
        "positionName": "Director General UDN",
        "objective": "Liderar la visión, filosofía y estrategia integral de la marca, asegurando coherencia, expansión e impacto positivo en audiencias, proyectos y comunidades.",
        "description": "Es responsable de representar la esencia de la marca, desarrollar contenido estratégico, generar relaciones de alto valor y liderar iniciativas que fortalezcan el posicionamiento, credibilidad y expansión de Dante Eludier.",
        "rep": "Una marca personal, sólida, influyente y trascendente con crecimiento sostenible y alto posicionamiento."
      },
      {
        "positionName": "Gerente De Diseño De Experiencias",
        "objective": "Diseñar, desarrollar, coordinar y supervisar experiencias, eventos y activaciones que fortalezcan el posicionamiento y conexión emocional con la audiencia.",
        "description": "Es responsable de conceptualizar, planificar y ejecutar experiencias presenciales y digitales que traduzcan la filosofía de Dante Eludier en momentos de alto valor para participantes, aliados y comunidades.",
        "rep": "Experiencias memorables alineadas a la filosofía y propósito de la marca."
      },
      {
        "positionName": "Coordinador De Eventos",
        "objective": "Coordinar la logística y operación de eventos, asegurando excelencia en la ejecución y satisfacción de asistentes.",
        "description": "Es responsable de presupuestar y organizar proveedores, logística, cronogramas, materiales y operación general de eventos, garantizando la coherencia entre el diseño y el desarrollo de la experiencia, alineado a la marca Dante Eludier.",
        "rep": "Eventos ejecutados exitosamente con calidad, organización y experiencia memorable."
      },
      {
        "positionName": "Ejecutivo De Cuentas De Finanzas",
        "objective": "Gestionar ingresos, egresos, presupuestos y procesos administrativos asegurando control financiero y sostenibilidad operativa.",
        "description": "Es responsable de administrar cuentas, cobranzas, pagos, facturación, presupuestos, reportes financieros y control administrativo de la marca, garantizando orden y cumplimiento financiero y contable, así como inventarios.",
        "rep": "Recursos financieros controlados y administrados con estabilidad y cumplimiento."
      },
      {
        "positionName": "Enlace Comercial",
        "objective": "Desarrollar y fortalecer relaciones estratégicas que impulsen oportunidades comerciales y posicionamiento de la marca.",
        "description": "Es responsable de identificar oportunidades de negocio, coordinar propuestas comerciales, generar relaciones institucionales y dar seguimiento a proyectos comerciales alineados con la marca personal.",
        "rep": "Alto volumen de ventas de los productos y/o servicios de la UDN."
      },
      {
        "positionName": "Enlace De Comunicación",
        "objective": "Coordinar y supervisar la comunicación de la marca, asegurando coherencia de mensajes, campañas y posicionamiento.",
        "description": "Es responsable de vincular la estrategia de comunicación de Dante Eludier, garantizando alineación de contenido, narrativa, imagen y difusión institucional. Supervisa y da seguimiento al área de atención al cliente.",
        "rep": "Comunicación institucional alineada, estratégica y consistente con la filosofía de la marca."
      },
      {
        "positionName": "Atención Al Cliente",
        "objective": "Brindar atención, acompañamiento y seguimiento a clientes, asistentes y comunidad fortaleciendo relaciones y satisfacción.",
        "description": "Es responsable de gestionar solicitudes, resolver dudas, coordinar seguimiento de preventa, venta y postventa y mantener comunicación cercana con participantes, clientes y prospectos de la marca.",
        "rep": "Audiencias, participantes y clientes atendidos oportunamente con seguimiento efectivo y experiencia positiva."
      }
    ]
  },
  {
    "unitId": "vital-xtation",
    "unitName": "Vital Xtation",
    "sourceFile": "Focus_Diario_Vital_Xtation.docx",
    "positions": [
      {
        "positionName": "Director General UDN",
        "objective": "Vigilar la gestión integral de AXEN LIFE, verificando que las operaciones, administración y toma de decisiones se realicen conforme a la normatividad aplicable, estatutos sociales y mejores prácticas de gobierno corporativo.",
        "description": "Es responsable de liderar la operación integral de Vital Xtation garantizando el cumplimiento de objetivos financieros, comerciales y operativos, promoviendo una cultura de servicio, innovación y mejora continua que impulse el crecimiento sostenible del negocio.",
        "rep": "Una unidad de negocio rentable, sostenible, reconocida y aceptada"
      },
      {
        "positionName": "Gerente Operativo",
        "objective": "Dirigir y coordinar la operación diaria garantizando productividad, calidad de alimentos, experiencia del cliente y cumplimiento de estándares operativos.",
        "description": "Es responsable de supervisar las áreas operativas asegurando la correcta ejecución de procesos, la administración eficiente de recursos y el cumplimiento de los estándares de servicio y calidad establecidos por la organización.",
        "rep": "Una operación eficiente, consistente y alineada a los estándares de calidad, servicio y rentabilidad de Vital Xtation."
      },
      {
        "positionName": "Gerente De Compras Y Cadenas Y Suministros",
        "objective": "Gestionar el abastecimiento de insumos, materiales y productos garantizando disponibilidad, calidad y eficiencia en costos.",
        "description": "Es responsable de planificar, adquirir y controlar los insumos requeridos para la operación, desarrollando proveedores estratégicos y asegurando la continuidad del suministro para todas las áreas del negocio.",
        "rep": "Insumos y productos disponibles oportunamente con calidad, frescura y costos competitivos."
      },
      {
        "positionName": "Chef Ejecutivo",
        "objective": "Diseñar, supervisar y estandarizar la preparación de alimentos garantizando calidad nutricional, sabor, presentación y rentabilidad.",
        "description": "Es responsable de liderar la producción culinaria, desarrollar recetas, controlar estándares de calidad y asegurar la correcta ejecución de los procesos de cocina manteniendo la propuesta saludable de la marca.",
        "rep": "Una oferta gastronómica saludable, innovadora y consistente."
      },
      {
        "positionName": "Cocinero",
        "objective": "Elaborar y presentar los alimentos conforme a recetas, procedimientos y estándares establecidos, garantizando calidad nutricional, sabor y tiempos de entrega.",
        "description": "Es responsable de preparar los alimentos y bebidas del menú, asegurando el cumplimiento de las recetas, estándares de inocuidad, presentación y calidad definidos por la organización, contribuyendo a una experiencia satisfactoria para el cliente.",
        "rep": "Alimentos saludables preparados con calidad, consistencia y oportunamente."
      },
      {
        "positionName": "Auxiliar De Cocina",
        "objective": "Apoyar las actividades de preparación, organización y limpieza de la cocina garantizando continuidad y eficiencia operativa.",
        "description": "Es responsable de realizar actividades de apoyo en la preparación de ingredientes, organización de insumos, limpieza de áreas de trabajo y asistencia al equipo de cocina para asegurar una operación fluida y eficiente.",
        "rep": "Procesos de preparación eficientes y ordenados que facilitan la producción oportuna de alimentos saludables."
      },
      {
        "positionName": "Lavaloza",
        "objective": "Mantener la limpieza y sanitización de utensilios, equipos y áreas asignadas, garantizando condiciones óptimas para la operación.",
        "description": "Es responsable de lavar, sanitizar y organizar utensilios, equipos y materiales utilizados en la operación, contribuyendo al cumplimiento de los estándares de higiene, inocuidad y orden establecidos por Vital Xtation.",
        "rep": "Utensilios, equipos y áreas de trabajo limpios y disponibles para asegurar la continuidad operativa y los estándares de higiene."
      },
      {
        "positionName": "Líder De Servicio",
        "objective": "Coordinar y supervisar el servicio al cliente garantizando atención eficiente, experiencia positiva y cumplimiento de estándares de servicio.",
        "description": "Es responsable de liderar al equipo de atención al cliente asegurando rapidez, hospitalidad, orden y calidad en el servicio brindado a los clientes. Así como empaquetar y coordinar la entrega.",
        "rep": "Clientes satisfechos mediante una experiencia de atención ágil, cálida y alineada a la propuesta Fast & Healthy."
      },
      {
        "positionName": "Host",
        "objective": "Recibir, orientar y acompañar a los clientes asegurando una experiencia cordial, organizada y eficiente.",
        "description": "Es responsable de brindar la bienvenida a los clientes, gestionar la asignación de espacios, orientar sobre productos y apoyar la experiencia general de servicio.",
        "rep": "Clientes recibidos y orientados cálida y oportunamente."
      },
      {
        "positionName": "Mesero",
        "objective": "Brindar atención personalizada a los clientes durante su estancia, asegurando una experiencia positiva y alineada a los estándares de servicio.",
        "description": "Es responsable de atender a los clientes, tomar pedidos, entregar alimentos y bebidas, resolver necesidades durante el servicio y contribuir a una experiencia agradable, rápida y orientada al bienestar del consumidor.",
        "rep": "Clientes atendidos de manera ágil, cordial y eficiente."
      },
      {
        "positionName": "Barista",
        "objective": "Elaborar y servir bebidas de cafeteria conforme a los estándares de calidad, presentación y servicio definidos por la organización.",
        "description": "Es responsable de preparar bebidas, cafés y productos especializados, garantizando calidad, presentación, higiene y atención al cliente en cada servicio brindado.",
        "rep": "Bebidas saludables preparadas con calidad, consistencia y presentación adecuada."
      },
      {
        "positionName": "Encargado De Retail",
        "objective": "Administrar la venta de productos orgánicos garantizando disponibilidad, exhibición adecuada y crecimiento de las ventas retail.",
        "description": "Es responsable de gestionar el área de productos orgánicos, supervisando inventarios, exhibiciones y atención al cliente para maximizar las ventas y fortalecer la experiencia integral del consumidor.",
        "rep": "Un área retail rentable y atractiva que complemente la experiencia saludable de Vital Xtation."
      },
      {
        "positionName": "Ejecutivo De Cuentas Y Finanzas",
        "objective": "Administrar cuentas, flujos financieros, conciliación de cuentas, pagos y control administrativo asegurando estabilidad financiera y soporte a la operación.",
        "description": "Es responsable de gestionar inventarios, ingresos, egresos, presupuestos, pagos y reportes financieros garantizando control financiero, orden administrativo y disponibilidad de recursos para la operación.",
        "rep": "Recursos financieros administrados con control, liquidez y cumplimiento para la continuidad operativa del corporativo ."
      },
      {
        "positionName": "Caja",
        "objective": "Ejecutar correctamente las operaciones de cobro y facturación, garantizando precisión, control y calidad en la atención.",
        "description": "Es responsable de registrar ventas, recibir pagos y brindar atención cordial y eficiente a los clientes durante el proceso de compra.",
        "rep": "Transacciones seguras, precisas y ágiles."
      }
    ]
  }
];
