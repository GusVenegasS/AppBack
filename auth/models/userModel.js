const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  usuario_id: { type: String, required: true },
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  telefono: { 
    type: String, 
    required: true, 
    validate: {
      validator: function (v) {
        return /^\d{8,10}$/.test(v);
      },
      message: (props) => `${props.value} no es un número de teléfono válido.`,
    },
  },
  brigadas: { type: [String], default: [] },
  imagenPerfil: { 
    type: String, 
    validate: {
      validator: function (v) {
        return !v || v.startsWith('data:image/') && v.length > 20;
      },
      message: (props) => `El valor proporcionado no es una imagen válida en formato base64.`,
    },
  },
  periodoAcademico: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  rol: { type: String, required: true },
});

module.exports = mongoose.model('Usuario', usuarioSchema);
