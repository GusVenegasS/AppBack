const cron = require('node-cron');
const MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017";

cron.schedule("0 0 * * *", () => { // Ejecuta a medianoche todos los días
    console.log("Entre a ejecutar");
    start();
});

async function start() {
    try {
        // Conexión usando MongoClient
        const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

        const database = client.db("Appasear");

        // Ejecuta la función actualizar
        await actualizar(database);

        // Cierra la conexión después de la actualización
        client.close();
    } catch (err) {
        console.error("Error al conectar a MongoDB:", err);
    }
}

async function actualizar(database) {
    const fechaActual = new Date();
    fechaActual.setUTCHours(fechaActual.getUTCHours() - 5);

    const fechaInicio = new Date(fechaActual);
    fechaInicio.setUTCHours(0, 0, 0, 0);

    const fechaFin = new Date(fechaActual);
    fechaFin.setUTCHours(23, 59, 59, 999);

    try {
        // Actualiza las tareas con fecha menor a la fecha actual y estado "pendiente" a "vencida"
        const resultVencida = await database.collection("Tareas").updateMany(
            {
                fecha: { $lt: fechaInicio },
                estado: "pendiente"
            },
            {
                $set: { estado: "vencida" }
            }
        );

        // Actualiza las tareas con fecha igual a la fecha actual y estado "pendiente" a "por completar"
        const resultPorCompletar = await database.collection("Tareas").updateMany(
            {
                fecha: { $gte: fechaInicio, $lte: fechaFin },
                estado: "pendiente"
            },
            {
                $set: { estado: "por completar" }
            }
        );

        console.log(`${resultVencida.modifiedCount} tareas vencidas actualizadas.`);
        console.log(`${resultPorCompletar.modifiedCount} tareas por completar actualizadas.`);
    } catch (error) {
        console.log("No se actualizaron las tareas", error);
    }

    console.log("fechaActual", fechaActual);

    return Promise.resolve(); // Simula que la actualización ha sido exitosa
}
