const mongoose = require('mongoose');

const PeriodoSchema = new mongoose.Schema({
  periodo: {
    type: String,
    required: true,
    unique: true, // El nombre del periodo debe ser único
    trim: true,
  },
  fechaInicio: {
    type: Date,
    required: true,
  },
  fechaFin: {
    type: Date,
    required: true,
  },
  estado: {
    type: String,
    enum: ['Activo', 'Inactivo'], // El estado solo puede ser Activo o Inactivo
    required: true,
  },
}, {
  timestamps: true, // Agrega campos de fecha de creación y última modificación
});

module.exports = mongoose.model('Periodo', PeriodoSchema);
