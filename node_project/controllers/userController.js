const Usuario = require('../models/userModel');
const Periodo = require('../models/periodoModel');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Configurar el transportador de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ronnie.malo12@gmail.com', // Tu correo de Gmail
    pass: 'cquq ragm ugnl srab', // Contraseña de aplicación de Gmail
  },
});

// Crear usuarios desde un array y enviar correos
exports.createStudents = async (req, res) => {
  try {
    const estudiantes = req.body;

    if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron datos de estudiantes.' });
    }

    console.log(`Usuario autenticado: ${req.user.email}`); // Ejemplo de uso de datos del token

    const usuariosCreados = [];
    for (const estudiante of estudiantes) {
      try {
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(estudiante.password, 10);

        // Crear el usuario
        const usuario = new Usuario({
          usuario_id: new mongoose.Types.ObjectId().toString(),
          nombre: estudiante.name,
          correo: estudiante.email,
          contraseña: hashedPassword,
          telefono: estudiante.telefono,
        });

        await usuario.save();
        usuariosCreados.push(usuario);

        // Opciones para el correo
        const mailOptions = {
          from: 'ronnie.malo12@gmail.com',
          to: estudiante.email,
          subject: 'Bienvenido a la plataforma',
          text: `Hola ${estudiante.name}, tu cuenta ha sido creada exitosamente. 
          
          Tu contraseña es: ${estudiante.password}.
          Por favor, cámbiala después de iniciar sesión.`,
        };

        // Enviar el correo
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`Error al enviar correo a ${estudiante.email}:`, error);
          } else {
            console.log(`Correo enviado a ${estudiante.email}:`, info.response);
          }
        });
      } catch (err) {
        if (err.code === 11000) {
          console.error(`El correo ${estudiante.email} ya existe.`);
        } else {
          throw err;
        }
      }
    }

    if (usuariosCreados.length === 0) {
      return res.status(400).json({ message: 'No se pudieron crear los usuarios. Verifica si los correos ya existen.' });
    }

    res.status(201).json({ message: 'Usuarios creados y correos enviados exitosamente', usuarios: usuariosCreados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar los usuarios', error });
  }
};


// Login de usuario
exports.login = async (req, res) => {
  const { email, password, periodo} = req.body;

  try {
    const usuario = await Usuario.findOne({ correo: email });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, usuario.contraseña);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar el token
    const token = jwt.sign(
      { id: usuario._id, email: usuario.correo, rol: usuario.rol, periodo: periodo,},
      process.env.JWT_SECRET || 'clave_secreta', // Usa una clave secreta en las variables de entorno
      { expiresIn: '1h' } // Expiración del token
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { id: usuario._id, name: usuario.nombre, email: usuario.correo, rol: usuario.rol, periodo },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    console.log('Usuario ID recibido del token:', req.usuario.id); // Log de depuración

    const usuario = await Usuario.findOne({ _id: req.usuario.id });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      brigadas: usuario.brigadas,
    });
  } catch (err) {
    console.log('Error:', err);  // Log para errores específicos
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPeriodos = async (req, res) => {
  try {
    // Obtener todos los documentos y devolver solo el campo 'periodo'
    const periodos = await Periodo.find({}, 'periodo');
    const nombres = periodos.map((periodo) => periodo.periodo); // Extraer solo los nombres
    res.status(200).json(nombres); // Devolver solo los nombres de los períodos
  } catch (error) {
    console.error('Error al obtener los períodos:', error);
    res.status(500).json({ message: 'Error al obtener los períodos' });
  }
};
