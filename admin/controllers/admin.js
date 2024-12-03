// admin.js
const db = require('../db');
const ExcelJS = require('exceljs');

async function verificarPeriodo(req, res) {
    console.log('periodoAVERIFICAR', req.query.periodo)
    try {
        const periodo = req.query.periodo;
        const existePeriodo = await buscarPeriodo("Appasear", "periodos", { periodo: periodo });
        console.log('existePeriodo', existePeriodo)
        if (!existePeriodo) {
            return res.status(404).send({ data: "periodo no encontrado", status: 404 })
        }

        if (!existePeriodo.estado) {
            return res.status(200).send({ status: 200, data: 'Periodo válido' })
        }

        if (existePeriodo.estado === 'activo') {
            const documento = {
                fechaInicio: existePeriodo.fechaInicio,
                fechaFin: existePeriodo.fechaFin,
                estado: 'activo'
            }
            return res.status(400).send({ status: 400, data: documento })
        }

        if (existePeriodo.estado === 'finalizado') {
            const documentoFinalizado = {
                fechaInicio: existePeriodo.fechaInicio,
                fechaFin: existePeriodo.fechaFin,
                estado: 'finalizado',
                fechaFinalización: existePeriodo.fechaFinalizacion
            };
            return res.status(400).send({ status: 410, data: documentoFinalizado });
        }

    } catch (error) {
        console.log('error', error)
        return res.status(500).send({ status: 500, message: "Error al verificar periodo" });
    }
}

async function crearPeriodo(req, res) {
    console.log('body', req.body);
    try {
        const { fechaInicio, fechaFin, periodoAcademico } = req.body;

        if (!fechaInicio || !fechaFin || !periodoAcademico) {
            return res.status(400).send({ message: "Las fechas no pueden estar vacías", status: 400 });
        }

        let fechaInicioPe = new Date(fechaInicio);
        let fechaFinPe = new Date(fechaFin);
        let fechaInicioDate = new Date(fechaInicio);
        fechaInicioDate.setUTCHours(fechaInicioDate.getUTCHours() + 5);
        let fechaFinDate = new Date(fechaFin);
        fechaFinDate.setUTCHours(fechaFinDate.getUTCHours() + 5);
        let fechaCreacion = new Date();
        console.log(fechaCreacion);
        fechaCreacion.setUTCHours(fechaCreacion.getUTCHours() - 5)

        if (fechaInicioDate >= fechaFinDate) {
            return res.status(400).send({ message: "La fecha de inicio debe ser anterior a la fecha de finalización", status: 401 });
        }

        // Verificar si ya existen brigadas y tareas para el periodo académico
        const brigadasExistentes = await buscarBrigada("Appasear", "Brigadas", { periodoAcademico });
        console.log("Brigadas", brigadasExistentes)
        const tareasExistentes = await buscarTareas("Appasear", "Tareas", { periodoAcademico });

        if (brigadasExistentes || tareasExistentes) {
            return res.status(400).send({ message: "Ya existen brigadas y/o tareas para este periodo académico", status: 402 });
        }

        const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes"];
        const brigadas = [
            { nombre: "Limpieza", actividad: "limpieza" },
            { nombre: "Paseo", actividad: "paseo" }
        ];

        for (const brigada of brigadas) {
            for (const diaSemana of diasSemana) {
                const documento = { nombre: `${brigada.nombre} ${diaSemana}`, periodoAcademico };
                const brigadaExistente = await buscarBrigada("Appasear", "Brigadas", documento);

                if (!brigadaExistente) {
                    const insert = {
                        brigada_id: `${brigada.nombre.toLowerCase().replace(/ /g, '')}-${diaSemana.toLowerCase()}`,
                        nombre: `${brigada.nombre} ${diaSemana}`,
                        actividad: brigada.actividad,
                        diaSemana: diaSemana,
                        usuarios: [],
                        fechaCreacion: fechaCreacion,
                        periodoAcademico
                    };
                    await saveDB("Appasear", "Brigadas", insert);
                }
            }
        }

        for (let fecha = fechaInicioDate; fecha <= fechaFinDate; fecha.setDate(fecha.getDate() + 1)) {
            const diaSemanaIndex = fecha.getDay();

            if (diaSemanaIndex >= 1 && diaSemanaIndex <= 5) {
                const diaSemana = diasSemana[diaSemanaIndex - 1];
                for (const brigada of brigadas) {
                    const brigadaNombre = `${brigada.nombre} ${diaSemana}`;
                    const brigadaExistente = await buscarBrigada("Appasear", "Brigadas", { nombre: brigadaNombre, periodoAcademico });

                    if (brigadaExistente) {
                        const fechaParse = new Date(fecha);
                        fechaParse.setSeconds(0);
                        fechaParse.setMilliseconds(0);
                        fechaParse.setHours(-5);
                        const tarea = {
                            tarea_id: `${brigada.nombre.toLowerCase()}-${fecha.toISOString().split('T')[0]}`,
                            brigada_id: brigadaExistente.brigada_id,
                            descripcion: `${brigada.actividad.charAt(0).toUpperCase() + brigada.actividad.slice(1)} ${fecha.toISOString().split('T')[0]}`,
                            fecha: fechaParse,
                            estado: "pendiente",
                            asistentes: [],
                            evidencia_id: null,
                            fechaCreacion: fechaCreacion,
                            observacion: null,
                            periodoAcademico
                        };
                        await saveDB("Appasear", "Tareas", tarea);
                    }
                }
            }
        }

        console.log("fechaaaas antes de enviar")
        console.log(fechaInicioDate)
        console.log(fechaFinDate)

        await actualizar("Appasear", "periodos", { periodo: periodoAcademico }, "activo", null, fechaInicioPe, fechaFinPe)

        return res.status(200).send({ message: "Tareas creadas correctamente", status: 200 });
    } catch (error) {
        console.error("Error al crear tareas:", error);
        return res.status(500).send({ message: "Error al crear tareas", status: 500 });
    }
}

