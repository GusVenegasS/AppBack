const mongoose = require('mongoose');

const BrigadaSchema = new mongoose.Schema({
  brigada_id: { type: String, required: true, unique: true }, // Identificador único de la brigada
  nombre: { type: String, required: true }, // Nombre de la brigada
  actividad: { type: String, required: true }, // Actividad que realiza la brigada
  diaSemana: { type: String, enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'], required: true }, // Día de la semana
  usuarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }], // Referencia a los usuarios que participan
  fechaCreacion: { type: Date, default: Date.now }, // Fecha de creación de la brigada
  periodoAcademico: { type: mongoose.Schema.Types.ObjectId, ref: 'Periodo', required: true } // Referencia al período académico
});

module.exports = mongoose.model('Brigada', BrigadaSchema);
