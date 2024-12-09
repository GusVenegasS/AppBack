require('dotenv').config(); // Cargar variables de entorno
const Usuario = require('../models/userModel');
const Periodo = require('../models/periodoModel');
const bcrypt = require('bcrypt');
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

    if (!req.usuario || req.usuario.rol !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
    }

    if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron datos de estudiantes.' });
    }

    console.log(`Usuario autenticado: ${req.usuario.email}`); // Ejemplo de uso de datos del token

    const usuariosCreados = [];
    for (const estudiante of estudiantes) {
      try {
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(estudiante.password, 10);

        // Crear el usuario
        const usuario = new Usuario({
          usuario_id: estudiante.usuarioId,
          nombre: estudiante.name,
          correo: estudiante.email,
          contraseña: hashedPassword,
          telefono: estudiante.telefono,
          rol: estudiante.rol,
          periodoAcademico: req.usuario.periodo,
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
  const { email, password, periodo } = req.body;

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
      { id: usuario.usuario_id, email: usuario.correo, rol: usuario.rol, periodo: periodo, },
      process.env.JWT_SECRET || 'clave_secreta', // Usa una clave secreta en las variables de entorno
      { expiresIn: '1h' } // Expiración del token
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { id: usuario.usuario_id, name: usuario.nombre, email: usuario.correo, rol: usuario.rol, periodo },

    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    console.log('Usuario ID recibido del token:', req.usuario.id); // Log de depuración

    const usuario = await Usuario.findOne({ usuario_id: req.usuario.id });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      brigadas: usuario.brigadas,
      imagenPerfil: usuario.imagenPerfil,
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

exports.actualizarTelefono = async (req, res) => {
  try {
    const userId = req.usuario.id; // Asumimos que el middleware extrae el ID del usuario autenticado
    const { telefono } = req.body;

    const usuario = await Usuario.findOneAndUpdate({ usuario_id: req.usuario.id }, { telefono },
      { new: true });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!telefono || !/^\d{8,10}$/.test(telefono)) {
      return res.status(400).json({ error: 'Número de teléfono no válido.' });
    }

    res.json({ mensaje: 'Número de teléfono actualizado con éxito.', usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

exports.cambiarContrasena = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar nueva contraseña aleatoria
    const nuevaContrasena = Array(12)
      .fill(null)
      .map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'[Math.floor(Math.random() * 72)])
      .join('');

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizar contraseña
    usuario.contraseña = hashedPassword;
    await usuario.save();

    // Enviar correo con la nueva contraseña
    const mailOptions = {
      from: 'ronnie.malo12@gmail.com',
      to: correo,
      subject: 'Contraseña actualizada',
      text: `Hola ${usuario.nombre}, tu contraseña ha sido actualizada con éxito. 
      
      Tu nueva contraseña es: ${nuevaContrasena}.
      Por favor, cámbiala después de iniciar sesión.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`Error al enviar correo a ${correo}:`, error);
        return res.status(500).json({ message: 'Error al enviar correo', error });
      } else {
        console.log(`Correo enviado a ${correo}:`, info.response);
      }
    });

    res.status(200).json({ message: 'Contraseña actualizada y correo enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cambiar la contraseña', error });
  }
};

exports.updateProfilePhoto = async (req, res) => {
  try {
    const { imagenPerfil } = req.body;

    if (!imagenPerfil) {
      return res.status(400).json({ message: 'Imagen de perfil requerida.' });
    }

    const usuario = await Usuario.findOneAndUpdate(
      { usuario_id: req.usuario.id }, // ID del usuario autenticado
      { imagenPerfil }, // Actualiza la imagen de perfil
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ message: 'Imagen de perfil actualizada con éxito.', imagenPerfil: usuario.imagenPerfil });
  } catch (error) {
    console.error('Error al actualizar la foto de perfil:', error);
    res.status(500).json({ message: 'Error del servidor al guardar la imagen de perfil.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Validación de la nueva contraseña (por ejemplo, mínimo 8 caracteres)
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }

    // Recuperar al usuario desde la base de datos usando el ID del token
    const usuarioId = req.usuario?.id; // Asegúrate de que `req.usuario` tenga el ID
    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuario no autorizado.' });
    }

    const usuario = await Usuario.findOne({ usuario_id: req.usuario.id }); // Consulta el documento desde la base de datos
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Encriptar la nueva contraseña y guardarla
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    usuario.contraseña = hashedPassword;
    await usuario.save({ validateBeforeSave: false });

    return res.status(200).json({ message: 'Contraseña cambiada correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Ocurrió un error al cambiar la contraseña.' });
  }
};