async function obtenerBrigadas(req, res) {
    console.log(req.query);
    try {
        const periodoAcademico = req.query.periodoAcademico;
        if (!periodoAcademico) {
            return res.status(400).send({ message: "Período incorrecto", status: 400 });
        }
        const brigadas = await buscarBrigadas("Appasear", "Brigadas", { periodoAcademico });
        if (brigadas.length > 0) {
            return res.status(200).send(brigadas);
        } else {
            return res.status(404).send({ message: "No existen brigadas para este período academíco", status: 404 })
        }
    } catch (err) {
        console.error("Error al buscar brigadas:", err);
        return res.status(500).send({ message: "No eres tu, somos nosotros", status: 500 });
    }
}

async function obtenerUsuarios(req, res) {
    console.log(req.query);
    try {
        const periodoAcademico = req.query.periodoAcademico;
        if (!periodoAcademico) {
            return res.status(400).send({ message: "Período incorrecto", status: 400 });
        }
        const usuarios = await buscarBrigadas("Appasear", "usuarios", { periodoAcademico });
        if (usuarios.length > 0) {
            return res.status(200).send(usuarios);
        } else {
            return res.status(404).send({ message: "No existen usuarios para este período academíco", status: 404 })
        }
    } catch (err) {
        console.error("Error al buscar usuarios:", err);
        return res.status(500).send({ message: "No eres tu, somos nosotros", status: 500 });
    }
}

async function obtenerTarea(req, res) {
    console.log("query: " + req.query);
    try {
        const { periodoAcademico, fechaQuery, brigada_id } = req.query;
        const fecha = new Date(fechaQuery);
        // Eliminamos la hora, solo comparamos la fecha

        console.log("Periodo:", periodoAcademico);
        console.log("Fecha:", fecha);
        console.log("BrigadaID:", brigada_id);
        const tareas = await getTarea("Appasear", "Tareas", { periodoAcademico, fecha, brigada_id })
        console.log(tareas)
        if (tareas.length > 0) {
            return res.status(200).send(tareas);
        } else {
            return res.status(404).send({ message: "No existen tarea para esta fecha", status: 404 })
        }
    } catch (err) {
        console.error("Error al buscar tarea:", err);
        return res.status(500).send({ message: "No eres tu, somos nosotros", status: 500 });
    }

}

async function finalizarPeriodo(req, res) {
    let fechaFinalizacion = new Date();
    fechaFinalizacion.setUTCHours(fechaFinalizacion.getUTCHours() - 5);
    console.log('periodoaFinalizar', req.query.periodo)
    try {
        const periodo = req.query.periodo
        await actualizar("Appasear", "periodos", { periodo: periodo }, "finalizado", fechaFinalizacion);
        await siguientePeriodo("Appasear", "periodos");
        return res.status(200).send({ message: "Periodo finalizado exitosamente", status: 200 })
    } catch (err) {
        console.error("error al finalizar el periodo: " + err)
        return res.status(500).send({ message: "Error al finalizar el periodo", status: 500 });
    }
}

async function reporteAsistencias(req, res) {
    const periodoAcademico = req.query.periodoAcademico;
    console.log("intentando generar el excel")
    try {
        const usuarios = await buscarBrigadas("Appasear", "usuarios", { periodoAcademico })
        const tareas = await buscarBrigadas("Appasear", "Tareas", { periodoAcademico })

        const asistencias = await contarAsistencias(tareas, usuarios);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte de Asistencias');

        worksheet.columns = [
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Correo', key: 'correo', width: 30 },
            { header: 'Teléfono', key: 'telefono', width: 15 },
            { header: 'Total Asistencias', key: 'totalAsistencias', width: 20 },
        ];

        Object.values(asistencias).forEach(asistencia => {
            worksheet.addRow(asistencia);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_asistencias.xlsx');

        // Escribir el libro en la respuesta
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Error al crear el reporte" });
    }
}
async function buscarPeriodo(Base, Coleccion, documento) {
    console.log("Buscar", documento);
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        const result = await collection.findOne(documento);
        return result;
    } catch (error) {
        console.error("Error en la búsqueda:", err);
    }
}
async function buscarBrigada(Base, Coleccion, documento) {
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        const result = await collection.findOne(documento);
        return result;
    } catch (err) {
        console.error("Error en la búsqueda:", err);
        throw new Error("Error al realizar la búsqueda");
    }
}

