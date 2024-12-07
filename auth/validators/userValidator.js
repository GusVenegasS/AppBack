const Usuario = require('../models/userModel');
const Joi = require('joi');

const userSchema = Joi.object({
  usuario_id: Joi.string().required(),
  nombre: Joi.string().min(3).max(30).required(),
  correo: Joi.string().email().required(),
  contraseña: Joi.string().min(8).required(),
  brigadas: Joi.array().items(Joi.string()),
});

const crearUsuario = async (req, res) => {
  // Validar datos de entrada
  const { error, value } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: 'Error de validación', error: error.details });
  }

  try {
    // Lógica para crear el usuario en la base de datos
    const nuevoUsuario = new Usuario(value); // Usa los datos validados
    await nuevoUsuario.save();
    res.status(201).json({ message: 'Usuario creado con éxito', usuario: nuevoUsuario });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear usuario', error: err.message });
  }
};

module.exports = { crearUsuario };