async function buscarBrigadas(Base, Coleccion, documento) {
    console.log("Buscar", documento);
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        const result = await collection.find(documento).toArray();
        return result;
    } catch (err) {
        console.error("Error en la búsqueda:", err);
        throw new Error("Error al realizar la búsqueda");
    }
}

async function buscarTareas(Base, Coleccion, documento) {
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        const result = await collection.findOne(documento);
        return result;
    } catch (err) {
        console.error("Error en la búsqueda:", err);
        throw new Error("Error al realizar la búsqueda");
    }
}

async function getTarea(Base, Coleccion, documento) {
    console.log("Buscar", documento);
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        // Asegúrate de usar el operador $eq si buscas una coincidencia exacta
        const result = await collection.find({
            periodoAcademico: documento.periodoAcademico,
            brigada_id: documento.brigada_id,
            fecha: { $eq: documento.fecha }
        }).toArray();

        return result;
    } catch (err) {
        console.error("Error en la búsqueda:", err);
        throw new Error("Error al realizar la búsqueda");
    }
}

async function saveDB(Base, Coleccion, documento) {
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        const result = await collection.insertOne(documento);
        return result;
    } catch (err) {
        console.error("Error en la inserción:", err);
        throw new Error("Error al insertar el documento");
    }
}

async function actualizar(Base, Coleccion, documento, estado, fechaFinalizacion = null, fechaInicio = null, fechaFin = null) {
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    console.log("actualizaaaaaar")
    console.log(fechaInicio)
    console.log(fechaFin)
    // Construir el objeto de actualización dinámicamente
    const updateFields = { estado: estado };

    if (fechaInicio) {
        updateFields.fechaInicio = fechaInicio;
    }

    if (fechaFin) {
        updateFields.fechaFin = fechaFin;
    }

    if (fechaFinalizacion) {
        updateFields.fechaFinalizacion = fechaFinalizacion;
    }

    try {
        const result = await collection.updateOne(
            documento,
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            console.log("No se encontraron documentos para actualizar");
        } else {
            console.log("Documento actualizado");
        }
        return result;
    } catch (error) {
        console.error("Error en la actualización:", error);
        throw new Error("Error al insertar el documento");
    }
}

async function ultimoPeriodo(Base, Coleccion) {
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);

    try {
        const ultimoDocumento = await collection.findOne({}, { sort: { _id: -1 } });
        if (!ultimoDocumento) {
            return null;
        }
        return ultimoDocumento.periodo;
    } catch (error) {
        console.error("Error al obtener el último periodo:", error);
        throw new Error("Error al obtener el último periodo");
    }
}

async function siguientePeriodo(Base, Coleccion) {
    const client = db.get();
    const database = client.db(Base);
    const collection = database.collection(Coleccion);
    try {
        const periodoAnterior = await ultimoPeriodo(Base, Coleccion);
        const nuevoPeriodo = calcularPeriodo(periodoAnterior);
        await collection.insertOne({ periodo: nuevoPeriodo })
    } catch (error) {
        console.error("Error al crear nuevo periodo", error);
    }
}

function calcularPeriodo(ultimoPeriodo) {
    if (!ultimoPeriodo) {
        return "2024-A";
    }

    const [year, sem] = ultimoPeriodo.split("-");
    let nuevoYear = parseInt(year);
    let nuevoSem = sem === "A" ? "B" : "A";

    if (nuevoSem === "A") {
        nuevoYear += 1;
    }

    return `${nuevoYear}-${nuevoSem}`;
}

async function contarAsistencias(tareas, usuarios) {
    const asistencias = {};

    usuarios.forEach(usuario => {
        asistencias[usuario.usuario_id] = {
            nombre: usuario.nombre,
            correo: usuario.correo,
            telefono: usuario.telefono,
            totalAsistencias: 0,
        };
    });

    tareas.forEach(tarea => {
        tarea.asistentes.forEach(asistenteId => {
            if (asistencias[asistenteId]) {
                asistencias[asistenteId].totalAsistencias += 1;
            }
        });
    });

    return asistencias;
}

module.exports = {
    verificarPeriodo,
    crearPeriodo,
    obtenerBrigadas,
    obtenerUsuarios,
    obtenerTarea,
    finalizarPeriodo,
    reporteAsistencias
};
